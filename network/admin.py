from django.contrib import admin

# Register your models here.
from .models import User
from .models import Post
from .models import Comment

admin.site.register(User)

admin.site.register(Post)

admin.site.register(Comment)
