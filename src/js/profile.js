document.addEventListener("DOMContentLoaded", function () {

    const username = localStorage.getItem("username");
    if (username) {
        const usernameElement = document.querySelector(".h3");
        if (usernameElement) {
            usernameElement.textContent = username;
        }
    }

    const logoutLink = document.getElementById("log-out");
    if (logoutLink) {
        logoutLink.addEventListener("click", function (event) {
            event.preventDefault();

            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("username");
            localStorage.removeItem("accessToken");

            window.location.href = "../index.html";
        });
    }

});
