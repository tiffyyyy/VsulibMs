function updateWelcomeMessage() {
    const usernameCookie = document.cookie.split('; ').find(cookie => cookie.startsWith('username='));
    if (usernameCookie) {
        const usernameValue = usernameCookie.split('=')[1];
        let username = decodeURIComponent(usernameValue);

        username = username.charAt(0).toUpperCase() + username.slice(1);
        document.getElementById('welcomeMessage').innerText = username;
    } else {
        console.log('Username cookie not found');
    }
}

window.addEventListener('load', updateWelcomeMessage);

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
                areaLink.href = `/scheduleEquipmentPage?floorId=${floorId}&areaId=${area.id}`;
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

document.getElementById('viewProfile').addEventListener('click', function(event) {
    const cookies = document.cookie.split('; ');
    let id = '';

    cookies.forEach(cookie => {
        const [key, value] = cookie.split('=');
        if (key.trim() === 'id') {
            id = decodeURIComponent(value);
        }
    });

    if (id) {
        window.open(`/changePass?id=${id}`, '_blank'); 
    } else {
        alert('ID not found in the cookies');
    }
});

function logout() {
    const cookiePaths = [
        '/inventory', '/floorPage', '/areaPage', '/equipmentPage', '/partsPage', '/specsPage',
        '/scheduleFloorPage', '/scheduleAreaPage', '/scheduleEquipmentPage', '/calendarPage',
        '/inspectionFloorPage', '/inspectionAreaPage', '/inspectionEquipmentPage', '/inspectionPage',
        '/historyPage', '/historyDetailPage', '/pending','/createAccount', '/changePass', '/summary'
    ];

    cookiePaths.forEach(path => {
        document.cookie = `username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
        document.cookie = `authority=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
        document.cookie = `id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
    });

    window.location.href = '/';
}

document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const floorId = urlParams.get('floorId');

    const floorLink = document.querySelector('.nav-link a[href="/scheduleFloorPage"]');
    const areaLink = document.querySelector('.nav-link a[href="/scheduleAreaPage"]');

    floorLink.href = `/scheduleFloorPage`;
    areaLink.href = `/scheduleAreaPage?floorId=${floorId}`;
});