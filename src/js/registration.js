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
});
