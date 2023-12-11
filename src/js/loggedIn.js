document.addEventListener("DOMContentLoaded", function () {

    const pagesThatRequireAuth = ["/feed/index.html", "/profile/index.html"];
    const currentPath = window.location.pathname;

    if (pagesThatRequireAuth.includes(currentPath) && !localStorage.getItem("isLoggedIn")) {
        alert("You need to log in first to access this page.");
        window.location.href = "../index.html";
        return;
    }

    const logoutLink = document.getElementById("log-out");
    if (logoutLink) {
        logoutLink.addEventListener("click", function (event) {
            event.preventDefault();

            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("username");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("avatar");
            localStorage.removeItem("banner");

            window.location.href = "../index.html";
        });
    }

});