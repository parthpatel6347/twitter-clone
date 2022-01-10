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