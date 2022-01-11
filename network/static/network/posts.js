
// Set post to edit mode
function edit_post (id) {
    postContainer = document.querySelector(`#post-${id}`)
    content = postContainer.querySelector('.content')
    editButton = postContainer.querySelector('.edit')
    submitButton = postContainer.querySelector('.submit')
    
    // Create new Textarea element for getting user input
    textarea = document.createElement('textarea');
    textarea.classList.add('form-control');
    textarea.rows = 3;
    textarea.value = content.innerHTML;

    // Hide edit button and show save button
    editButton.style.display="none"
    submitButton.style.display="block"

    // Disable save post button if input is empty
    textarea.onkeyup = () => {
        if(textarea.value.length > 0){
            submitButton.disabled = false;
        } else {
            submitButton.disabled = true;
        }
    }
    
    // Hide existing post text and add input textarea element to the postcontainer element
    content.style.display='none'
    postContainer.prepend(textarea)

}

// Submiting post edit function
function submit_edit (id) {
    postContainer = document.querySelector(`#post-${id}`)
    textarea = postContainer.querySelector('textarea')
    content = postContainer.querySelector('.content')
    editButton = postContainer.querySelector('.edit')
    submitButton = postContainer.querySelector('.submit')

    // Send PUT request to API 
    fetch(`/edit/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            content: textarea.value
        })
      })
      .then(response => response.json())
      .then(res => {
        
        // Show new content and edit button, hide input textarea and save button
        content.innerHTML = res.content
        content.style.display="block"
        textarea.style.display="none"
        editButton.style.display="block"
        submitButton.style.display="none"
      })
}

// post like function
function like_post (id) {
    postContainer = document.querySelector(`#post-${id}`)
    likes = postContainer.querySelector('.like-count')
    btn_container = postContainer.querySelector('.like-btn-container')
    old_btn = btn_container.querySelector('.like-btn')

    // Send PUT request to API 
    fetch(`/like/${id}`,{
        method:'PUT',
        body: JSON.stringify({
            action : "like"
        })
    })
    .then(response => response.json())
    .then(post => {

        // update like count
        likes.innerHTML = post.likes
        
        // Create cancel like button
        button = document.createElement('div')
        button.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#ff6060"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
        button.classList.add("like-btn")
        button.onclick= ()=>cancel_like(id)

        // switch like button with cancel like button
        btn_container.replaceChild(button, old_btn)
    })
}

function cancel_like(id){
    postContainer = document.querySelector(`#post-${id}`)
    likes = postContainer.querySelector('.like-count')
    btn_container = postContainer.querySelector('.like-btn-container')
    old_btn = btn_container.querySelector('.like-btn')

    // Send PUT request to API 
    fetch(`/like/${id}`,{
        method:'PUT',
        body: JSON.stringify({
            action : "cancel_like"
        })
    })
    .then(response => response.json())
    .then(post => {

        // update like count
        likes.innerHTML = post.likes
        
        // Create like button
        button = document.createElement('div')
        button.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#ff6060"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/></svg>`
        button.classList.add("like-btn")
        button.onclick= ()=>like_post(id)

        // switch cancel like button with like button
        btn_container.replaceChild(button, old_btn)
    })
}