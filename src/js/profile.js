document.addEventListener("DOMContentLoaded", function () {
    const username = localStorage.getItem("username");

    if (username) {
        const usernameElement = document.querySelector(".h3");
        usernameElement.textContent = username;
    }
});
