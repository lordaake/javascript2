document.addEventListener("DOMContentLoaded", function () {

    const registrationForm = document.getElementById("registrationForm");

    registrationForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const API_BASE_URL = "https://api.noroff.dev/api/v1/social/auth/register";

        const username = document.getElementById("registerUsername").value;
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;

        /** 
        const avatar = document.getElementById("registerAvatar").value;
        const banner = document.getElementById("registerBanner").value; */

        const registrationData = {
            name: username,
            email: email,
            password: password
        };

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
            .then((data) => {
                console.log("Registration successful:", data);
            })
            .catch((error) => {
                console.error("Registration error:", error);
            });
    });

    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const API_LOGIN_URL = "https://api.noroff.dev/api/v1/social/auth/login";

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        const loginData = {
            email: email,
            password: password,
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
                console.log("Login successful. Access token:", accessToken);
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("username", data.name);
                window.location.href = "./profile/index.html";
            })
            .catch((error) => {
                console.error("Login error:", error);
            });
    });

});