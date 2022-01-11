
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
    old_btn = btn_container.querySelector('button')

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
        button = document.createElement('button')
        button.innerHTML="Cancel Like"
        button.classList.add("btn","btn-outline-secondary","btn-sm")
        button.onclick= ()=>cancel_like(id)

        // switch like button with cancel like button
        btn_container.replaceChild(button, old_btn)
    })
}

function cancel_like(id){
    postContainer = document.querySelector(`#post-${id}`)
    likes = postContainer.querySelector('.like-count')
    btn_container = postContainer.querySelector('.like-btn-container')
    old_btn = btn_container.querySelector('button')

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
        button = document.createElement('button')
        button.innerHTML="Like"
        button.classList.add("btn","btn-outline-primary","btn-sm")
        button.onclick= ()=>like_post(id)

        // switch cancel like button with like button
        btn_container.replaceChild(button, old_btn)
    })
}