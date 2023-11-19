document.addEventListener("DOMContentLoaded", function () {
    const newPostForm = document.getElementById("new-post-form");
    const accessToken = localStorage.getItem("accessToken");
    const API_POST_URL = "https://api.noroff.dev/api/v1/social/posts?_author=true";

    newPostForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const titleElement = document.getElementById("post-title");
        const descriptionElement = document.getElementById("post-description");
        const imageUrlElement = document.getElementById("post-image");
        const tagsElement = document.getElementById("tags");

        const tags = tagsElement.value.split(" ");
        tags.push("AllTord");

        const postData = {
            title: titleElement.value,
            body: descriptionElement.value,
            media: imageUrlElement.value,
            tags: tags,
        };

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
                titleElement.value = "";
                descriptionElement.value = "";
                imageUrlElement.value = "";
                tagsElement.value = "";

                fetchAndDisplayPosts();
            })
            .catch(error => console.error('Error submitting post:', error));
    });

    function fetchAndDisplayPosts() {
        const postContainer = document.querySelector(".post-thumbnails");
        postContainer.innerHTML = '';

        fetch(API_POST_URL, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(posts => {
                posts.forEach(post => {
                    if (post.tags.includes("AllTord")) {
                        const postElement = `
                    <div class="row" id="post-${post.id}">
                        <div class="col-12 mb-4">
                            <div class="post-thumbnail bg-primary text-light p-3 text-center mx-auto">
                                <p class="text-light">${new Date(post.created).toLocaleString()}</p>
                                <p class="text-light">By ${post.author ? post.author.name : 'Unknown'}</p>
                                <img src="${post.media}" class="img-fluid img-thumbnail" alt="${post.title}">
                                <h3>${post.title}</h3>
                                <p class="mt-3">${post.body}</p>
                                <p class="mt-3">${post.tags.filter(tag => tag !== "AllTord").map(tag => `#${tag}`).join(' ')}</p>
                                </div>
                        </div>
                    </div>
                    `;
                        postContainer.innerHTML += postElement;
                    }
                });
            })
            .catch(error => console.error('Error fetching posts:', error));
    }

    fetchAndDisplayPosts();
});
