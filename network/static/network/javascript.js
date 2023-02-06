document.addEventListener('DOMContentLoaded', function() {

    load_all_hearts();
    
    document.querySelector('#create-post').addEventListener('click', function(){
        compose_post();
    });
    
    window.onload = function() {
        if (window.location.pathname.startsWith('/profile')) {
            load_profile();
        }
        else if (window.location.pathname.startsWith('/following')) {
            load_following_post ();
        }
    };

    checkAuth().then(authenticated => {
        if (authenticated == true) {
            document.querySelectorAll('#edit-button').forEach(function(edit_button) {
                edit_button.addEventListener('click', function(){
                    load_edit_post(this);
                });
            });
            
        }
    });
       
    document.querySelectorAll('#heart_button').forEach(function(heart_button){
        heart_button.addEventListener('click', function(){
            add_heart(this)
        });
    });

    
    document.querySelectorAll('#post-comment-button').forEach(function(comment_button){
        comment_button.addEventListener('click', function(){
            comment (this)
        });
    });


    load_all_posts();
});

function compose_post () {
    document.querySelector('#post-view').style.display = 'none';
    document.querySelector('#compose-post').style.display = 'block';
    document.querySelector('#create-button').style.display = 'none';
    document.querySelector('#profile-page').style.display = 'none';
    document.querySelector('#edit-post').style.display = 'none';
    document.querySelector('.pagination').style.display = 'none';
    document.querySelector('#comment-page').style.display = 'none';
    document.querySelector('#submit-post').addEventListener('submit', function (){
        submit_post ();
    });
}

function load_all_posts() {
    
    document.querySelector('#post-view').style.display = 'block';
    document.querySelector('#compose-post').style.display = 'none';
    document.querySelector('#create-button').style.display = 'block';
    document.querySelector('#profile-page').style.display = 'none';
    document.querySelector('#following_post').style.display = 'none';
    document.querySelector('#edit-post').style.display = 'none';
    document.querySelector('#comment-page').style.display = 'none';
}

function submit_post () {
    var token = document.querySelector("input[name='csrfmiddlewaretoken']").value;
    const text = document.querySelector('#post-text').value;
    fetch('/submit-post', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token
        },
        body: JSON.stringify({
            post_text: text,
            })
        })
        .then(response => response.json())
        .then(result => {
          // Print result
        console.log(result.message);
          
    });  
    
    load_all_posts();
}

function load_profile () {
    document.querySelector('#post-view').style.display = 'block';
    document.querySelector('#profile-page').style.display = 'block';
    document.querySelector('#compose-post').style.display = 'none';
    document.querySelector('#create-button').style.display = 'none';
    document.querySelector('#following_post').style.display = 'none';
    document.querySelector('#edit-post').style.display = 'none';
    document.querySelector('#comment-page').style.display = 'none';

    const profile_user = document.querySelector('#profile-user').innerHTML;


    document.querySelector('#follow_button').addEventListener('click', function(){
        var token = document.querySelector("input[name='csrfmiddlewaretoken']").value;

        var follow = document.querySelector('#follow_button').innerHTML;

        let follow_count = document.querySelector('#follower_count');
        let value = parseInt(follow_count.innerHTML.match(/\d+/)[0]);

        if (follow == "Follow!") {
            document.querySelector('#follow_button').innerHTML = "Unfollow!";
            follow_count.innerHTML = "Follower: " + (value + 1);
        }
        else {
            document.querySelector('#follow_button').innerHTML = "Follow!";
            follow_count.innerHTML = "Follower: " + (value - 1);
        }

        fetch(profile_user, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": token
            },
            body: JSON.stringify({
                follow: true
                })
            })
            .then(response => response.json())
            .then(result => {
              // Print result
            console.log(result);
            
              
        })
        .catch(error => {
            // Log the error to the console
            console.error(error);
          });  
    });
}

function load_following_post () {
    document.querySelector('#post-view').style.display = 'block';
    document.querySelector('#profile-page').style.display = 'none';
    document.querySelector('#compose-post').style.display = 'none';
    document.querySelector('#create-button').style.display = 'none';
    document.querySelector('#following_post').style.display = 'block';
    document.querySelector('#edit-post').style.display = 'none';
    document.querySelector('#comment-page').style.display = 'none';
}

