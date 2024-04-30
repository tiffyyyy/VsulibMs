function updateWelcomeMessage() {
    // Get the username from the cookie
    const usernameCookie = document.cookie.split('; ').find(cookie => cookie.startsWith('username='));
    if (usernameCookie) {
        const usernameValue = usernameCookie.split('=')[1];
        const username = decodeURIComponent(usernameValue);

        // Display the username in the welcome message
        document.getElementById('welcomeMessage').innerText = username;
    } else {
        // Handle case where username cookie is not found
        console.log('Username cookie not found');
    }
}

function displayAreas() {
    const bodyAreaDiv = document.getElementById('body-area-div');
    bodyAreaDiv.innerHTML = '';

    const urlParams = new URLSearchParams(window.location.search);
    const floorId = urlParams.get('floorId');

    fetch(`/area`)
        .then(response => response.json())
        .then(areas => {
            areas.forEach(area => {
                const areaBox = document.createElement('div');
                areaBox.className = 'floorBox';

                const areaLink = document.createElement('a');
                areaLink.textContent = `${area.name}`;
                areaLink.href = `/inspectionEquipmentPage?floorId=${floorId}&areaId=${area.id}`;
                areaBox.appendChild(areaLink);
                bodyAreaDiv.appendChild(areaBox);
            });
        })
        .catch(error => {
            console.error('Error fetching areas:', error);
        });
}

document.addEventListener("DOMContentLoaded", function() {
    displayAreas();
});

function checkUserLoggedIn() {
    const usernameCookie = document.cookie.split('; ').find(cookie => cookie.startsWith('username='));
    if (!usernameCookie) {
        window.location.href = '/';
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

document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const floorId = urlParams.get('floorId');

    const floorLink = document.querySelector('.nav-link a[href="/inspectionFloorPage"]');
    const areaLink = document.querySelector('.nav-link a[href="/inspectionAreaPage"]');

    floorLink.href = `/inspectionFloorPage`;
    areaLink.href = `/inspectionAreaPage?floorId=${floorId}`;
});