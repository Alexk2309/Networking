
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("profile/<str:name>", views.profile, name ="profile"),
    path("following", views.following_post, name ="following_post"),

    #API Routes
    path("submit-post", views.submit_post, name ='submit-post'),
    path("edit/<int:post_id>", views.edit, name ='edit-post'),
    path("like/<int:post_id>", views.like, name = "like"),
    path("auth", views.auth_check, name ='auth_check'),
    path("comment/<int:post_id>",views.comment, name ='comment')


    
]
