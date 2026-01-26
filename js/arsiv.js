/**
 * js/arsiv.js
 * Manages Archive logic.
 */

const archiveList = document.getElementById('archiveList');
const filterDate = document.getElementById('filterDate');
const filterService = document.getElementById('filterService');
const detailModal = document.getElementById('detailModal');
const detailContent = document.getElementById('detailContent');
const detailTitle = document.getElementById('detailTitle');

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
    const services = Storage.getData('services') || [];
    const dateVal = filterDate.value;
    const serviceVal = filterService.value;

    archiveList.innerHTML = '';

    // Filter
    let filteredData = trackingData;
    if (dateVal) {
        filteredData = filteredData.filter(t => t.tarih === dateVal);
    }
    if (serviceVal) {
        filteredData = filteredData.filter(t => t.servisId === serviceVal);
    }

    // Sort by Date Descending
    filteredData.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));

    if (filteredData.length === 0) {
        archiveList.innerHTML = '<tr><td colspan="4" class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">Kayıt bulunamadı.</td></tr>';
        return;
    }

    filteredData.forEach(item => {
        const service = services.find(s => s.id === item.servisId);
        const serviceName = service ? service.servisAdi : 'Bilinmeyen Servis';

        const total = item.kayitlar.length;
        const present = item.kayitlar.filter(k => k.durum).length;

        const row = document.createElement('tr');
        row.innerHTML = `
             <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-gray-900">${item.tarih}</td>
             <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-gray-900">${serviceName}</td>
             <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                <span class="inline-block rounded-full px-3 py-1 text-sm font-semibold 
                    ${present === total ? 'bg-green-200 text-green-900' : 'bg-yellow-200 text-yellow-900'}">
                    ${present} / ${total}
                </span>
             </td>
             <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                <button onclick='showDetails(${JSON.stringify(item)})' class="text-blue-600 hover:text-blue-900">Görüntüle</button>
             </td>
        `;
        archiveList.appendChild(row);
    });
}

function showDetails(item) {
    const students = Storage.getData('students') || [];

    let html = '<ul class="divide-y divide-gray-200">';
    item.kayitlar.forEach(k => {
        const student = students.find(s => s.id === k.ogrenciId);
        const name = student ? `${student.ad} ${student.soyad}` : 'Silinmiş Öğrenci';
        const icon = k.durum ? '✅' : '❌';
        const color = k.durum ? 'text-green-600' : 'text-red-600';

        html += `
            <li class="py-2 flex justify-between">
                <span class="text-gray-700">${name}</span>
                <span class="${color} font-bold">${icon}</span>
            </li>
        `;
    });
    html += '</ul>';

    detailTitle.textContent = `${item.tarih} Detayları`;
    detailContent.innerHTML = html;
    detailModal.classList.remove('hidden');
}

function closeModal() {
    detailModal.classList.add('hidden');
}

// Initial
loadServices();
renderArchive();
