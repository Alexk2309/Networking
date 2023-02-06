from .models import User
from .models import Post

def is_user_following (request, name):
    signed_in_user = request.user
    user_profile = User.objects.get(username=name)

    if signed_in_user in user_profile.followers.all():
        return True
    else:
        return False

def follow_unfollow(request, name):
    signed_in_user = request.user
    user_follow = User.objects.get(username=name)
    following_user = User.objects.get(username=signed_in_user)


    if is_user_following(request, name) == True:
        user_follow.followers.remove(signed_in_user)
        following_user.following.remove(user_follow)
    else:
        user_follow.followers.add(signed_in_user)
        following_user.following.add(user_follow)

    user_follow.follower_amount = find_followers(user_follow, "follower")
    following_user.following_amount = find_followers(following_user, "following")


    user_follow.save()
    following_user.save()

def find_followers(user, type):
    index = 0
    if type == "follower":
        for follow in user.followers.all():
            index += 1
        return index
    else:
        for follow in user.following.all():
            index += 1
        return index

def liked_by_user(request, post_id):
    signed_in_user = request.user   
    post = Post.objects.get(id=post_id)

    if signed_in_user in post.liked_by.all():
        return True
    else:
        return False

def add_like (request, post_id):
    signed_in_user = request.user
    liked_post = Post.objects.get(id=post_id)
    if liked_by_user(request, post_id) == True:
        liked_post.liked_by.remove(signed_in_user)
    else:
        liked_post.liked_by.add(signed_in_user)

    liked_post.likes = find_likes(liked_post)
    liked_post.save()

def find_likes (post):
    index = 0
    for follow in post.liked_by.all():
        index += 1
    return index
  

