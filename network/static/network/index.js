document.addEventListener('DOMContentLoaded', ()=>{

    // Submit post
    document.querySelector('#post-form').onsubmit = (e) => {
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

        // Clear post input field on submit
        document.querySelector('#post-input').value=""
    }

    


})