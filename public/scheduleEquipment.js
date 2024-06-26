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

            const detailsButton = document.createElement('a');
            detailsButton.href = `/calendarPage?floorId=${floorId}&areaId=${areaId}&equip_id=${item.equip_id}`;
            detailsButton.className = 'schedBtn';
            detailsButton.style.float = 'right';
            equipBox.appendChild(detailsButton);

            equipBox.appendChild(buttonContainer);
            row2.appendChild(equipBox);
            entityNumber++;
        });
    })
    .catch(error => console.error('Error fetching equipment data:', error));
}

function fetchAndDisplayEquipments(searchTerm = '') {
    const urlParams = new URLSearchParams(window.location.search);
    const floorId = urlParams.get('floorId');
    const areaId = urlParams.get('areaId');

    fetch(`/searchEquipmentInspection?search=${searchTerm}&areaId=${areaId}`)
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

        const detailsButton = document.createElement('a');
        detailsButton.href = `/calendarPage?floorId=${floorId}&areaId=${areaId}&equip_id=${item.equip_id}`;
        detailsButton.className = 'schedBtn';
        detailsButton.style.float = 'right';
        equipBox.appendChild(detailsButton);

        equipBox.appendChild(buttonContainer);
        row2.appendChild(equipBox);
        entityNumber++;
    });
})
   .catch(error => console.error('Error fetching equipment data:', error));
}

document.addEventListener("DOMContentLoaded", function() {
    fetchAndDisplayEquipment();

    const searchBox = document.getElementById('searchBox');

    searchBox.addEventListener('input', function() {
        if (searchBox.value.trim() === '') {
            fetchAndDisplayEquipment();
        } else {
            fetchAndDisplayEquipments(searchBox.value);
        }
    });
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
    const areaId = urlParams.get('areaId');

    const floorLink = document.querySelector('.nav-link a[href="/scheduleFloorPage"]');
    const areaLink = document.querySelector('.nav-link a[href="/scheduleAreaPage"]');
    const equipmentLink = document.querySelector('.nav-link a[href="/scheduleEquipmentPage"]');

    floorLink.href = `/scheduleFloorPage`;
    areaLink.href = `/scheduleAreaPage?floorId=${floorId}`;
    equipmentLink.href = `/scheduleEquipmentPage?floorId=${floorId}&areaId=${areaId}`;
});