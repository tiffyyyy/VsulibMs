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
    const labelsTable = document.querySelector('.labelsTable');

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Function to fetch and display all history data
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
                    // Create td elements with inline styles
                    const equipNameTd = document.createElement('td');
                    equipNameTd.innerHTML = record.equip_name;
                    equipNameTd.style.display = 'flex';  // Needed for flexbox within anchor tag
                    equipNameTd.style.flex = '1';
                    equipNameTd.style.textAlign = 'center';

                    const equipNoTd = document.createElement('td');
                    equipNoTd.innerHTML = record.equip_no;
                    equipNameTd.style.display = 'flex';  // Needed for flexbox within anchor tag
                    equipNoTd.style.flex = '1';
                    equipNoTd.style.textAlign = 'center';

                    const savedDateTd = document.createElement('td');
                    savedDateTd.innerHTML = formattedDate;
                    equipNameTd.style.display = 'flex';  // Needed for flexbox within anchor tag
                    savedDateTd.style.flex = '1';
                    savedDateTd.style.textAlign = 'center';

                    // Add tds to link and link to row
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