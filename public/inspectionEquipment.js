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
window.addEventListener('load', updateWelcomeMessage);

function fetchAndDisplayEquipment() {
    const urlParams = new URLSearchParams(window.location.search);
    const floorId = urlParams.get('floorId');
    const areaId = urlParams.get('areaId');

    fetch('/fetchEquipment')
    .then(response => response.json())
    .then(data => {
        const row2 = document.querySelector('.row2');
        row2.innerHTML = '';
        let entityNumber = 1;

        data.forEach(item => {
            const equipBox = document.createElement('div');
            equipBox.className = 'equipBox';

            const entityNumberContainer = document.createElement('div');
            entityNumberContainer.className = 'entityNumber';

            const numberP = document.createElement('h3');
            numberP.textContent = entityNumber;
            entityNumberContainer.appendChild(numberP);

            equipBox.appendChild(entityNumberContainer);

            const nameP = document.createElement('p');
            nameP.textContent = `${item.equip_name}`;
            nameP.className = 'equipText';
            equipBox.appendChild(nameP);

            const img = document.createElement('img');
            img.src = `data:image/jpeg;base64,${item.equip_pic}`;
            img.alt = `${item.equip_name} Image`;
            equipBox.appendChild(img);

            const statusP = document.createElement('p');
            statusP.textContent = `Status: ${item.status}`;
            equipBox.appendChild(statusP);

            const equipNoP = document.createElement('p');
            equipNoP.textContent = `Serial Number: ${item.equip_no}`;
            equipBox.appendChild(equipNoP);

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container';

            const button1 = document.createElement('a');
            button1.href = `/inspectionPage?floorId=${floorId}&areaId=${areaId}&equip_id=${item.equip_id}`;
            button1.textContent = 'Parts';
            button1.className = 'button';
            buttonContainer.appendChild(button1);

            equipBox.appendChild(buttonContainer);
            row2.appendChild(equipBox);
            entityNumber++;
        });
    })
    .catch(error => console.error('Error fetching equipment data:', error));
}

document.addEventListener("DOMContentLoaded", function() {
    fetchAndDisplayEquipment();
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
    const areaId = urlParams.get('areaId');

    const floorLink = document.querySelector('.nav-link a[href="/inspectionFloorPage"]');
    const areaLink = document.querySelector('.nav-link a[href="/inspectionAreaPage"]');
    const equipmentLink = document.querySelector('.nav-link a[href="/inspectionEquipmentPage"]');

    floorLink.href = `/inspectionFloorPage`;
    areaLink.href = `/inspectionAreaPage?floorId=${floorId}`;
    equipmentLink.href = `/inspectionEquipmentPage?floorId=${floorId}&areaId=${areaId}`;
});