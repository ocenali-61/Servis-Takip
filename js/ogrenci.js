/**
 * js/ogrenci.js
 * Manages Student CRUD operations.
 */

// DOM Elements
const studentList = document.getElementById('studentList');
const studentModal = document.getElementById('studentModal');
const studentForm = document.getElementById('studentForm');
const modalTitle = document.getElementById('modalTitle');
const filterServiceSelect = document.getElementById('filterService');

// Inputs
const studentIdInput = document.getElementById('studentId');
const adInput = document.getElementById('ad');
const soyadInput = document.getElementById('soyad');
const okulNoInput = document.getElementById('okulNo');
const sinifInput = document.getElementById('sinif');
const veliAdiInput = document.getElementById('veliAdi');
const veliTelefonInput = document.getElementById('veliTelefon');
const servisIdInput = document.getElementById('servisId');

/**
 * Loads services into dropdowns.
 */
function loadServiceDropdowns() {
    const services = Storage.getData('services') || [];
    const options = services.map(s => `<option value="${s.id}">${s.servisAdi} (${s.plaka})</option>`).join('');

    // Filter dropdown (keep "All" option)
    const currentFilter = filterServiceSelect.value;
    filterServiceSelect.innerHTML = '<option value="">Tüm Servisler</option>' + options;
    filterServiceSelect.value = currentFilter;

    // Modal dropdown
    servisIdInput.innerHTML = '<option value="">Servis Seçin</option>' + options;
}

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
 * Renders the list of students.
 */
function renderStudents() {
    const students = Storage.getData('students') || [];
    const services = Storage.getData('services') || [];
    const filterValue = filterServiceSelect.value;

    studentList.innerHTML = '';

    const filteredStudents = filterValue
        ? students.filter(s => s.servisId === filterValue)
        : students;

    if (filteredStudents.length === 0) {
        studentList.innerHTML = '<tr><td colspan="7" class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">Hiç öğrenci bulunamadı.</td></tr>';
        return;
    }

    filteredStudents.forEach(student => {
        const service = services.find(s => s.id === student.servisId);
        const serviceName = service ? `${service.servisAdi} (${service.plaka})` : '<span class="text-red-500">Servis Silinmiş</span>';

        // Main Row
        const row = document.createElement('tr');
        row.innerHTML = `
            <td onclick="toggleDetail('${student.id}')" class="px-2 py-2 md:px-5 md:py-5 border-b border-gray-200 bg-white text-xs md:text-sm cursor-pointer hover:bg-gray-50 text-blue-600 font-bold">
                 <div class="flex items-center">
                    <span>${student.ad} ${student.soyad}</span>
                    <span class="ml-2 text-xs text-gray-400">▼</span>
                </div>
            </td>
            <td class="hidden md:table-cell px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p class="text-gray-900 whitespace-no-wrap">${student.okulNo || '-'}</p>
            </td>
            <td class="px-2 py-2 md:px-5 md:py-5 border-b border-gray-200 bg-white text-xs md:text-sm">
                 <span class="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 mr-2 mb-2">${student.sinif}</span>
            </td>
             <td class="hidden md:table-cell px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p class="text-gray-900 whitespace-no-wrap">${student.veliAdi || '-'}</p>
            </td>
            <td class="px-2 py-2 md:px-5 md:py-5 border-b border-gray-200 bg-white text-xs md:text-sm">
                <p class="text-gray-900 whitespace-no-wrap"><a href="tel:${student.veliTelefon}" class="text-blue-500 underline">${student.veliTelefon || '-'}</a></p>
            </td>
            <td class="hidden md:table-cell px-5 py-5 border-b border-gray-200 bg-white text-sm">
                 <p class="text-gray-600 whitespace-no-wrap text-xs">${serviceName}</p>
            </td>
            <td class="px-2 py-2 md:px-5 md:py-5 border-b border-gray-200 bg-white text-xs md:text-sm text-right">
                <button onclick="openModal('${student.id}')" class="text-blue-600 hover:text-blue-900 mr-2" title="Düzenle">✏️</button>
                <button onclick="deleteStudent('${student.id}')" class="text-red-600 hover:text-red-900" title="Sil">🗑️</button>
            </td>
        `;
        studentList.appendChild(row);

        // Detail Row
        const detailRow = document.createElement('tr');
        detailRow.id = `detail-${student.id}`;
        detailRow.className = 'hidden bg-gray-50 transition-all duration-300 ease-in-out';
        detailRow.innerHTML = `
            <td colspan="7" class="px-5 py-3 border-b border-gray-200">
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <p><strong>🎓 Okul No:</strong> ${student.okulNo || '-'}</p>
                    <p><strong>👤 Veli:</strong> ${student.veliAdi || '-'}</p>
                    <p><strong>📞 Veli Tel:</strong> <a href="tel:${student.veliTelefon}" class="text-blue-500 underline">${student.veliTelefon || '-'}</a></p>
                    <p><strong>🚌 Servis:</strong> ${serviceName}</p>
                </div>
            </td>
        `;
        studentList.appendChild(detailRow);
    });
}

/**
 * Opens the modal for adding or editing.
 * @param {string|null} id - Student ID if editing.
 */
