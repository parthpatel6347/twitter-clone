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

    # Get all posts, ordered by reverse chronological, and annotate each post with no.of likes
    posts = Post.objects.all().order_by("-timestamp").annotate(likes=Count("liked_by"))

    # Paginator
    paginator = Paginator(posts, 10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)

    return render(request, "network/index.html", {"page_obj": page_obj})


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


def profile(request, id):

    # Get user object of user whose profile view has been requested
    try:
        req_user = User.objects.get(id=id)
    except User.DoesNotExist:
        return render(
            request, "network/error.html", {"error": "User not found."}, status=404
        )

    # Get requested users followers and following count, and get all posts by that user
    followers = req_user.followers.all().count()
    following = req_user.following.all().count()
    posts = (
        req_user.posts.all().order_by("-timestamp").annotate(likes=Count("liked_by"))
    )

    # Check if the currently logged in user follows the requested user
    if Follower.objects.filter(user=req_user, follower=request.user).exists():
        is_followed = True
    else:
        is_followed = False

    # Paginator
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

    # Get logged in user
    user = request.user

    # Only POST requests permitted for following or unfollowing.
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # if request is to unfollow
    if request.POST.get("unfollow", ""):
        # get user id of user to be unfollowed
        user_profile = request.POST["unfollow"]

        # Delete follower entry with requested user and logged in user
        Follower.objects.filter(user=user_profile, follower=user).delete()

    # if request is to follow
    elif request.POST.get("follow", ""):

        # get user id to user to be followed
        user_profile = request.POST["follow"]

        # create and save new follower object with requested user and logged in user
        newfollow = Follower(user_id=user_profile, follower=user)
        newfollow.save()

    # redirect to profile page of requested user
    return HttpResponseRedirect(reverse("profile", args=(user_profile,)))


@csrf_exempt
@login_required
def edit(request, id):

    # Only PUT request permitted for editing posts
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)

    data = json.loads(request.body)

    # get post to be edited
    post = Post.objects.get(id=id)

    # set post content to new edited content
    post.content = data.get("content")

    # save post only if the creator of the post is the logged in user
    if post.user == request.user:
        post.save()
        return JsonResponse({"content": post.content})

    else:
        return JsonResponse({"error": "Forbidden"}, status=403)


@csrf_exempt
@login_required
def like(request, id):

    # Only PUT request permitted for liking/disliking posts
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)

    # get logged in user
    user = request.user

    data = json.loads(request.body)

    # get post to be liked or disliked
    post = Post.objects.get(id=id)

    # If post is to be liked
    if data.get("action") == "like":

        # Create and save new Like object with requested post and logged in user
        new_like = Like(user=user, post_id=id)
        new_like.save()
        return JsonResponse(post.serialize())

    # If like is to be cancelled
    elif data.get("action") == "cancel_like":

        # Get like object with requested post and logged in user and delete
        Like.objects.filter(user=user, post_id=id).delete()
        return JsonResponse(post.serialize())

    else:
        return JsonResponse({"error": "Invalid input"}, status=400)
