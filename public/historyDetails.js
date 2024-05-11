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

                document.querySelector('.row2c1').innerHTML = `
                    <h3>${equipmentDetails.equip_name}</h3>
                    <img src="${equipmentDetails.equip_pic}" alt="Equipment Picture">
                    <p>Status: ${equipmentDetails.status}</p>
                    <p>Equipment Number: ${equipmentDetails.equip_no}</p>
                `;

                document.querySelector('.row2c2').innerHTML = `
                    <p>Remarks: ${historyDetails.remarks2}</p>
                    <p>Actual Date: ${actualDate}</p>
                `;
            })
            .catch(error => console.error('Error fetching data:', error));
    }
});

function checkUserLoggedIn() {
    const usernameCookie = document.cookie.split('; ').find(cookie => cookie.startsWith('username='));
    if (!usernameCookie) {
        window.location.href = '/';
        return;
    }
    const authorityCookie = document.cookie.split('; ').find(cookie => cookie.startsWith('authority='));
    const authority = authorityCookie? authorityCookie.split('=')[1] : '0';
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