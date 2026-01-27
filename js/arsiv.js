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

    // Update table headers with dates and time periods
    const thead = document.querySelector('table thead');
    
    // Remove all rows except the first one (student info headers)
    const allRows = thead.querySelectorAll('tr');
    if (allRows.length > 1) {
        for (let i = 1; i < allRows.length; i++) {
            allRows[i].remove();
        }
    }
    
    const firstRow = thead.querySelector('tr');
    
    // Remove date headers if they exist
    const dateHeaders = firstRow.querySelectorAll('th[data-date]');
    dateHeaders.forEach(h => h.remove());
    
    // Create second row for time periods (Sabah/Aksam)
    const secondRow = document.createElement('tr');
    
    // Add empty cells for fixed columns
    for (let i = 0; i < 3; i++) {
        const td = document.createElement('th');
        td.className = 'px-5 py-3 border-b-2 border-gray-200 bg-gray-100';
        secondRow.appendChild(td);
    }
    
    // Add date headers in first row and sub-headers in second row
    sortedDates.forEach((date, index) => {
        // Determine border style - thick border between dates
        const borderLeftStyle = index > 0 ? 'border-l-2 border-gray-500' : '';
        const borderRightStyle = 'border-r-2 border-gray-400';
        const borderStyle = `${borderLeftStyle} ${borderRightStyle}`;
        
        // Date header in first row with colspan=2
        const thDate = document.createElement('th');
        thDate.setAttribute('data-date', date);
        thDate.setAttribute('colspan', '2');
        thDate.className = `px-2 py-2 border-r-2 border-black bg-purple-100 text-center text-xs font-semibold text-purple-700 uppercase tracking-wider ${borderStyle}`;
        thDate.style.writingMode = 'vertical-rl';
        thDate.style.transform = 'rotate(180deg)';
        thDate.style.height = '120px';
        thDate.style.paddingTop = '10px';
        thDate.style.paddingBottom = '10px';
        thDate.textContent = date;
        firstRow.appendChild(thDate);
        
        // Sabah sub-header in second row
        const thSabah = document.createElement('th');
        thSabah.setAttribute('data-date', date);
        thSabah.setAttribute('data-period', 'sabah');
        thSabah.className = `px-2 py-2  border-1 border-gray-200 bg-yellow-100 text-center text-lg font-semibold text-yellow-700 ${borderStyle}`;
        thSabah.innerHTML = 'S';
        secondRow.appendChild(thSabah);
        
        // Aksam sub-header in second row
        const thAksam = document.createElement('th');
        thAksam.setAttribute('data-date', date);
        thAksam.setAttribute('data-period', 'aksam');
        thAksam.className = `px-2 py-2 border-r-2 border-black bg-blue-100 text-center text-lg font-semibold text-blue-700 ${borderStyle}`;
        thAksam.innerHTML = 'A';
        secondRow.appendChild(thAksam);
    });
    
    thead.appendChild(secondRow);

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
            <td class="px-2 py-2 border-b border-gray-200 bg-white text-sm sticky left-0 z-5">
                <p class="text-gray-900 font-semibold">${student.ad} ${student.soyad}</p>
            </td>
            <td class="px-2 py-2 border-b border-gray-200 bg-white text-sm sticky left-24 z-5">
                <p class="text-gray-900">${student.okulNo || '-'}</p>
            </td>
            <td class="px-2 py-2 border-b border-gray-200 bg-white text-sm sticky left-40 z-5">
                <span class="inline-block bg-blue-100 rounded px-2 py-1 text-xs font-semibold text-blue-900">${student.sinif}</span>
            </td>
        `;

        // Add attendance for each date
        sortedDates.forEach(date => {
            const att = attendances[date];
            
            // Sabah column
            if (att) {
                const sabahClass = att.sabah ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
                const sabahIcon = att.sabah ? '✔' : '✘';
                rowHtml += `
                    <td class="px-2 py-2 border-1 border-gray-200 text-sm text-center font-bold ${sabahClass}">
                        ${sabahIcon}
                    </td>
                `;
            } else {
                rowHtml += `<td class="px-2 py-2 border-1 border-gray-200 bg-white text-sm text-center">-</td>`;
            }
            
            // Aksam column
            if (att) {
                const aksamClass = att.aksam ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
                const aksamIcon = att.aksam ? '✔' : '✘';
                rowHtml += `
                    <td class="px-2 py-2 border-r-2 border-black text-sm text-center font-bold ${aksamClass}">
                        ${aksamIcon}
                    </td>
                `;
            } else {
                rowHtml += `<td class="px-2 py-2 border-r-2 border-black bg-white text-sm text-center">-</td>`;
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