function load_edit_post (element) {
    document.querySelector('#post-view').style.display = 'none';
    document.querySelector('#profile-page').style.display = 'none';
    document.querySelector('#compose-post').style.display = 'none';
    document.querySelector('#create-button').style.display = 'none';
    document.querySelector('#following_post').style.display = 'none';
    document.querySelector('#edit-post').style.display = 'block';
    document.querySelector('.pagination').style.display = 'none';
    document.querySelector('#comment-page').style.display = 'none';

    var postId = element.getAttribute('data-post-id');
    const hostname = window.location.hostname;
    const port = window.location.port;
    const url = `http://${hostname}:${port}/edit/${postId}`;

    
    fetch(url, {
        method: 'GET',
        })
        .then(response => response.json())
        .then(post => {
          // Print result

    
        const post_select = document.querySelector('#post_edit');

        const post_user = document.createElement('label');
        post_user.innerHTML = post.user;
        post_user.style.fontSize = '50px'
        post_user.style.fontWeight = 'bold';
        post_user.style.marginBottom = '50px'

        const post_timestamp = document.createElement('label');
        post_timestamp.className ='gray_items';
        post_timestamp.innerHTML = "Posted On : " + post.timestamp;

        const likes = document.createElement('label')
        likes.className = 'gray_items';
        likes.innerHTML = "Likes: " + post.likes;
        
        const post_text = document.createElement('textarea');
        post_text.className = 'form-control';
        post_text.id = 'text-edit';
        post_text.innerHTML = post.post_text;


        const firstChild = post_select.firstChild;
        post_select.insertBefore(post_user, firstChild);
        post_select.insertBefore(post_timestamp, firstChild);
        post_select.insertBefore(likes, firstChild);
        post_select.insertBefore(post_text, firstChild);
    })
    
    document.querySelector('#post_edit').addEventListener('submit', function (){
        
        submit_edit(postId);
        

    });

}

function submit_edit (postId) {
    const hostname = window.location.hostname;
    const port = window.location.port;
    const url = `http://${hostname}:${port}/edit/${postId}`;
    var token = document.querySelector("input[name='csrfmiddlewaretoken']").value;
    const text = document.querySelector('#text-edit').value;
    
    
    fetch(url , {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token
        },
        body: JSON.stringify({
            post_text: text,
            })
        })
        .then(response => response.json())
        .then(result => {
          // Print result
        
        console.log(result);
    });  

    
}

function load_all_hearts () {
    const posts = document.querySelectorAll('#heart_button');
    
    for (let i = 0; i < posts.length; i++) {
        const hostname = window.location.hostname;
        const port = window.location.port;
        var postId = posts[i].getAttribute('data-like-post-id');
        const url = `http://${hostname}:${port}/like/${postId}`;
        
        fetch(url, {
            method: 'GET',
            })
            .then(response => response.json())
            .then(result => {
              // Print result

                
            if (result.liked == 'true') {
                posts[i].style.color = 'red';
            }

        })
    }
}

function add_heart(heart) {
    let like_counter = heart.closest('#post_display').querySelector('#like_counter');
    let value = parseInt(like_counter.innerHTML.match(/\d+/)[0]);

    if (heart.style.color == 'red') {
        heart.style.color = 'rgb(117, 112, 112)';
        like_counter.innerHTML = "Likes: " + (value - 1);
    }
    else {
        heart.style.color = 'red'
        like_counter.innerHTML = "Likes: " + (value + 1);
    }

    const hostname = window.location.hostname;
    const port = window.location.port;
    var postId = heart.getAttribute('data-like-post-id');
    const url = `http://${hostname}:${port}/like/${postId}`;
    var token = document.querySelector("input[name='csrfmiddlewaretoken']").value;

    fetch(url, {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token
        },
        body: JSON.stringify({
            liked_by: "true",
            })
        })
        .then(response => response.json())
        .then(result => {
          // Print result

        console.log(result);

    })

}

