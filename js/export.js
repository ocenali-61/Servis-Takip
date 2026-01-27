/**
 * js/export.js
 * Manages Report Generation and Export.
 */

const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const filterService = document.getElementById('filterService');
const reportPanel = document.getElementById('reportPanel');
const reportList = document.getElementById('reportList');

let currentReportData = [];

// Initialize dates
const today = new Date().toISOString().split('T')[0];
startDateInput.value = today;
endDateInput.value = today;

/**
 * Load Services
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

function generateReport() {
    const start = startDateInput.value;
    const end = endDateInput.value;
    const serviceId = filterService.value;

    if (!start || !end) {
        alert('Lütfen tarih aralığı seçiniz.');
        return;
    }

    const trackingData = Storage.getData('tracking') || [];
    const students = Storage.getData('students') || [];
    const services = Storage.getData('services') || [];

    // Filter Tracking Records
    const filteredTracking = trackingData.filter(t => {
        return t.tarih >= start && t.tarih <= end &&
            (!serviceId || t.servisId === serviceId);
    });

    // Flatten Data for Table
    currentReportData = [];
    filteredTracking.forEach(record => {
        const service = services.find(s => s.id === record.servisId);
        const serviceName = service ? service.servisAdi : 'Bilinmiyor';

        record.kayitlar.forEach(k => {
            const student = students.find(s => s.id === k.ogrenciId);
            if (student) { // Only show existing students
                currentReportData.push({
                    tarih: record.tarih,
                    servis: serviceName,
                    ogrenci: `${student.ad} ${student.soyad}`,
                    sabah: k.sabah ? '+' : '-',
                    aksam: k.aksam ? '+' : '-'
                });
            }
        });
    });

    // Sort by Date then Service then Student
    currentReportData.sort((a, b) => {
        if (a.tarih !== b.tarih) return a.tarih.localeCompare(b.tarih);
        if (a.servis !== b.servis) return a.servis.localeCompare(b.servis);
        return a.ogrenci.localeCompare(b.ogrenci);
    });

    renderTable();
    reportPanel.classList.remove('hidden');
}

function renderTable() {
    reportList.innerHTML = '';

    if (currentReportData.length === 0) {
        reportList.innerHTML = '<tr><td colspan="4" class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">Kayıt bulunamadı.</td></tr>';
        return;
    }

    currentReportData.forEach(row => {
        const tr = document.createElement('tr');
        const sabahClass = row.sabah === '+' ? 'text-green-600' : 'text-red-600';
        const aksamClass = row.aksam === '+' ? 'text-green-600' : 'text-red-600';
        tr.innerHTML = `
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">${row.tarih}</td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">${row.servis}</td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">${row.ogrenci}</td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center font-bold ${sabahClass}">${row.sabah}</td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center font-bold ${aksamClass}">${row.aksam}</td>
        `;
        reportList.appendChild(tr);
    });
}

function exportPDF() {
    if (currentReportData.length === 0) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "normal");
    doc.text("Yoklama Raporu", 14, 15);
    doc.setFontSize(10);
    doc.text(`Tarih: ${startDateInput.value} - ${endDateInput.value}`, 14, 22);

    const tableColumn = ["Tarih", "Servis", "Ogrenci", "Sabah", "Aksam"];
    const tableRows = [];

    currentReportData.forEach(row => {
        tableRows.push([row.tarih, row.servis, row.ogrenci, row.sabah, row.aksam]);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 25,
    });

    doc.save(`Rapor_${startDateInput.value}_${endDateInput.value}.pdf`);
}

function exportExcel() {
    if (currentReportData.length === 0) return;

    const ws = XLSX.utils.json_to_sheet(currentReportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rapor");

    XLSX.writeFile(wb, `Rapor_${startDateInput.value}_${endDateInput.value}.xlsx`);
}

// Initial
loadServices();
