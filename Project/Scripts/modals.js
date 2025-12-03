document.addEventListener('DOMContentLoaded', async () => {
    // Load modal HTML from partial
    await loadModals();

    // Configure modal-specific actions (optional)
    const modalConfig = {
        submitModal: { redirect: './Dashboard.html' },
        saveModal: { redirect: 'NCR-Report-Form/Project/html/Sidebar/Dashboard.html' },
        helperModal: {},
        confirmModal: {}
    };

    // Global open() method
    window.openModal = function (modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal with id "${modalId}" not found`);
            return;
        }

        modal.classList.remove('hidden');
        modal.addEventListener('click', onOutsideClick);
    };

    // Global close() method
    window.closeModal = function (modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.add('hidden');
        modal.removeEventListener('click', onOutsideClick);

        // Optional redirect
        if (modalConfig[modalId]?.redirect) {
            window.location.href = modalConfig[modalId].redirect;
        }
    };

    // Handles clicking outside of the modal content box
    function onOutsideClick(e) {
        const modal = e.currentTarget;

        // Only close if clicking the background overlay
        if (e.target === modal) {
            closeModal(modal.id);
        }
    }

    // Load modals from partial HTML file
    async function loadModals() {
        try {
            const response = await fetch('../partials/modals.html');
            if (!response.ok) {
                throw new Error(`Failed to load modals: ${response.status}`);
            }
            const html = await response.text();

            // Create a container and inject the modal HTML
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = html;
            document.body.appendChild(modalContainer);

            console.log('Modals loaded successfully');
        } catch (error) {
            console.error('Error loading modals:', error);
        }
    }
});
