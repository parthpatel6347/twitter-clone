
document.addEventListener('DOMContentLoaded', ()=>{ 

    let submit_input = document.querySelector('#post-input')
    let submit_post_btn = document.querySelector('#submit-post')

    submit_post_btn.disabled = true;
    
    submit_input.onkeyup = () => {
        if(submit_input.value.length > 0){
            submit_post_btn.disabled = false;
        } else {
            submit_post_btn.disabled = true;
        }
    }
    // Submit post
    document.querySelector('#post-form').onsubmit = submit_post;
})

function submit_post () {

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
}