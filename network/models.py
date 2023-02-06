from django.contrib.auth.models import AbstractUser
from django.db import models
import pytz

class User(AbstractUser):
    follower_amount = models.IntegerField(default=0)
    followers = models.ManyToManyField('self', symmetrical=False, related_name='following')
    following_amount = models.IntegerField(default=0)

    def serialize(self):
        return {
            "follower_amount": self.follower_amount,
            "followers": [follower.username for follower in self.followers.all()],
            "following": [following.username for following in self.following.all()],
            "following_amount": self.following_amount,
        }

    def __str__(self):
        return self.username
 
    
class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="poster")
    timestamp = models.DateTimeField(auto_now_add=True)
    post_text = models.TextField(blank=True)
    likes = models.IntegerField(default=0)
    liked_by = models.ManyToManyField(User, related_name='liked_posts')
    comment = models.ManyToManyField('Comment', related_name='commented')

    def serialize(self):
        local_time = self.timestamp.astimezone(pytz.timezone("Australia/NSW"))
        formatted_time = local_time.strftime("%b. %d, %Y, %I:%M %p")
        return {
            "user": str(self.user),
            "timestamp": formatted_time,
            "post_text": self.post_text,
            "likes" : self.likes,
            "commented": [comment.serialize() for comment in self.comment.all()]
        }

class Comment(models.Model):
    user_commenter = models.ForeignKey(User, on_delete=models.CASCADE) 
    text_comment = models.TextField(max_length=200)
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        local_time = self.timestamp.astimezone(pytz.timezone("Australia/NSW"))
        formatted_time = local_time.strftime("%b. %d, %Y, %I:%M %p")
        return {
            "user": str(self.user_commenter),
            "timestamp": formatted_time,
            "text_comment": self.text_comment,            
        }

    def __str__(self):
        return str(self.text_comment)



