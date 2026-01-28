/**
 * js/takip.js
 * Manages Attendance Tracking logic.
 */

// DOM Elements
const tarihInput = document.getElementById('tarih');
const servisInput = document.getElementById('servisSecimi');
const attendancePanel = document.getElementById('attendancePanel');
const attendanceList = document.getElementById('attendanceList');
const statusMessage = document.getElementById('statusMessage');

// State
let currentStudents = [];
let attendanceState = {}; // { studentId: { sabah: bool, aksam: bool } }

// Initialize Date to Today
const today = new Date().toISOString().split('T')[0];
tarihInput.value = today;

/**
 * Load Services
 */
function loadServices() {
    const services = Storage.getData('services') || [];
    services.forEach(s => {
        const option = document.createElement('option');
        option.value = s.id;
        option.textContent = `${s.servisAdi} (${s.plaka})`;
        servisInput.appendChild(option);
    });
}

function loadList() {
    const servisId = servisInput.value;
    const tarih = tarihInput.value;

    if (!servisId || !tarih) {
        alert('Lütfen Tarih ve Servis seçiniz.');
        return;
    }

    // Load Students for this service
    const allStudents = Storage.getData('students') || [];
    currentStudents = allStudents.filter(s => s.servisId === servisId);

    if (currentStudents.length === 0) {
        alert('Bu serviste kayıtlı öğrenci yok.');
        attendancePanel.classList.add('hidden');
        return;
    }

    // Check if attendance record exists
    const trackingData = Storage.getData('tracking') || [];
    const existingRecord = trackingData.find(t => t.tarih === tarih && t.servisId === servisId);

    attendanceState = {};
    if (existingRecord) {
        statusMessage.textContent = 'Mevcut Kayıt Düzenleniyor';
        statusMessage.className = 'text-sm font-bold text-blue-500';
        existingRecord.kayitlar.forEach(k => {
            attendanceState[k.ogrenciId] = { sabah: k.sabah, aksam: k.aksam };
        });
    } else {
        statusMessage.textContent = 'Yeni Kayıt';
        statusMessage.className = 'text-sm font-bold text-green-500';
        currentStudents.forEach(s => {
            attendanceState[s.id] = { sabah: true, aksam: true };
        });
    }

    renderList();
    attendancePanel.classList.remove('hidden');
}

function renderList() {
    attendanceList.innerHTML = '';
    currentStudents.forEach(student => {
        const state = attendanceState[student.id] || { sabah: true, aksam: true };

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-2 py-2 md:px-5 md:py-5 border-b border-gray-200 bg-white text-xs md:text-sm">
                <p class="text-gray-900 whitespace-no-wrap font-semibold">${student.ad} ${student.soyad}</p>
            </td>
            <td class="px-2 py-2 md:px-5 md:py-5 border-b border-gray-200 bg-white text-xs md:text-sm">
                <p class="text-gray-900 whitespace-no-wrap font-semibold">${student.okulNo}</p>
            </td>
            <td class="px-2 py-2 md:px-5 md:py-5 border-b border-gray-200 bg-white text-xs md:text-sm">
                <p class="text-gray-900 whitespace-no-wrap font-semibold">${student.sinif}</p>
            </td>
            <td class="px-2 py-2 md:px-5 md:py-5 border-b border-gray-200 bg-white text-xs md:text-sm text-center">
                 <button onclick="toggleAttendance('${student.id}', 'sabah')" 
                    class="w-8 h-8 md:w-10 md:h-10 rounded-full font-bold text-sm md:text-lg focus:outline-none ${state.sabah ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}">
                    ${state.sabah ? '✔' : '✘'}
                 </button>
            </td>
            <td class="px-2 py-2 md:px-5 md:py-5 border-b border-gray-200 bg-white text-xs md:text-sm text-center">
                 <button onclick="toggleAttendance('${student.id}', 'aksam')" 
                    class="w-8 h-8 md:w-10 md:h-10 rounded-full font-bold text-sm md:text-lg focus:outline-none ${state.aksam ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}">
                    ${state.aksam ? '✔' : '✘'}
                 </button>
            </td>
        `;
        attendanceList.appendChild(row);
    });
}

function toggleAttendance(studentId, timeOfDay) {
    if (!attendanceState[studentId]) {
        attendanceState[studentId] = { sabah: true, aksam: true };
    }
    attendanceState[studentId][timeOfDay] = !attendanceState[studentId][timeOfDay];
    renderList();
}

function saveAttendance() {
    const servisId = servisInput.value;
    const tarih = tarihInput.value;

    if (!servisId || !tarih) return;

    const trackingData = Storage.getData('tracking') || [];

    const newRecord = {
        tarih: tarih,
        servisId: servisId,
        kayitlar: Object.keys(attendanceState).map(key => ({
            ogrenciId: key,
            sabah: attendanceState[key].sabah,
            aksam: attendanceState[key].aksam
        }))
    };

    // Check if update or new
    const index = trackingData.findIndex(t => t.tarih === tarih && t.servisId === servisId);
    if (index !== -1) {
        trackingData[index] = newRecord;
    } else {
        trackingData.push(newRecord);
    }

    Storage.setData('tracking', trackingData);
    alert('Yoklama başarıyla kaydedildi.');
}

// Initial
loadServices();
