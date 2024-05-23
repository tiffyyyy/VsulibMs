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

// Call the function when the window is fully loaded
window.addEventListener('load', updateWelcomeMessage);

document.getElementById('submitFloorBtn').addEventListener('click', function() {
    var floorName = document.getElementById('floorNameInput').value;

    if (floorName.trim() === '') {
        // Display a warning and exit the function
        alert('Floor name cannot be empty. Please enter a valid floor name.');
        return; // This stops the function from executing further
    }

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/inventory', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                // Floor creation successful
                console.log("Floor created successfully");
                // Display success message
                alert('Floor created successfully');
                fetchFloorsAndUpdateHTML();
                // Close the modal
                var modal = document.getElementById("myModal");
                modal.style.display = "none";       
            } else {
                // Display error message
                alert('Error creating floor');
            }
        }
    };
    xhr.send(JSON.stringify({ floorName: floorName }));
    console.log("name:", floorName);
});

document.addEventListener("DOMContentLoaded", function() {
    // Function to fetch floors and update HTML
    
    fetchFloorsAndUpdateHTML();
});

function fetchFloorsAndUpdateHTML() {
    fetch('/floors')
        .then(response => response.json())
        .then(floorsData => {
            const bodyAreaDiv = document.getElementById('body-area-div');
            bodyAreaDiv.innerHTML = ''; // Clear existing content

            floorsData.forEach(floor => {
                const floorBox = document.createElement('div');
                floorBox.className = 'floorBox';

                const p = document.createElement('p');
                const floorLink = document.createElement('a');
                floorLink.textContent = floor.name;
                floorLink.href = `/scheduleAreaPage?floorId=${floor.floorId}`;
                p.appendChild(floorLink);
                floorBox.appendChild(p);

                bodyAreaDiv.appendChild(floorBox);
            });
        })
        .catch(error => {
            console.error('Error fetching floor data:', error);
            alert('Error fetching floor data. Please try again.');
        });
}

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