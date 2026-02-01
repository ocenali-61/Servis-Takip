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
const serviceIdInput = document.getElementById('plaka');
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
    const plaka = plakaInput.value.trim();

    // Use plaka as ID for new services
    const newService = {
        id: id || plaka,
        servisAdi: servisAdiInput.value,
        plaka: plaka,
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

/**
 * Exports services to an Excel file.
 */
function exportServicesToExcel() {
    const services = Storage.getData('services') || [];

    if (services.length === 0) {
        alert('Dışa aktarılacak servis bulunamadı.');
        return;
    }

    // Prepare data with Turkish headers
    const exportData = services.map(service => {
        return {
            'Servis Adı': service.servisAdi,
            'Plaka': service.plaka,
            'Şoför Adı': service.soforAdi,
            'Telefon': service.telefon || '',
            'Konum': service.konum || '',
            'Servis ID': service.id
        };
    });

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Servisler');

    // Auto-fit column widths
    const colWidths = [
        { wch: 20 }, // Servis Adı
        { wch: 12 }, // Plaka
        { wch: 20 }, // Şoför Adı
        { wch: 15 }, // Telefon
        { wch: 25 }, // Konum
        { wch: 15 }  // Servis ID
    ];
    ws['!cols'] = colWidths;

    // Generate filename with date
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const filename = `Servisler_${dateStr}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
}

/**
 * Imports services from an Excel file.
 * @param {Event} event - The file input change event.
 */
function importServicesFromExcel(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Get first sheet
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length === 0) {
                alert('Excel dosyasında veri bulunamadı.');
                return;
            }

            // Get existing data
            const services = Storage.getData('services') || [];

            let importedCount = 0;
            let skippedCount = 0;

            jsonData.forEach(row => {
                // Support both Turkish and English column names
                const servisAdi = row['Servis Adı'] || row['ServisAdi'] || row['servisAdi'] || '';
                const plaka = row['Plaka'] || row['plaka'] || '';
                const soforAdi = row['Şoför Adı'] || row['SoforAdi'] || row['soforAdi'] || '';
                const telefon = row['Telefon'] || row['telefon'] || '';
                const konum = row['Konum'] || row['konum'] || '';

                // Validate required fields
                if (!servisAdi || !plaka || !soforAdi) {
                    skippedCount++;
                    return;
                }

                // Create new service (use plaka as ID)
                const plakaValue = plaka.toString().trim();
                const newService = {
                    id: plakaValue,
                    servisAdi: servisAdi.toString().trim(),
                    plaka: plakaValue,
                    soforAdi: soforAdi.toString().trim(),
                    telefon: telefon.toString().trim(),
                    konum: konum.toString().trim()
                };

                services.push(newService);
                importedCount++;
            });

            // Save updated services
            Storage.setData('services', services);
            renderServices();

            // Show result
            let message = `${importedCount} servis başarıyla içe aktarıldı.`;
            if (skippedCount > 0) {
                message += `\n${skippedCount} satır eksik bilgi nedeniyle atlandı.`;
            }
            alert(message);

        } catch (error) {
            console.error('Excel import error:', error);
            alert('Excel dosyası okunurken bir hata oluştu. Lütfen dosya formatını kontrol edin.');
        }
    };

    reader.readAsArrayBuffer(file);

    // Reset file input
    event.target.value = '';
}

// Initial render
renderServices();
