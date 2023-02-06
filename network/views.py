from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
import json
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import User
from .models import Post
from .models import Comment

from .utill import is_user_following
from .utill import add_like
from .utill import follow_unfollow
from .utill import liked_by_user


def index(request):
    posts = Post.objects.all();
    paginator = Paginator(posts, 10)

    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    return render(request, "network/index.html", {
        "page_obj": page_obj
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@login_required
def submit_post (request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    data = json.loads(request.body)
    text = data.get("post_text")

    new_post = Post(user=request.user, post_text=text)
    new_post.save()
    return JsonResponse({"message": "Post successfully added!"}, status=201)


def profile(request, name):
    
    if request.method == "PUT":    
        follow_unfollow(request, name)
        return JsonResponse({"message": "Followed user successfully."}, status=200)
 
    user = User.objects.get(username=name)
    posts = user.poster.all()
    following = is_user_following (request, name)

    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    return render(request, "network/index.html", {
        "name": name,
        "page_obj": page_obj,
        "profile_user": user,
        "following": following
    })

def following_post(request):
    
    user = User.objects.get(username=request.user)
    following_users = user.following.all()
    posts = Post.objects.filter(user__in=following_users)
    


    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    return render(request, "network/index.html", {
        "page_obj": page_obj
    })

def edit (request, post_id):
    post = Post.objects.get(id=post_id)

    if request.method == "PUT":
        data = json.loads(request.body)
        text = data.get("post_text")
        post.post_text = text
        post.save()
        return JsonResponse ({"message": "New text saved!"})
    else:
        return JsonResponse(post.serialize())

def like (request, post_id):
    
    if request.method == "GET":
        if liked_by_user(request, post_id) is True:
            return JsonResponse({"liked": "true"})
        else:
            return JsonResponse({"liked": "false"})
    if request.method == "PUT":
        add_like(request, post_id)

    return JsonResponse({"312": "nothings!"})

@login_required
def auth_check(request):
    return JsonResponse({'authenticated': True})

def comment(request, post_id):
    post = Post.objects.get(id=post_id)

    if request.method == "POST":
        data = json.loads(request.body)
        text = data.get("comment")
        if text is not None:
            comment_post = Comment(user_commenter=request.user, text_comment=text)
            comment_post.save()
            post.comment.add(comment_post)
            post.save()
            
            return JsonResponse ({"message": "New comment put through!"})
        else:
            return JsonResponse ({"error": "The comment field is required."}) 
    else:
        return JsonResponse(post.serialize())
    