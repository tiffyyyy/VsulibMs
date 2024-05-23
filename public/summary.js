document.addEventListener('DOMContentLoaded', async function() {
    const floorSelect = document.getElementById('floor');
    const response = await fetch('/get-floors');
    const floors = await response.json();
    floors.forEach(floor => {
        const option = document.createElement('option');
        option.value = floor.floorId;
        option.textContent = floor.name;
        floorSelect.appendChild(option);
    });
});

document.getElementById('report-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    const floor = document.getElementById('floor').value;
    const year = document.getElementById('year').value;

    const response = await fetch(`/generate-report?floor=${floor}&year=${year}`);
    const data = await response.json();

    const tableBody = document.querySelector('#report-table tbody');
    tableBody.innerHTML = '';

    for (const [areaName, equipment] of Object.entries(data)) {
        const areaRow = document.createElement('tr');
        areaRow.classList.add('area-name');
        const areaCell = document.createElement('td');
        areaCell.colSpan = 26;
        areaCell.textContent = areaName;
        areaRow.appendChild(areaCell);
        tableBody.appendChild(areaRow);

        equipment.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.equip_no}</td>
                <td>${row.equip_name}</td>
                <td class="centered-column">${row.P_january || ''}</td>
                <td class="centered-column">${row.A_january || ''}</td>
                <td class="centered-column">${row.P_february || ''}</td>
                <td class="centered-column">${row.A_february || ''}</td>
                <td class="centered-column">${row.P_march || ''}</td>
                <td class="centered-column">${row.A_march || ''}</td>
                <td class="centered-column">${row.P_april || ''}</td>
                <td class="centered-column">${row.A_april || ''}</td>
                <td class="centered-column">${row.P_may || ''}</td>
                <td class="centered-column">${row.A_may || ''}</td>
                <td class="centered-column">${row.P_june || ''}</td>
                <td class="centered-column">${row.A_june || ''}</td>
                <td class="centered-column">${row.P_july || ''}</td>
                <td class="centered-column">${row.A_july || ''}</td>
                <td class="centered-column">${row.P_august || ''}</td>
                <td class="centered-column">${row.A_august || ''}</td>
                <td class="centered-column">${row.P_september || ''}</td>
                <td class="centered-column">${row.A_september || ''}</td>
                <td class="centered-column">${row.P_october || ''}</td>
                <td class="centered-column">${row.A_october || ''}</td>
                <td class="centered-column">${row.P_november || ''}</td>
                <td class="centered-column">${row.A_november || ''}</td>
                <td class="centered-column">${row.P_december || ''}</td>
                <td class="centered-column">${row.A_december || ''}</td>
            `;
            tableBody.appendChild(tr);
        });
    }
});

async function generatePDF() {
    const clonedDocument = document.documentElement.cloneNode(true);

    const reportForm = clonedDocument.querySelector('#report-form');
    if (reportForm) {
        reportForm.remove();
    }
        const generatePdfBtn = clonedDocument.querySelector('.generate-pdf-btn');
        if (generatePdfBtn) {
            generatePdfBtn.remove();
    }

    const htmlContent = clonedDocument.outerHTML;

    const response = await fetch('/generate-pdf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ htmlContent })
    });

    if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Maintenance Annual Report.pdf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.open(url, '_blank');
        } else {
            console.error('Failed to generate PDF.');
        }
}