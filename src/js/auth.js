document.addEventListener("DOMContentLoaded", function () {


    const registrationContainer = document.getElementById("registration-container");
    const registerHereLink = document.getElementById("register-here");

    function toggleRegistrationForm() {
        if (registrationContainer.style.display === "none" || registrationContainer.style.display === "") {
            registrationContainer.style.display = "flex";
        } else {
            registrationContainer.style.display = "none";
        }
    }

    registerHereLink.addEventListener("click", function (e) {
        e.preventDefault();
        toggleRegistrationForm();
    });


    const registrationForm = document.getElementById("registrationForm");

    registrationForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const API_BASE_URL = "https://api.noroff.dev/api/v1/social/auth/register";

        const username = document.getElementById("registerUsername");
        const email = document.getElementById("registerEmail");
        const password = document.getElementById("registerPassword");
        const avatar = document.getElementById("registerAvatar")
        const banner = document.getElementById("registerBanner")

        const registrationData = {
            name: username.value,
            email: email.value,
            banner: banner.value,
            avatar: avatar.value,
            password: password.value,
        };

        console.log("Registration Data:", registrationData);
        fetch(API_BASE_URL, {
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
                username.value = "";
                email.value = "";
                password.value = "";
                avatar.value = "";
                banner.value = "";
                alert("Registration successful!");
            })
            .catch((error) => {
                alert("Registration failed. Please check your inputs.");
            });
    });

    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const API_LOGIN_URL = "https://api.noroff.dev/api/v1/social/auth/login";

        const email = document.getElementById("loginEmail");
        const password = document.getElementById("loginPassword");

        const loginData = {
            email: email.value,
            password: password.value,
        };

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
                const accessToken = data.accessToken;
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("username", data.name);
                localStorage.setItem("avatar", data.avatar);
                localStorage.setItem("banner", data.banner);
                localStorage.setItem("isLoggedIn", "true");
                window.location.href = "./profile/";
            })
            .catch((error) => {
                console.error("Login error:", error);
            });
    });

});