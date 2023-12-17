import { API_BASE_URL } from './constants.js';
import { showSuccessModal, showErrorModal, closeModal, initializeModal } from './modal.js';

/**
 * Handles user registration and login functionality.
 */
document.addEventListener("DOMContentLoaded", function () {
    const registrationContainer = document.getElementById("registration-container");
    const registerHereLink = document.getElementById("register-here");

    initializeModal();
    closeModal();

    /**
 * Toggles the registration form visibility.
 */
    function toggleRegistrationForm() {
        if (registrationContainer.style.display === "none" || registrationContainer.style.display === "") {
            registrationContainer.style.display = "flex";
        } else {
            registrationContainer.style.display = "none";
        }
    }

    // Add a click event listener to the "Register Here" link.
    registerHereLink.addEventListener("click", function (e) {
        e.preventDefault();
        toggleRegistrationForm();
    });

    // Get the registration form.
    const registrationForm = document.getElementById("registrationForm");

    /**
 * Handles the registration form submission.
 * @param {Event} e - The form submit event.
 */
    registrationForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const API_REGISTER_URL = API_BASE_URL + "auth/register";

        const username = document.getElementById("registerUsername");
        const email = document.getElementById("registerEmail");
        const password = document.getElementById("registerPassword");
        const avatar = document.getElementById("registerAvatar")
        const banner = document.getElementById("registerBanner")

        // Create registration data object.
        const registrationData = {
            name: username.value,
            email: email.value,
            banner: banner.value,
            avatar: avatar.value,
            password: password.value,
        };

        // Make a POST request to the registration API.
        fetch(API_REGISTER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(registrationData),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Registration failed");
                }
                return response.json();
            })
            .then(() => {
                // Clear form inputs and display a registration success message.
                username.value = "";
                email.value = "";
                password.value = "";
                avatar.value = "";
                banner.value = "";
                showSuccessModal("Registration successful!");
            })
            .catch((error) => {
                // Display an error message if registration fails.
                showErrorModal("Registration failed. Please check your inputs.");
            });
    });

    const loginForm = document.getElementById("loginForm");

    /**
 * Handles the login form submission.
 * @param {Event} e - The form submit event.
 */
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const API_LOGIN_URL = API_BASE_URL + "auth/login";

        const email = document.getElementById("loginEmail");
        const password = document.getElementById("loginPassword");

        // Create login data object.
        const loginData = {
            email: email.value,
            password: password.value,
        };

        // Make a POST request to the login API.
        fetch(API_LOGIN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(loginData),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Login failed");
                }
                return response.json();
            })
            .then((data) => {
                // Store user data in local storage and redirect to the profile page upon successful login.
                const accessToken = data.accessToken;
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("username", data.name);
                localStorage.setItem("avatar", data.avatar);
                localStorage.setItem("banner", data.banner);
                localStorage.setItem("isLoggedIn", "true");
                window.location.href = "./profile/";
            })
            .catch((error) => {
                // Display an error message if login fails.
                showErrorModal("Login failed. Email or password is wrong.");
            });
    });

});