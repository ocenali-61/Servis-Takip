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
let attendanceState = {}; // { studentId: 'GELDİ' | 'GELMEDİ' }

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
            attendanceState[k.ogrenciId] = k.durum;
        });
    } else {
        statusMessage.textContent = 'Yeni Kayıt';
        statusMessage.className = 'text-sm font-bold text-green-500';
        // Default to GELDI (true) or null? Let's default to GELDI (true)
        currentStudents.forEach(s => {
            attendanceState[s.id] = true;
        });
    }

    renderList();
    attendancePanel.classList.remove('hidden');
}

function renderList() {
    attendanceList.innerHTML = '';
    currentStudents.forEach(student => {
        const isPresent = attendanceState[student.id] === true;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p class="text-gray-900 whitespace-no-wrap font-semibold">${student.ad} ${student.soyad}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                 <div class="flex justify-center space-x-4">
                    <button onclick="toggleAttendance('${student.id}', true)" 
                        class="px-4 py-2 rounded font-bold ${isPresent ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}">
                        ✔ Geldi
                    </button>
                    <button onclick="toggleAttendance('${student.id}', false)" 
                        class="px-4 py-2 rounded font-bold ${!isPresent ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'}">
                        ❌ Gelmedi
                    </button>
                 </div>
            </td>
        `;
        attendanceList.appendChild(row);
    });
}

function toggleAttendance(studentId, status) {
    attendanceState[studentId] = status;
    renderList(); // Re-render to update button styles
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
            durum: attendanceState[key]
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
