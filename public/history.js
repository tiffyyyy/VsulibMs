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

document.addEventListener('DOMContentLoaded', () => {
    const labelsTable = document.querySelector('.labelsTable');

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function fetchAndDisplayAllHistory() {
        fetch('/history')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                labelsTable.innerHTML = `
                    <tr>
                        <th>Equipment Name</th>
                        <th>Equipment Number</th>
                        <th>Saved Date</th>
                    </tr>
                `;
    
                data.forEach(record => {
                    const formattedDate = formatDate(record.saved_at);
                    const row = document.createElement('tr');
                    const link = document.createElement('a');
                    link.href = `/historyDetailPage?id=${record.id}`;
                    const equipNameTd = document.createElement('td');
                    equipNameTd.textContent = record.equip_name; // Use textContent for better readability
                    equipNameTd.style.display = 'flex';
                    equipNameTd.style.flex = '1';
                    equipNameTd.style.textAlign = 'center';
                    console.log(record.equip_no); // Logs the correct value
                    const equipNoTd = document.createElement('td');
                    equipNoTd.textContent = record.equip_no; // Use textContent for better readability
                    equipNoTd.style.display = 'flex';
                    equipNoTd.style.flex = '1';
                    equipNoTd.style.textAlign = 'center';
                
                    const savedDateTd = document.createElement('td');
                    savedDateTd.textContent = formattedDate; // Use textContent for better readability
                    savedDateTd.style.display = 'flex';
                    savedDateTd.style.flex = '1';
                    savedDateTd.style.textAlign = 'center';
                
                    link.appendChild(equipNameTd);
                    link.appendChild(equipNoTd);
                    link.appendChild(savedDateTd);
                    row.appendChild(link);
                
                    labelsTable.appendChild(row);
                    console.log(record.id);
                }); 
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
    }
    fetchAndDisplayAllHistory();
});

document.addEventListener('DOMContentLoaded', () => {
    const labelsTable = document.querySelector('.labelsTable');
    const searchBox = document.getElementById('searchBox');

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function fetchAndDisplayHistory(searchTerm) {
        fetch(`/searchHistory?term=${encodeURIComponent(searchTerm)}`)
           .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
           .then(data => {
                labelsTable.innerHTML = `
                    <tr>
                        <th>Equipment Name</th>
                        <th>Equipment Number</th>
                        <th>Saved Date</th>
                    </tr>
                `;

                data.forEach(record => {
                    const formattedDate = formatDate(record.saved_at);
                    const row = document.createElement('tr');
                    const link = document.createElement('a');
                    link.href = `/historyDetailPage?id=${record.id}`;

                    const equipNameTd = document.createElement('td');
                    equipNameTd.innerHTML = record.equip_name;
                    equipNameTd.style.textAlign = 'center';

                    const equipNoTd = document.createElement('td');
                    equipNoTd.innerHTML = record.equip_no;
                    equipNameTd.style.textAlign = 'center';

                    const savedDateTd = document.createElement('td');
                    savedDateTd.innerHTML = formattedDate;
                    equipNameTd.style.textAlign = 'center';

                    link.appendChild(equipNameTd);
                    link.appendChild(equipNoTd);
                    link.appendChild(savedDateTd);
                    row.appendChild(link);

                    labelsTable.appendChild(row);
                });
            })
           .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
    }

    fetchAndDisplayHistory('');

    searchBox.addEventListener('input', function() {
        const searchTerm = this.value.trim();
        if (searchTerm!== '') {
            fetchAndDisplayHistory(searchTerm);
        } else {
            fetchAndDisplayHistory('');
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

function logout() {
    const cookiePaths = [
        '/inventory', '/floorPage', '/areaPage', '/equipmentPage', '/partsPage', '/specsPage',
        '/scheduleFloorPage', '/scheduleAreaPage', '/scheduleEquipmentPage', '/calendarPage',
        '/inspectionFloorPage', '/inspectionAreaPage', '/inspectionEquipmentPage', '/inspectionPage',
        '/historyPage', '/historyDetailPage', '/pending','/createAccount'
    ];

    cookiePaths.forEach(path => {
        document.cookie = `username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
        document.cookie = `authority=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
    });

    window.location.href = '/';
}