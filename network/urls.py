from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("post", views.post, name="post"),
    path("view_posts", views.view_posts, name="view_posts"),
    path("profile/<str:id>", views.profile, name="profile"),
    path("/following", views.following, name="following"),
    path("/toggle_follow", views.toggle_follow, name="toggle_follow"),
]
