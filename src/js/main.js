/**
 * Import necessary functions from other modules.
 */

import { getLoggedInUser } from "./loggedIn.js";
import { fetchAndDisplaySinglePost } from './postHandler.js';
import { addContentToFeed } from './postHandler.js';
import { showSuccessModal, showErrorModal, closeModal, initializeModal } from './modal.js';

/**
 * Get the logged-in user's information. If the user is not logged in, redirect to the login page. 
 * Remove the user's information from local storage when the user logs out.
 */
getLoggedInUser();

/**
 * Initialize the page when the DOM content is loaded.
 */
document.addEventListener("DOMContentLoaded", function () {
    // Get references to DOM elements
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

    const postContainer = document.querySelector(".post-thumbnails");

    initializeModal();

    let offset = 0;
    const limit = 20;

    closeModal();

    /**
 * Add event listener for the search button.
 */
    if (searchButton) {
        searchButton.addEventListener("click", function () {
            fetchAndDisplayPosts(searchInput.value);
        });
    }

    /**
 * Add event listener for the search input field.
 */
    if (searchInput) {
        searchInput.addEventListener("keypress", function (e) {
            if (e.key === 'Enter') {
                fetchAndDisplayPosts(searchInput.value);
            }
        });
    }

    /**
 * Add event listener for the new post form submission.
 */
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

    /**
      * Create a new post and send it to the server.
      *
      * @param {Object} postData - The data for the new post.
      */
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
            .catch(error => showErrorModal('Error submitting post: ' + error.message));
    }

    /**
     * Clear form input fields.
     */

    function clearFormInputs() {
        title.value = "";
        body.value = "";
        media.value = "";
        tags.value = "";
    }

    /**
     * Get the selected sort option from the UI.
     *
     * @returns {string} - The selected sort option.
     */

    function getSelectedSortOption() {
        const sortBySelect = document.getElementById('sort-by');
        return sortBySelect.value;
    }

    const profilePage = window.location.pathname.endsWith("profile/");
    const feedPage = window.location.pathname.endsWith("feed/");
    const singlePostPage = window.location.href.includes("singlepost.html");

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
    * Fetch and display posts based on the search term and sorting option.
    *
    * @param {string} searchTerm - The search term to filter posts.
    * @param {boolean} loadMore - Indicates if more posts should be loaded.
    */
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
            }
        }

        API_URL += `&offset=${offset}&limit=${limit}`;


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
            .catch(error => showErrorModal('Error fetching posts:' + error.message));
    }

    function submitComment(postId) {
        const commentInput = document.getElementById(`comment-input-${postId}`);
        const commentText = commentInput.value;

        if (!commentText) {
            showErrorModal("Please enter a comment");
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
            .catch(error => showErrorModal('Error posting comment:' + error.message));
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
        if (e.target && e.target.classList.contains("submit-comment-button")) {
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

    /**
    * Initialize the page by loading user data and posts.
    */
    function initializePage() {
        const profileImage = localStorage.getItem("avatar");
        const profilePage = window.location.pathname.endsWith("profile/");
        const singlePostPage = window.location.href.includes("singlepost.html");

        if (profileImage && profilePage) {
            const profileImageElement = document.getElementById("profile-image");
            profileImageElement.src = profileImage === "null" ? "/images/profile-image.png" : profileImage;
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
    }

    // Initialize the page with user data and posts.
    initializePage();


    const editPostModal = document.getElementById("edit-post-modal");
    const editPostModalCloseBtn = editPostModal.querySelector(".close");

    // Add a click event listener to close the edit post modal when the close button is clicked.
    editPostModalCloseBtn.addEventListener("click", function () {
        editPostModal.style.display = "none";
    });

    // Add a click event listener to close the edit post modal when clicked outside of the modal.
    window.addEventListener("click", function (e) {
        if (e.target === editPostModal) {
            editPostModal.style.display = "none";
        }
    });

    // Add a click event listener to open the edit post modal when an "edit post" button is clicked.
    document.addEventListener("click", function (e) {
        const editPostButton = document.querySelector(".edit-post-button");
        if (editPostButton && e.target === editPostButton) {
            e.preventDefault();
            const postId = e.target.getAttribute("data-post-id");
            openEditPostModal(postId);
        }
    });

    // Get references to elements within the edit post modal.
    const editPostId = document.getElementById("edit-post-id")
    const editPostTitle = document.getElementById("edit-post-title")
    const editPostDescription = document.getElementById("edit-post-description")
    const editPostImage = document.getElementById("edit-post-image")
    const editPostTags = document.getElementById("edit-post-tags")

    // Function to open the edit post modal and populate it with post data.
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
            .catch(error => showErrorModal('Error fetching post data:' + error.message));
    }

    // Get the edit post form and add a submit event listener to update the post data.
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

        // Send a PUT request to update the post data on the server.
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
                if (singlePostPage) {
                    fetchAndDisplaySinglePost(postId);
                }
            })
            .catch(error => showErrorModal('Error updating post:' + error.message));
    });

});