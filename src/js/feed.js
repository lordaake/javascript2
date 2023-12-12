document.addEventListener("DOMContentLoaded", function () {
    const newPostForm = document.getElementById("new-post-form");
    const accessToken = localStorage.getItem("accessToken");
    const API_POST_URL = "https://api.noroff.dev/api/v1/social/posts?_author=true&_comments=true";

    const title = document.getElementById("post-title");
    const body = document.getElementById("post-description");
    const media = document.getElementById("post-image");
    const tags = document.getElementById("tags");

    const username = localStorage.getItem("username");
    const usernameElement = document.getElementById("usernameDisplay");

    const searchButton = document.getElementById("search-button");
    const searchInput = document.getElementById("search-input");

    let offset = 0;
    const limit = 20;

    if (searchButton) {
        searchButton.addEventListener("click", function () {
            fetchAndDisplayPosts(searchInput.value);
        });
    }

    if (searchInput) {
        searchInput.addEventListener("keypress", function (e) {
            if (e.key === 'Enter') {
                fetchAndDisplayPosts(searchInput.value);
            }
        });
    }

    if (newPostForm) {
        newPostForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const postData = {
                title: title.value,
                body: body.value,
                media: media.value,
                tags: tags.value.split(" ")
            };

            createNewPost(postData);
        });
    }


    function createNewPost(postData) {
        fetch(API_POST_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify(postData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(() => {
                clearFormInputs();
                fetchAndDisplayPosts();
            })
            .catch(error => console.error('Error submitting post:', error));
    }

    function deletePost(postId, postAuthor) {
        if (postAuthor !== username) {
            alert("You can only delete your own posts!");
            return;
        }

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
            .catch(error => console.error('Error deleting post:', error));
    }

    function clearFormInputs() {
        title.value = "";
        body.value = "";
        media.value = "";
        tags.value = "";
    }

    function getSelectedSortOption() {
        const sortBySelect = document.getElementById('sort-by');
        return sortBySelect.value;
    }

    const profilePage = window.location.pathname.endsWith("profile/");
    const feedPage = window.location.pathname.endsWith("feed/");
    const singlePostPage = window.location.href.includes("singlepost.html");

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

    const postContainer = document.querySelector(".post-thumbnails");

    function fetchAndDisplayPosts(searchTerm = '', loadMore = false) {
        if (!loadMore) {
            postContainer.innerHTML = '';
            offset = 0;
        }

        let API_URL;

        if (profilePage && username) {
            API_URL = `https://api.noroff.dev/api/v1/social/profiles/${username}/posts?_author=true&_comments=true`;
        } else if (feedPage) {
            API_URL = `https://api.noroff.dev/api/v1/social/posts?_author=true&_comments=true`;
            if (searchTerm && searchTerm.length > 0) {
                API_URL += `&_tag=${encodeURIComponent(searchTerm)}`;
            }
        } else if (singlePostPage) {
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get('postId');
            if (postId) {
                API_URL = `https://api.noroff.dev/api/v1/social/posts/${postId}?_author=true&_comments=true`;
                console.log(API_URL)
            }
        }

        API_URL += `&offset=${offset}&limit=${limit}`;

        function addContentToFeed(post) {
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
                        <div class="col-12">
                            <button class="btn btn-light edit-post-button mt-2" data-post-id="${post.id}">Edit Post</button>
                        </div>                        
                                    `;

            postElement.appendChild(postThumbnail);
            postContainer.appendChild(postElement);
            postThumbnail.appendChild(viewPostBtnDiv);

            viewPostBtnDiv.appendChild(viewPostButton);
            postThumbnail.appendChild(deleteButtonDiv);
            deleteButtonDiv.appendChild(deleteButton);
        }


        fetch(API_URL, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            }
        })
            .then(response => response.json())
            .then(posts => {


                const sortBy = getSelectedSortOption();
                let processedPosts = sortPosts(posts, sortBy);

                processedPosts.forEach(post => {
                    addContentToFeed(post);
                });
            })
            .catch(error => console.error('Error fetching posts:', error));
    }

    function fetchAndDisplaySinglePost(postId) {
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
                <div class="col-12">
                    <button class="btn btn-light edit-post-button mt-2" data-post-id="${post.id}">Edit Post</button>
                </div>                        
                            `;

                postElement.appendChild(postThumbnail);
                postContainer.appendChild(postElement);
                postThumbnail.appendChild(viewPostBtnDiv);

                viewPostBtnDiv.appendChild(viewPostButton);
                postThumbnail.appendChild(deleteButtonDiv);
                deleteButtonDiv.appendChild(deleteButton);
            })
            .catch(error => console.error('Error fetching single post:', error));
    }

    function submitComment(postId) {
        const commentInput = document.getElementById(`comment-input-${postId}`);
        const commentText = commentInput.value;

        if (!commentText) {
            alert("Please enter a comment");
            return;
        }

        const commentData = {
            body: commentText,
        };

        fetch(`https://api.noroff.dev/api/v1/social/posts/${postId}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(commentData)
        })
            .then(response => response.json())
            .then(newComment => {
                addCommentToDOM(postId, newComment);
                commentInput.value = '';
            })
            .catch(error => console.error('Error posting comment:', error));
    }

    function addCommentToDOM(postId, comment) {
        const commentsSection = document.getElementById(`comments-${postId}`);

        const newCommentHTML = `
            <div class="comment">
                <p><strong>${comment.author.name}:</strong> ${comment.body}</p>
            </div>
        `;

        commentsSection.insertAdjacentHTML('beforeend', newCommentHTML);
    }

    document.addEventListener("click", function (e) {
        if (e.target.classList.contains("submit-comment-button")) {
            e.preventDefault();
            const postId = e.target.getAttribute("data-post-id");
            submitComment(postId);
        }
    });

    if (usernameElement) {
        usernameElement.textContent = username;
    }

    const sortBy = document.getElementById('sort-by');
    if (sortBy) {
        sortBy.addEventListener('change', function () {
            fetchAndDisplayPosts();
        });
    }

    const loadMoreButton = document.getElementById('load-more-button');
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', function () {
            offset += limit;
            fetchAndDisplayPosts(searchInput.value, true);
        });
    }

    const profileImage = localStorage.getItem("avatar");
    if (profileImage && profilePage) {
        const profileImageElement = document.getElementById("profile-image");

        if (profileImage === "null") {
            profileImageElement.src = "/images/profile-image.png";
        } else {
            profileImageElement.src = profileImage;
        }
    }

    if (feedPage) {
        fetchAndDisplayPosts();
    }

    if (singlePostPage) {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('postId');
        if (postId) {
            fetchAndDisplaySinglePost(postId);
        }
    } else {
        fetchAndDisplayPosts();
    }

    const editPostModal = document.getElementById("edit-post-modal");
    const editPostModalCloseBtn = editPostModal.querySelector(".close");

    editPostModalCloseBtn.addEventListener("click", function () {
        editPostModal.style.display = "none";
    });

    window.addEventListener("click", function (e) {
        if (e.target === editPostModal) {
            editPostModal.style.display = "none";
        }
    });

    document.addEventListener("click", function (e) {
        if (e.target.classList.contains("edit-post-button")) {
            e.preventDefault();
            const postId = e.target.getAttribute("data-post-id");
            openEditPostModal(postId);
        }
    });

    const editPostId = document.getElementById("edit-post-id")
    const editPostTitle = document.getElementById("edit-post-title")
    const editPostDescription = document.getElementById("edit-post-description")
    const editPostImage = document.getElementById("edit-post-image")
    const editPostTags = document.getElementById("edit-post-tags")

    function openEditPostModal(postId) {
        fetch(`https://api.noroff.dev/api/v1/social/posts/${postId}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            }
        })
            .then(response => response.json())
            .then(post => {
                editPostId.value = post.id;
                editPostTitle.value = post.title;
                editPostDescription.value = post.body;
                editPostImage.value = post.media || "";
                editPostTags.value = post.tags.join(", ");

                editPostModal.style.display = "block";
            })
            .catch(error => console.error('Error fetching post data:', error));
    }

    const editPostForm = document.getElementById("edit-post-form");
    editPostForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const postId = document.getElementById("edit-post-id").value;
        const editedPostData = {
            title: editPostTitle.value,
            body: editPostDescription.value,
            media: editPostImage.value,
            tags: editPostTags.value.split(",").map(tag => tag.trim()),
        };

        fetch(`https://api.noroff.dev/api/v1/social/posts/${postId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify(editedPostData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(() => {
                editPostModal.style.display = "none";
                fetchAndDisplayPosts();
            })
            .catch(error => console.error('Error updating post:', error));
    });


});