function updateWelcomeMessage() {
    // Get the username from the cookie
    const usernameCookie = document.cookie.split('; ').find(cookie => cookie.startsWith('username='));
    if (usernameCookie) {
        const usernameValue = usernameCookie.split('=')[1];
        const username = decodeURIComponent(usernameValue);

        // Display the username in the welcome message
        document.getElementById('welcomeMessage').innerText = username;
    } else {
        console.log('Username cookie not found');
    }
}
window.addEventListener('load', updateWelcomeMessage);

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const historyId = urlParams.get('id');

    if (historyId) {
        fetch(`/history/${historyId}`)
            .then(response => response.json())
            .then(data => {
                const { historyDetails, equipmentDetails } = data;

                const actualDate = new Date(historyDetails.actualDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            
                document.getElementById('equip-img').innerHTML = `
                    <img  src="${equipmentDetails.equip_pic}" alt="equipment-picure">
                `;

                document.getElementById('planned-date').innerHTML = `
                    <p style="color: red;"><strong>Date Planned: ${actualDate}</strong></p>
                    <p><strong>Activity:</strong> xd</p>
                    <p><strong>Findings:</strong> xd</p>
                    <p><strong>Identified Problem:</strong> xd</p>
                    <p><strong>Replacement Parts:</strong> xd</p>
                `;

                document.getElementById('actual-date').innerHTML = `
                    <p style="color: green;"><strong>Maintenance Date: ${actualDate}</strong></p>
                    <p><strong>Activity:</strong> PC Monitor Replacement</p>
                    <p><strong>Problem Fixed:</strong> xd</p>
                    <p><strong>Performance:</strong> good</p>
                `;
        
                document.getElementById('equip-details').innerHTML = `
                    <p><strong>Equipment Name:</strong></p>
                    <p><strong>Asset ID:</strong> Ceiling fan</p>
                    <p><strong>Model No.:</strong> Ceiling fan</p>
                    <p><strong>Serial Number:</strong> Ceiling fan</p>
                    <p><strong>Floor:</strong> Ceiling fan</p>
                    <p><strong>Area:</strong> Ceiling fan</p
                `;
            })
            .catch(error => console.error('Error fetching data:', error));
    }
});

function checkUserLoggedIn() {
    const cookies = document.cookie.split('; ');
    const usernameCookie = cookies.find(cookie => cookie.startsWith('username='));
    const authorityCookie = cookies.find(cookie => cookie.startsWith('authority='));

    console.log('Cookies:', document.cookie); // Log all cookies
    console.log('Username Cookie:', usernameCookie); // Log username cookie
    console.log('Authority Cookie:', authorityCookie); // Log authority cookie

    if (!usernameCookie) {
        console.log('Username cookie not found');
        window.location.href = '/';
        return;
    }

    const authority = authorityCookie ? authorityCookie.split('=')[1] : '0';
    const inventoryLink = document.getElementById('inv');
    const addAccountLink = document.getElementById('inv1');
    const createAccountLink = document.getElementById('inv2');

    if (authority === '1') {
        inventoryLink.style.display = 'none';
        addAccountLink.style.display = 'none';
        createAccountLink.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    checkUserLoggedIn();
});

document.getElementById('generate-pdf-btn').addEventListener('click', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const historyId = urlParams.get('id');

    if (!historyId) {
        console.error('ID not found in the URL');
        return;
    }
    const pdfUrl = `/pdf/${historyId}`;

    try {
        const response = await fetch(pdfUrl, { method: 'GET' });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'history-details.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } else {
            console.error('Failed to generate PDF.');
        }
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
});

function logout() {
    const cookiePaths = [
        '/inventory', '/floorPage', '/areaPage', '/equipmentPage', '/partsPage', '/specsPage',
        '/scheduleFloorPage', '/scheduleAreaPage', '/scheduleEquipmentPage', '/calendarPage',
        '/inspectionFloorPage', '/inspectionAreaPage', '/inspectionEquipmentPage', '/inspectionPage',
        '/historyPage', '/historyDetailPage'
    ];

    cookiePaths.forEach(path => {
        document.cookie = `username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
    });

    window.location.href = '/';
}