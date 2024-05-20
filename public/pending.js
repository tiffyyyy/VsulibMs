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
    fetch('/fetchPending')
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

            const proposedDateP = document.createElement('p');
            proposedDateP.textContent = `Proposed Date: ${item.proposedDate? formatDate(item.proposedDate) : 'N/A'}`;
            equipBox.appendChild(proposedDateP);

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container';

            const detailsButton = document.createElement('a');
            detailsButton.href = `/calendarPage?equip_id=${item.equip_id}`;
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

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

document.addEventListener("DOMContentLoaded", function() {
    fetchAndDisplayEquipment();
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
        '/historyPage', '/historyDetailPage', '/pending'
    ];

    cookiePaths.forEach(path => {
        document.cookie = `username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
        document.cookie = `authority=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
    });

    window.location.href = '/';
}