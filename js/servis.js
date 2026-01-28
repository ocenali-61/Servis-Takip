/**
 * js/servis.js
 * Manages Service CRUD operations.
 */

// DOM Elements
const serviceList = document.getElementById('serviceList');
const serviceModal = document.getElementById('serviceModal');
const serviceForm = document.getElementById('serviceForm');
const modalTitle = document.getElementById('modalTitle');

// Inputs
const serviceIdInput = document.getElementById('serviceId');
const servisAdiInput = document.getElementById('servisAdi');
const plakaInput = document.getElementById('plaka');
const soforAdiInput = document.getElementById('soforAdi');
const telefonInput = document.getElementById('telefon');
const konumInput = document.getElementById('konum');

/**
 * Renders the list of services.
 */
function renderServices() {
    const services = Storage.getData('services') || [];
    serviceList.innerHTML = '';

    if (services.length === 0) {
        serviceList.innerHTML = '<tr><td colspan="6" class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">Hiç servis bulunamadı.</td></tr>';
        return;
    }

    services.forEach(service => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p class="text-gray-900 whitespace-no-wrap font-semibold">${service.servisAdi}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <span class="relative inline-block px-3 py-1 font-semibold text-gray-900 leading-tight">
                    <span aria-hidden class="absolute inset-0 bg-gray-200 opacity-50 rounded-full"></span>
                    <span class="relative">${service.plaka}</span>
                </span>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                 <p class="text-gray-900 whitespace-no-wrap">${service.soforAdi}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                 <p class="text-gray-900 whitespace-no-wrap">${service.telefon || '-'}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                 <p class="text-gray-900 whitespace-no-wrap">${service.konum || '-'}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                <button onclick="openModal('${service.id}')" class="text-blue-600 hover:text-blue-900 mr-2">Düzenle</button>
                <button onclick="deleteService('${service.id}')" class="text-red-600 hover:text-red-900">Sil</button>
            </td>
        `;
        serviceList.appendChild(row);
    });
}

/**
 * Opens the modal for adding or editing.
 * @param {string|null} id - Service ID if editing.
 */
function openModal(id = null) {
    serviceModal.classList.remove('hidden');
    if (id) {
        // Edit Mode
        const services = Storage.getData('services') || [];
        const service = services.find(s => s.id === id);
        if (service) {
            serviceIdInput.value = service.id;
            servisAdiInput.value = service.servisAdi;
            plakaInput.value = service.plaka;
            soforAdiInput.value = service.soforAdi;
            telefonInput.value = service.telefon || '';
            konumInput.value = service.konum || '';
            modalTitle.textContent = 'Servis Düzenle';
        }
    } else {
        // Add Mode
        serviceForm.reset();
        serviceIdInput.value = '';
        modalTitle.textContent = 'Yeni Servis Ekle';
    }
}

/**
 * Closes the modal.
 */
function closeModal() {
    serviceModal.classList.add('hidden');
}

/**
 * Handles form submission.
 */
serviceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = serviceIdInput.value;
    const services = Storage.getData('services') || [];

    const newService = {
        id: id || Storage.generateId('srv'),
        servisAdi: servisAdiInput.value,
        plaka: plakaInput.value,
        soforAdi: soforAdiInput.value,
        telefon: telefonInput.value,
        konum: konumInput.value
    };

    if (id) {
        // Update
        const index = services.findIndex(s => s.id === id);
        if (index !== -1) {
            services[index] = newService;
        }
    } else {
        // Add
        services.push(newService);
    }

    Storage.setData('services', services);
    closeModal();
    renderServices();
});

/**
 * Deletes a service.
 * @param {string} id - The ID of the service to delete.
 */
function deleteService(id) {
    if (confirm('Bu servisi silmek istediğinize emin misiniz?')) {
        let services = Storage.getData('services') || [];
        services = services.filter(s => s.id !== id);
        Storage.setData('services', services);
        renderServices();
    }
}

// Initial render
renderServices();