function openModal(id = null) {
    loadServiceDropdowns(); // Refresh services just in case
    studentModal.classList.remove('hidden');
    if (id) {
        // Edit Mode
        const students = Storage.getData('students') || [];
        const student = students.find(s => s.id === id);
        if (student) {
            studentIdInput.value = student.id;
            adInput.value = student.ad;
            soyadInput.value = student.soyad;
            okulNoInput.value = student.okulNo || '';
            sinifInput.value = student.sinif;
            veliAdiInput.value = student.veliAdi || '';
            veliTelefonInput.value = student.veliTelefon || '';
            servisIdInput.value = student.servisId;
            modalTitle.textContent = 'Öğrenci Düzenle';
        }
    } else {
        // Add Mode
        studentForm.reset();
        studentIdInput.value = '';
        modalTitle.textContent = 'Yeni Öğrenci Ekle';
    }
}

/**
 * Closes the modal.
 */
function closeModal() {
    studentModal.classList.add('hidden');
}

/**
 * Handles form submission.
 */
studentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = studentIdInput.value;
    const students = Storage.getData('students') || [];

    const newStudent = {
        id: id || Storage.generateId('ogr'),
        ad: adInput.value,
        soyad: soyadInput.value,
        okulNo: okulNoInput.value,
        sinif: sinifInput.value,
        veliAdi: veliAdiInput.value,
        veliTelefon: veliTelefonInput.value,
        servisId: servisIdInput.value
    };

    if (id) {
        // Update
        const index = students.findIndex(s => s.id === id);
        if (index !== -1) {
            students[index] = newStudent;
        }
    } else {
        // Add
        students.push(newStudent);
    }

    Storage.setData('students', students);
    closeModal();
    renderStudents();
});

/**
 * Deletes a student.
 * @param {string} id - The ID of the student to delete.
 */
function deleteStudent(id) {
    if (confirm('Bu öğrenciyi silmek istediğinize emin misiniz?')) {
        let students = Storage.getData('students') || [];
        students = students.filter(s => s.id !== id);
        Storage.setData('students', students);
        renderStudents();
    }
}

/**
 * Exports students to an Excel file.
 */
function exportToExcel() {
    const students = Storage.getData('students') || [];
    const services = Storage.getData('services') || [];

    if (students.length === 0) {
        alert('Dışa aktarılacak öğrenci bulunamadı.');
        return;
    }

    // Prepare data with Turkish headers and service names
    const exportData = students.map(student => {
        const service = services.find(s => s.id === student.servisId);
        const serviceName = service ? service.servisAdi : '';
        const servisPlaka = service ? service.plaka : '';

        return {
            'Ad': student.ad,
            'Soyad': student.soyad,
            'Okul No': student.okulNo || '',
            'Sınıf': student.sinif,
            'Veli Adı': student.veliAdi || '',
            'Veli Telefon': student.veliTelefon || '',
            'Servis': serviceName,
            'Servis Plaka': servisPlaka
        };
    });

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Öğrenciler');

    // Auto-fit column widths
    const colWidths = [
        { wch: 15 }, // Ad
        { wch: 15 }, // Soyad
        { wch: 12 }, // Okul No
        { wch: 10 }, // Sınıf
        { wch: 20 }, // Veli Adı
        { wch: 15 }, // Veli Telefon
        { wch: 20 }, // Servis
        { wch: 12 }  // Servis Plaka
    ];
    ws['!cols'] = colWidths;

    // Generate filename with date
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const filename = `Ogrenciler_${dateStr}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
}

/**
 * Imports students from an Excel file.
 * @param {Event} event - The file input change event.
 */
function importFromExcel(event) {
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
            const students = Storage.getData('students') || [];
            const services = Storage.getData('services') || [];

            // Map services by plaka for lookup
            const serviceMapByPlaka = {};
            const serviceMapByName = {};
            services.forEach(s => {
                serviceMapByPlaka[s.plaka] = s.id;
                serviceMapByName[s.servisAdi] = s.id;
            });

            let importedCount = 0;
            let skippedCount = 0;

            jsonData.forEach(row => {
                // Support both Turkish and English column names
                const ad = row['Ad'] || row['ad'] || '';
                const soyad = row['Soyad'] || row['soyad'] || '';
                const okulNo = row['Okul No'] || row['OkulNo'] || row['okulNo'] || '';
                const sinif = row['Sınıf'] || row['Sinif'] || row['sinif'] || '';
                const veliAdi = row['Veli Adı'] || row['VeliAdi'] || row['veliAdi'] || '';
                const veliTelefon = row['Veli Telefon'] || row['VeliTelefon'] || row['veliTelefon'] || '';
                const servisName = row['Servis'] || row['servis'] || '';
                const servisPlaka = row['Servis Plaka'] || row['ServisPlaka'] || row['Plaka'] || row['plaka'] || '';

                // Validate required fields
                if (!ad || !soyad || !sinif) {
                    skippedCount++;
                    return;
                }

                // Find service by plaka first, then by name
                let finalServisId = '';
                if (servisPlaka && serviceMapByPlaka[servisPlaka]) {
                    finalServisId = serviceMapByPlaka[servisPlaka];
                } else if (servisName && serviceMapByName[servisName]) {
                    finalServisId = serviceMapByName[servisName];
                }

                // Create new student
                const newStudent = {
                    id: Storage.generateId('ogr'),
                    ad: ad.toString().trim(),
                    soyad: soyad.toString().trim(),
                    okulNo: okulNo.toString().trim(),
                    sinif: sinif.toString().trim(),
                    veliAdi: veliAdi.toString().trim(),
                    veliTelefon: veliTelefon.toString().trim(),
                    servisId: finalServisId.toString().trim()
                };

                students.push(newStudent);
                importedCount++;
            });

            // Save updated students
            Storage.setData('students', students);
            renderStudents();

            // Show result
            let message = `${importedCount} öğrenci başarıyla içe aktarıldı.`;
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

// Initial load
loadServiceDropdowns();
renderStudents();
