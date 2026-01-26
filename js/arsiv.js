/**
 * js/arsiv.js
 * Manages Archive logic - Student-centric view
 */

const archiveList = document.getElementById('archiveList');
const filterDate = document.getElementById('filterDate');
const filterService = document.getElementById('filterService');

/**
 * Load Services for filter
 */
function loadServices() {
    const services = Storage.getData('services') || [];
    services.forEach(s => {
        const option = document.createElement('option');
        option.value = s.id;
        option.textContent = `${s.servisAdi} (${s.plaka})`;
        filterService.appendChild(option);
    });
}

function renderArchive() {
    const trackingData = Storage.getData('tracking') || [];
    const students = Storage.getData('students') || [];
    const services = Storage.getData('services') || [];
    const dateVal = filterDate.value;
    const serviceVal = filterService.value;

    archiveList.innerHTML = '';

    // Filter tracking data
    let filteredData = trackingData;
    if (dateVal) {
        filteredData = filteredData.filter(t => t.tarih === dateVal);
    }
    if (serviceVal) {
        filteredData = filteredData.filter(t => t.servisId === serviceVal);
    }

    // Build student attendance map
    const studentAttendanceMap = {};
    
    filteredData.forEach(record => {
        record.kayitlar.forEach(attendance => {
            if (!studentAttendanceMap[attendance.ogrenciId]) {
                studentAttendanceMap[attendance.ogrenciId] = [];
            }
            studentAttendanceMap[attendance.ogrenciId].push({
                tarih: record.tarih,
                sabah: attendance.sabah,
                aksam: attendance.aksam,
                servisId: record.servisId
            });
        });
    });

    if (Object.keys(studentAttendanceMap).length === 0) {
        archiveList.innerHTML = '<tr><td colspan="5" class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">Kayıt bulunamadı.</td></tr>';
        return;
    }

    // Sort students by name
    const sortedStudentIds = Object.keys(studentAttendanceMap).sort((a, b) => {
        const studentA = students.find(s => s.id === a);
        const studentB = students.find(s => s.id === b);
        const nameA = studentA ? `${studentA.ad} ${studentA.soyad}` : 'Silinmiş';
        const nameB = studentB ? `${studentB.ad} ${studentB.soyad}` : 'Silinmiş';
        return nameA.localeCompare(nameB);
    });

    sortedStudentIds.forEach(studentId => {
        const student = students.find(s => s.id === studentId);
        if (!student) return;

        const attendances = studentAttendanceMap[studentId];
        
        // Sort by date
        attendances.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));

        const row = document.createElement('tr');
        
        // Build attendance dates column
        let datesHtml = '';
        attendances.forEach(att => {
            const sabahIcon = att.sabah ? '<span class="text-green-600">🌞✔</span>' : '<span class="text-red-600">🌞✘</span>';
            const aksamIcon = att.aksam ? '<span class="text-green-600">🌙✔</span>' : '<span class="text-red-600">🌙✘</span>';
            datesHtml += `<div class="text-xs mb-1"><strong>${att.tarih}</strong> ${sabahIcon} ${aksamIcon}</div>`;
        });

        row.innerHTML = `
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p class="text-gray-900 font-semibold">${student.ad} ${student.soyad}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p class="text-gray-900">${student.okulNo || '-'}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <span class="inline-block bg-blue-100 rounded px-2 py-1 text-xs font-semibold text-blue-900">${student.sinif}</span>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                ${datesHtml}
            </td>
        `;
        archiveList.appendChild(row);
    });
}

// Initial
loadServices();
renderArchive();
