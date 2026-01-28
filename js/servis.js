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
 * Toggles the visibility of the detail row.
 * @param {string} id - The ID of the row to toggle.
 */
function toggleDetail(id) {
    const detailRow = document.getElementById(`detail-${id}`);
    if (detailRow) {
        detailRow.classList.toggle('hidden');
    }
}

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
        // Main Row
        const row = document.createElement('tr');
        row.innerHTML = `
            <td onclick="toggleDetail('${service.id}')" class="px-2 py-2 md:px-5 md:py-5 border-b border-gray-200 bg-white text-xs md:text-sm cursor-pointer hover:bg-gray-50 text-blue-600 font-bold">
                <div class="flex items-center">
                    <span>${service.servisAdi}</span>
                    <span class="ml-2 text-xs text-gray-400">▼</span>
                </div>
            </td>
            <td class="px-2 py-2 md:px-5 md:py-5 border-b border-gray-200 bg-white text-xs md:text-sm">
                <span class="relative inline-block px-3 py-1 font-semibold text-gray-900 leading-tight">
                    <span aria-hidden class="absolute inset-0 bg-gray-200 opacity-50 rounded-full"></span>
                    <span class="relative text-xs md:text-sm">${service.plaka}</span>
                </span>
            </td>
            <td class="px-2 py-2 md:px-5 md:py-5 border-b border-gray-200 bg-white text-xs md:text-sm">
                 <p class="text-gray-900 whitespace-no-wrap">${service.soforAdi}</p>
            </td>
            <td class="hidden md:table-cell px-5 py-5 border-b border-gray-200 bg-white text-sm">
                 <p class="text-gray-900 whitespace-no-wrap">${service.telefon || '-'}</p>
            </td>
            <td class="hidden md:table-cell px-5 py-5 border-b border-gray-200 bg-white text-sm">
                 <p class="text-gray-900 whitespace-no-wrap">${service.konum || '-'}</p>
            </td>
            <td class="px-2 py-2 md:px-5 md:py-5 border-b border-gray-200 bg-white text-xs md:text-sm text-right">
                <button onclick="openModal('${service.id}')" class="text-blue-600 hover:text-blue-900 mr-2" title="Düzenle">✏️</button>
                <button onclick="deleteService('${service.id}')" class="text-red-600 hover:text-red-900" title="Sil">🗑️</button>
            </td>
        `;
        serviceList.appendChild(row);

        // Detail Row
        const detailRow = document.createElement('tr');
        detailRow.id = `detail-${service.id}`;
        detailRow.className = 'hidden bg-gray-50 transition-all duration-300 ease-in-out';
        detailRow.innerHTML = `
            <td colspan="6" class="px-5 py-3 border-b border-gray-200">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <p><strong>📍 Konum:</strong> ${service.konum || 'Belirtilmedi'}</p>
                    <p><strong>📞 Telefon:</strong> <a href="tel:${service.telefon}" class="text-blue-500 underline">${service.telefon || '-'}</a></p>
                    <p><strong>👤 Şoför:</strong> ${service.soforAdi}</p>
                    <p><strong>🚌 Plaka:</strong> ${service.plaka}</p>
                </div>
            </td>
        `;
        serviceList.appendChild(detailRow);
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
