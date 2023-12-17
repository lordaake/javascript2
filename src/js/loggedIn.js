/**
 * Retrieves the logged-in user's information and handles authentication-related tasks.
 *
 * This function checks if the user is logged in and handles redirects and logout functionality.
 */

import { showErrorModal } from "./modal.js";


function getLoggedInUser() {
    document.addEventListener("DOMContentLoaded", function () {

        const pagesThatRequireAuth = ["/feed/", "/profile/"];
        const currentPath = window.location.pathname;

        // Check if the current page requires authentication and the user is not logged in.
        if (pagesThatRequireAuth.includes(currentPath) && !localStorage.getItem("isLoggedIn")) {
            showErrorModal("You need to log in first to access this page.");
            window.location.href = "../index.html";
            return;
        }

        // Get the logout link and add a click event listener to handle user logout.
        const logoutLink = document.getElementById("log-out");
        if (logoutLink) {
            logoutLink.addEventListener("click", function (event) {
                event.preventDefault();

                // Clear user-related data from local storage.
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("username");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("avatar");
                localStorage.removeItem("banner");

                // Redirect the user to the login page.
                window.location.href = "../index.html";
            });
        }

    });
}

// Export the getLoggedInUser function for external use.
export { getLoggedInUser };