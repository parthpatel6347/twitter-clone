from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core import paginator
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator

from django.db.models import Count


from .models import User, Post, Like, Follower


def index(request):
    return render(request, "network/index.html")


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
            return render(
                request,
                "network/login.html",
                {"message": "Invalid username and/or password."},
            )
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
            return render(
                request, "network/register.html", {"message": "Passwords must match."}
            )

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(
                request, "network/register.html", {"message": "Username already taken."}
            )
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@csrf_exempt
@login_required
def post(request):

    # Only POST requests permitted for making new posts.
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # get data from user input
    data = json.loads(request.body)

    # Create and save post object
    new_post = Post(user=request.user, content=data.get("post"))

    new_post.save()

    return JsonResponse({"message": "Posted successfully."}, status=201)


def view_posts(request):

    posts = Post.objects.all()

    # Return posts in reverse chronologial order
    posts = posts.order_by("-timestamp").all()

    return JsonResponse([post.serialize() for post in posts], safe=False)


def profile(request, id):

    req_user = User.objects.get(id=id)

    followers = req_user.followers.all().count()
    following = req_user.following.all().count()
    posts = (
        req_user.posts.all().order_by("-timestamp").annotate(likes=Count("liked_by"))
    )

    if Follower.objects.filter(user=req_user, follower=request.user).exists():
        is_followed = True
    else:
        is_followed = False

    paginator = Paginator(posts, 10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)

    return render(
        request,
        "network/profile.html",
        {
            "req_user": req_user,
            "followers": followers,
            "following": following,
            "page_obj": page_obj,
            "is_followed": is_followed,
        },
    )


@login_required
def following(request):

    # Get users that are followed by logged in user
    following = Follower.objects.values_list("user", flat=True).filter(
        follower=request.user
    )

    # Get all posts by those users, ordered in reverese chronological order, and add a likes count
    posts = (
        Post.objects.filter(user_id__in=following)
        .order_by("-timestamp")
        .annotate(likes=Count("liked_by"))
    )

    paginator = Paginator(posts, 10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)

    return render(request, "network/following.html", {"page_obj": page_obj})


@login_required
def toggle_follow(request):

    user = request.user

    # Only POST requests permitted for following or unfollowing.
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    if request.POST.get("unfollow", ""):
        user_profile = request.POST["unfollow"]
        Follower.objects.filter(user=user_profile, follower=user).delete()

    elif request.POST.get("follow", ""):
        user_profile = request.POST["follow"]
        newfollow = Follower(user_id=user_profile, follower=user)
        newfollow.save()

    return HttpResponseRedirect(reverse("profile", args=(user_profile,)))


@csrf_exempt
@login_required
def edit(request, id):

    data = json.loads(request.body)
    print(data.get("content"))

    post = Post.objects.get(id=id)

    post.content = data.get("content")

    print(post.user)
    print(request.user)

    if post.user == request.user:
        post.save()

        return JsonResponse({"content": post.content})

    else:
        return JsonResponse({"error": "Forbidden"}, status=403)


@csrf_exempt
@login_required
def like(request, id):

    user = request.user

    data = json.loads(request.body)

    post = Post.objects.get(id=id)

    if data.get("action") == "like":
        new_like = Like(user=user, post_id=id)
        new_like.save()
        return JsonResponse(post.serialize())

    if data.get("action") == "cancel_like":

        Like.objects.filter(user=user, post_id=id).delete()
        return JsonResponse(post.serialize())
