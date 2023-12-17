export { showSuccessModal, showErrorModal, closeModal, initializeModal };

let errorModalInstance = null;

function initializeModal() {
    errorModalInstance = new bootstrap.Modal(document.getElementById('errorModal'), {});
}

function showSuccessModal(successMessage) {
    const errorMessageText = document.getElementById("errorMessageText");
    errorMessageText.textContent = successMessage;
    errorModalInstance.show();
}

function showErrorModal(errorMessage) {
    const errorMessageText = document.getElementById("errorMessageText");
    errorMessageText.textContent = errorMessage;
    errorModalInstance.show();
}

function closeModal() {
    errorModalInstance.hide();
}

document.addEventListener('DOMContentLoaded', (event) => {
    initializeModal();
    document.querySelector('#errorModal .close').addEventListener('click', closeModal);
});