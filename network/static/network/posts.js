document.addEventListener("DOMContentLoaded", () =>{
})

function edit_post (id) {
    postContainer = document.querySelector(`#post-${id}`)
    content = postContainer.querySelector('.content')
    editButton = postContainer.querySelector('.edit')
    submitButton = postContainer.querySelector('.submit')
    
    textarea = document.createElement('textarea');
    textarea.classList.add('form-control');
    textarea.rows = 3;
    textarea.value = content.innerHTML;

    editButton.style.display="none"
    submitButton.style.display="block"

    textarea.onkeyup = () => {
        if(textarea.value.length > 0){
            submitButton.disabled = false;
        } else {
            submitButton.disabled = true;
        }
    }
    
    content.style.display='none'
    postContainer.prepend(textarea)

}

function submit_edit (id) {
    postContainer = document.querySelector(`#post-${id}`)
    textarea = postContainer.querySelector('textarea')
    content = postContainer.querySelector('.content')
    editButton = postContainer.querySelector('.edit')
    submitButton = postContainer.querySelector('.submit')

    fetch(`/edit/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            content: textarea.value
        })
      })
      .then(response => response.json())
      .then(res => {
        console.log(res.content)

        content.innerHTML = res.content
        content.style.display="block"
        textarea.style.display="none"
        editButton.style.display="block"
        submitButton.style.display="none"
      })
}

function like_post (id) {
    postContainer = document.querySelector(`#post-${id}`)
    likes = postContainer.querySelector('.like-count')
    btn_container = postContainer.querySelector('.like-btn-container')
    old_btn = btn_container.querySelector('button')


    fetch(`/like/${id}`,{
        method:'PUT',
        body: JSON.stringify({
            action : "like"
        })
    })
    .then(response => response.json())
    .then(post => {

        likes.innerHTML = post.likes
        
        button = document.createElement('button')
        button.innerHTML="Cancel Like"
        button.classList.add("btn","btn-outline-secondary","btn-sm")
        button.onclick= ()=>cancel_like(id)

        btn_container.replaceChild(button, old_btn)
    })
}

function cancel_like(id){
    postContainer = document.querySelector(`#post-${id}`)
    likes = postContainer.querySelector('.like-count')
    btn_container = postContainer.querySelector('.like-btn-container')
    old_btn = btn_container.querySelector('button')

    fetch(`/like/${id}`,{
        method:'PUT',
        body: JSON.stringify({
            action : "cancel_like"
        })
    })
    .then(response => response.json())
    .then(post => {

        likes.innerHTML = post.likes
        
        button = document.createElement('button')
        button.innerHTML="Like"
        button.classList.add("btn","btn-outline-primary","btn-sm")
        button.onclick= ()=>like_post(id)

        btn_container.replaceChild(button, old_btn)
    })
}