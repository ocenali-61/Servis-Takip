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
        studentList.innerHTML = '<tr><td colspan="6" class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">Hiç öğrenci bulunamadı.</td></tr>';
        return;
    }

    filteredStudents.forEach(student => {
        const service = services.find(s => s.id === student.servisId);
        const serviceName = service ? `${service.servisAdi} (${service.plaka})` : '<span class="text-red-500">Servis Silinmiş</span>';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-2 py-2 md:px-5 md:py-5 border-b border-gray-200 bg-white text-xs md:text-sm">
                <p class="text-gray-900 whitespace-no-wrap font-semibold">${student.ad} ${student.soyad}</p>
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

// Initial load
loadServiceDropdowns();
renderStudents();
