/**
 * js/arsiv.js
 * Manages Archive logic - Student-centric view with dates as columns
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

    // Extract all unique dates and sort them
    const allDates = new Set();
    filteredData.forEach(record => {
        allDates.add(record.tarih);
    });
    const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));

    if (sortedDates.length === 0) {
        archiveList.innerHTML = '<tr><td colspan="4" class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">Kayıt bulunamadı.</td></tr>';
        return;
    }

    // Build student attendance map
    const studentAttendanceMap = {};
    
    filteredData.forEach(record => {
        record.kayitlar.forEach(attendance => {
            if (!studentAttendanceMap[attendance.ogrenciId]) {
                studentAttendanceMap[attendance.ogrenciId] = {};
            }
            studentAttendanceMap[attendance.ogrenciId][record.tarih] = {
                sabah: attendance.sabah,
                aksam: attendance.aksam
            };
        });
    });

    if (Object.keys(studentAttendanceMap).length === 0) {
        archiveList.innerHTML = '<tr><td colspan="' + (3 + sortedDates.length) + '" class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">Kayıt bulunamadı.</td></tr>';
        return;
    }

    // Update table headers with dates
    const thead = document.querySelector('table thead tr');
    const existingHeaders = thead.querySelectorAll('th').length;
    
    // Remove date headers if they exist
    const dateHeaders = thead.querySelectorAll('th[data-date]');
    dateHeaders.forEach(h => h.remove());
    
    // Add date headers
    sortedDates.forEach(date => {
        const th = document.createElement('th');
        th.setAttribute('data-date', date);
        th.className = 'px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider';
        th.textContent = date;
        thead.appendChild(th);
    });

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
        
        let rowHtml = `
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p class="text-gray-900 font-semibold">${student.ad} ${student.soyad}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p class="text-gray-900">${student.okulNo || '-'}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <span class="inline-block bg-blue-100 rounded px-2 py-1 text-xs font-semibold text-blue-900">${student.sinif}</span>
            </td>
        `;

        // Add attendance for each date
        sortedDates.forEach(date => {
            const att = attendances[date];
            if (att) {
                const sabahClass = att.sabah ? 'text-green-600' : 'text-red-600';
                const aksamClass = att.aksam ? 'text-green-600' : 'text-red-600';
                const sabahIcon = att.sabah ? '✔' : '✘';
                const aksamIcon = att.aksam ? '✔' : '✘';
                
                rowHtml += `
                    <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                        <div class="flex justify-center space-x-2">
                            <span class="${sabahClass} font-bold">🌞${sabahIcon}</span>
                            <span class="${aksamClass} font-bold">🌙${aksamIcon}</span>
                        </div>
                    </td>
                `;
            } else {
                rowHtml += `<td class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">-</td>`;
            }
        });

        const row = document.createElement('tr');
        row.innerHTML = rowHtml;
        archiveList.appendChild(row);
    });
}

// Initial
loadServices();
renderArchive();
