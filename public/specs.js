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

document.getElementById('specsForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Gather form data
    var specsName = document.getElementById('specsNameInput').value;

    // Create an XMLHttpRequest object
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/saveSpecs', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                // Specs creation successful
                console.log("Specs created successfully");
                // Display success message
                alert('Specs created successfully');
                fetchAndDisplaySpecs()
            } else {
                // Display error message
                alert('Error creating Specs');
            }
        }
    };
    // Send data to server
    xhr.send(JSON.stringify({ specsName: specsName }));
    console.log("Specs Name:", specsName);
});

function fetchAndDisplaySpecs() {
    fetch('/getSpecs')
       .then(response => response.json())
       .then(specs => {
            const specsDisplayContainer = document.querySelector('.row2c2');
            specsDisplayContainer.innerHTML = '';

            specs.forEach(spec => {
                const specContainer = document.createElement('div');
                specContainer.className = 'specsDisplay';
                const specNameElement = document.createElement('p');
                specNameElement.textContent = `Spec Name: ${spec.name}`;

                const buttonsContainer = document.createElement('div');
                buttonsContainer.className = 'divStyle';

                const editButton = document.createElement('button');
                editButton.className = 'editButton';
                editButton.addEventListener('click', function() {
                    const editForm = document.createElement('form');
                    editForm.id = 'editSpecForm';
                    editForm.innerHTML = `
                        <input type="text" id="editSpecName" name="editSpecName" value="${spec.name}" required>
                        <button type="submit">Save</button>
                    `;
                    specContainer.innerHTML = '';
                    specContainer.appendChild(editForm);

                    editForm.addEventListener('submit', function(event) {
                        event.preventDefault();
                        const updatedSpecName = document.getElementById('editSpecName').value;

                        updateSpecInDatabase(spec.id, updatedSpecName);
                        fetchAndDisplaySpecs();
                    });
                });

                const deleteButton = document.createElement('button');
                deleteButton.className = 'deleteButton';
                deleteButton.addEventListener('click', function() {
                    if (!confirm('Are you sure you want to delete this spec?')) {
                        return;
                    }

                    deleteSpecFromDatabase(spec.id);
                    fetchAndDisplaySpecs();
                });

                buttonsContainer.appendChild(editButton);
                buttonsContainer.appendChild(deleteButton);
                specContainer.appendChild(specNameElement);
                specContainer.appendChild(buttonsContainer);
                specsDisplayContainer.appendChild(specContainer);
            });
        })
       .catch(error => console.error('Error fetching specs:', error));
}


function deleteSpecFromDatabase(specId) {
    fetch(`/deleteSpec/${specId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log('Spec deleted successfully');
    })
    .catch(error => console.error('Error deleting spec:', error));
}


function updateSpecInDatabase(specId, updatedSpecName) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/updateSpec', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                console.log("Spec updated successfully");
            } else {
                console.error('Error updating spec:', xhr.statusText);
            }
        }
    };
    xhr.send(JSON.stringify({ id: specId, name: updatedSpecName }));
}


// Call the function to fetch and display specs when the page loads
document.addEventListener('DOMContentLoaded', fetchAndDisplaySpecs);

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
    const equipId = urlParams.get('equip_id');

    const floorLink = document.querySelector('.nav-link a[href="/inventory"]');
    const areaLink = document.querySelector('.nav-link a[href="/areaPage"]');
    const equipmentLink = document.querySelector('.nav-link a[href="/equipmentPage"]');
    const specsLink = document.querySelector('.nav-link a[href="/specsPage"]');

    floorLink.href = `/inventory`;
    areaLink.href = `/floorPage?floorId=${floorId}`;
    equipmentLink.href = `/equipmentPage?floorId=${floorId}&areaId=${areaId}`;
    specsLink.href = `/specsPage?floorId=${floorId}&areaId=${areaId}&equip_id=${equipId}`;
});
