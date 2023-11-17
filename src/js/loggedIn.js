document.addEventListener("DOMContentLoaded", function () {

    const pagesThatRequireAuth = ["/feed/index.html", "/profile/index.html"];
    const currentPath = window.location.pathname;

    if (pagesThatRequireAuth.includes(currentPath) && !localStorage.getItem("isLoggedIn")) {
        alert("You need to log in first to access this page.");
        window.location.href = "../index.html";
        return;
    }

});

