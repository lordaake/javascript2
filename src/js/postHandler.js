/**
* Sort posts based on the selected sorting option.
*
* @param {Array} posts - The array of posts to be sorted.
* @param {string} sortBy - The sorting option.
* @returns {Array} - The sorted array of posts.
*/
function sortPosts(posts, sortBy) {
    switch (sortBy) {
        case 'newest':
            return posts.sort((a, b) => new Date(b.created) - new Date(a.created));
        case 'oldest':
            return posts.sort((a, b) => new Date(a.created) - new Date(b.created));
        case 'no-image':
            return posts.filter(post => !post.media);
        case 'with-image':
            return posts.filter(post => post.media);
        default:
            return posts;
    }
};

/**
 * Adds content to the feed, including post details, comments, and buttons.
 *
 * @param {Object} post - The post object containing post data.
 */
function addContentToFeed(post) {
    const postContainer = document.querySelector(".post-thumbnails");
    const username = localStorage.getItem("username");

    let commentsHTML = post.comments.map(comment => `
                <div class="comment">
                    <p><strong>${comment.author.name}:</strong> ${comment.body}</p>
                </div>
            `).join('');

    const tagsHTML = post.tags
        .map(tag => {
            const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
            return `<span class="post-tag">${formattedTag}</span>`;
        })
        .join(' ');

    const postElement = document.createElement("div");
    postElement.classList.add("row");
    postElement.id = `post-${post.id}`;

    const postThumbnail = document.createElement("div");
    postThumbnail.classList.add("col-12", "mb-4", "post-thumbnail", "bg-primary", "text-light", "p-3", "text-center", "mx-auto", "d-flex", "flex-column");

    const deleteButtonDiv = document.createElement("div");
    deleteButtonDiv.classList.add("col-12")

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("btn", "btn-danger", "delete-post-button");
    deleteButton.setAttribute("data-post-id", post.id);
    deleteButton.textContent = "Delete Post";
    deleteButton.addEventListener("click", () => {
        deletePost(post.id, post.author ? post.author.name : null);
    });

    const viewPostBtnDiv = document.createElement("div");
    viewPostBtnDiv.classList.add("col-12")
    const viewPostButton = document.createElement("a");
    viewPostButton.href = `./../singlepost.html?postId=${post.id}`;
    viewPostButton.textContent = "View Post";
    viewPostButton.classList.add("btn", "mb-2", "mt-2", "text-white", "font-weight-bold", "bg-black");

    const editPostButtonDiv = document.createElement("div");
    editPostButtonDiv.classList.add("col-12")

    const editPostButton = document.createElement("button");
    editPostButton.classList.add("btn", "btn-light", "edit-post-button", "mt-2");
    editPostButton.setAttribute("data-post-id", post.id);
    editPostButton.textContent = "Edit Post";

    postThumbnail.innerHTML = `
                <p class="text-light">${new Date(post.created).toLocaleString()}</p>
                <p class="text-light">By ${post.author ? post.author.name : `${username}`}</p>
                ${post.media ? `<img src="${post.media}" class="img-fluid img-thumbnail" alt="${post.title}">` : ''}
                <h3>${post.title}</h3>
                <p class="mt-3">${post.body}</p>
                <div class="post-tags">${tagsHTML}</div>
                <div class="comments-section">
                    <h4>Comments</h4>
                    <form class="add-comment-form">
                        <input type="text" placeholder="Write a comment..." id="comment-input-${post.id}">
                        <button class="submit-comment-button" data-post-id="${post.id}">Submit</button>
                    </form>
                    <div id="comments-${post.id}">
                        ${commentsHTML}
                    </div>
                </div>      
                            `;

    postElement.appendChild(postThumbnail);
    postContainer.appendChild(postElement);
    postThumbnail.appendChild(viewPostBtnDiv);

    viewPostBtnDiv.appendChild(viewPostButton);
    if (post.author && post.author.name === username) {
        postThumbnail.appendChild(deleteButtonDiv);
        deleteButtonDiv.appendChild(deleteButton);
        postThumbnail.appendChild(editPostButtonDiv);
        editPostButtonDiv.appendChild(editPostButton);
    }
}

/**
 * Fetches and displays a single post based on its postId.
 *
 * @param {number} postId - The unique identifier of the post to fetch and display.
 */
function fetchAndDisplaySinglePost(postId) {
    const accessToken = localStorage.getItem("accessToken");
    const postContainer = document.querySelector(".post-thumbnails");
    postContainer.innerHTML = '';

    const API_URL = `https://api.noroff.dev/api/v1/social/posts/${postId}?_author=true&_comments=true`;

    fetch(API_URL, {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        }
    })
        .then(response => response.json())
        .then(post => {
            addContentToFeed(post);
        })
        .catch(error => showErrorModal('Error fetching single post:' + error.message));
}

/**
 * Deletes a post with the specified postId.
 *
 * @param {number} postId - The unique identifier of the post to delete.
 */
function deletePost(postId) {
    const accessToken = localStorage.getItem("accessToken");

    fetch(`https://api.noroff.dev/api/v1/social/posts/${postId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(() => {
            const postElement = document.getElementById(`post-${postId}`);
            if (postElement) {
                postElement.remove();
            }
        })
        .catch(error => showErrorModal('Error deleting post:' + error.message));
}

export { fetchAndDisplaySinglePost };
export { addContentToFeed };
export { deletePost };