async function checkAuth() {
    const hostname = window.location.hostname;
    const port = window.location.port;
    const url = `http://${hostname}:${port}/auth`;


    
    const response = await fetch(url);
    
    const result = await response.json();
    return result.authenticated;
}

function comment (post) {
    document.querySelector('#post-view').style.display = 'none';
    document.querySelector('#profile-page').style.display = 'none';
    document.querySelector('#compose-post').style.display = 'none';
    document.querySelector('#create-button').style.display = 'none';
    document.querySelector('#following_post').style.display = 'none';
    document.querySelector('#edit-post').style.display = 'none';
    document.querySelector('.pagination').style.display = 'none';
    document.querySelector('#comment-page').style.display = 'block';

    var postId = post.getAttribute('data-comment-post-id');
    const hostname = window.location.hostname;
    const port = window.location.port;
    const url = `http://${hostname}:${port}/edit/${postId}`;
    

    
    fetch(url, {
        method: 'GET',
        })
        .then(response => response.json())
        .then(post => {

        console.log(post);
        const post_select = document.querySelector('#comment_post_view');

        const form_select = document.querySelector('#comment-submit');

        const post_user = document.createElement('label');
        post_user.innerHTML = post.user;
        post_user.style.fontSize = '50px'
        post_user.style.fontWeight = 'bold';
        post_user.style.marginBottom = '50px'

        const post_timestamp = document.createElement('label');
        post_timestamp.className ='gray_items';
        post_timestamp.innerHTML = "Posted On : " + post.timestamp;

        const likes = document.createElement('label')
        likes.className = 'gray_items';
        likes.innerHTML = "Likes: " + post.likes;
        
        const post_text = document.createElement('div');
        post_text.className = 'form-control post_box';
        post_text.id = 'comment_text_area';
        post_text.innerHTML = post.post_text;


        const comment_header = document.createElement('h');
        comment_header.style.fontWeight = 'bold';
        comment_header.style.fontSize = '30px';
        comment_header.innerHTML = "Comments";


        post_select.appendChild(post_user);
        post_select.appendChild(post_timestamp);
        post_select.appendChild(likes);
        post_select.appendChild(post_text);
        post_select.appendChild(comment_header);
       

        for (let i = 0; i < post.commented.length; i++) {
            const comment_section = document.createElement('div');
            comment_section.className = 'post_box font-control';
            comment_section.style.marginBottom = '20px';

            const comment_poster = document.createElement('label');
            comment_poster.innerHTML = post.commented[i].user;
            comment_poster.style.fontWeight = 'bold';
            comment_poster.style.fontSize = '30px';
            comment_poster.className = 'inside_post';

            const comment_timestamp = document.createElement('label');
            comment_timestamp.innerHTML = "Posted On: " + post.commented[i].timestamp;
            comment_timestamp.classList = 'gray_items inside_post';
            

            const comment_text = document.createElement('label');
            comment_text.innerHTML = post.commented[i].text_comment;
            comment_text.className = 'inside_post';


            comment_section.appendChild(comment_poster);
            comment_section.appendChild(comment_timestamp);
            comment_section.appendChild(comment_text);

            post_select.appendChild(comment_section);

        }
        
        const firstChild = form_select.firstChild;
        const add_comment = document.createElement('textarea')
        add_comment.className = 'form-control post_box' ;
        add_comment.id = 'comment_text_area_submit';
        add_comment.placeholder = "Add a comment!";
        form_select.insertBefore(add_comment, firstChild);

       
    })


    document.querySelector('#comment-submit').addEventListener('submit', function (){
        
        submit_comment(postId);
    });

   


}


function submit_comment (postId) {
    const hostname = window.location.hostname;
    const port = window.location.port;
    const url = `http://${hostname}:${port}/comment/${postId}`;
    var token = document.querySelector("input[name='csrfmiddlewaretoken']").value;
    const text = document.querySelector('#comment_text_area_submit').value;
    

    
    fetch(url , {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token
        },
        body: JSON.stringify({
            comment: text,
            })
        })
        .then(response => response.json())
        .then(result => {
          // Print result
        
        console.log(result);
    });  
}