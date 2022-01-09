
document.addEventListener('DOMContentLoaded', ()=>{

    document.querySelector('#index').addEventListener('click', () => load_index());
  
    // Submit post
    document.querySelector('#post-form').onsubmit = submit_post;

    //load by default
    load_index();

})

function load_index () {

    // unhide index view
    document.querySelector('#index-view').style.display = 'block';

    // load all posts
    load_posts()
}


function submit_post (e) {
    e.preventDefault();

    // Get post text
    let post = document.querySelector('#post-input').value;

    // Send data to API 
    fetch('/post', {
        method: 'POST',
        body: JSON.stringify({
            post
        })
    })
    .then(response => response.json())
    .then(result => {
    // Print result
    console.log(result);
    })
    .then(()=>load_posts())

    // Clear post input field on submit
    document.querySelector('#post-input').value=""
}


// View all posts
function load_posts () {
    document.querySelector('#all-posts').innerHTML=""

    fetch(`/view_posts`)
    .then(response => response.json())
    .then(posts => {
        posts.forEach(post => {
            const element = document.createElement('div')

            element.classList.add('post-main')

            element.innerHTML = `
            <h5>${post.content}</h5>
            <p>By: ${post.user}</p>
            <p>${post.timestamp}</p>
            <p>Likes: ${post.likes}</p>
            `
            document.querySelector('#all-posts').appendChild(element)
        });
    })
}