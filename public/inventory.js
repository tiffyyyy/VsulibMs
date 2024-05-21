document.addEventListener("DOMContentLoaded", function() {
    var modal = document.getElementById("myModal");

    var btn = document.getElementById("addFloorBtn");

    var span = document.getElementsByClassName("close")[0];

    // When the user clicks the button, open the modal
    btn.onclick = function() {
      modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
      modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
});

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

document.getElementById('submitFloorBtn').addEventListener('click', function() {
    var floorName = document.getElementById('floorNameInput').value;

    if (floorName.trim() === '') {
        alert('Floor name cannot be empty. Please enter a valid floor name.');
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/inventory', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                console.log("Floor created successfully");
                alert('Floor created successfully');
                fetchFloorsAndUpdateHTML();
                var modal = document.getElementById("myModal");
                modal.style.display = "none";       
            } else {
                alert('Error creating floor');
            }
        }
    };
    xhr.send(JSON.stringify({ floorName: floorName }));
    console.log("name:", floorName);
});

document.addEventListener("DOMContentLoaded", function() {  
    fetchFloorsAndUpdateHTML();
    checkUserLoggedIn();
});

function fetchFloorsAndUpdateHTML() {
    fetch('/floors')
        .then(response => response.json())
        .then(floorsData => {
            const bodyAreaDiv = document.getElementById('body-area-div');
            bodyAreaDiv.innerHTML = '';

            floorsData.forEach(floor => {
                const floorBox = document.createElement('div');
                floorBox.className = 'floorBox';

                const p = document.createElement('p');
                const floorLink = document.createElement('a');
                floorLink.textContent = floor.name;
                floorLink.href = `/floorPage?floorId=${floor.floorId}`;
                p.appendChild(floorLink);
                floorBox.appendChild(p);

                // Add Edit Button
                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.className = 'editButton';
                editButton.addEventListener('click', function() {
                    // Edit form
                    const editForm = document.createElement('form');
                    editForm.id = 'editFloorForm';
                    editForm.innerHTML = `
                        <input type="text" id="editFloorName" name="editFloorName" value="${floor.name}" required>
                        <button type="submit">Save</button>
                    `;

                    floorBox.innerHTML = '';
                    floorBox.appendChild(editForm);

                    editForm.addEventListener('submit', function(event) {
                        event.preventDefault();
                        const updatedFloorName = document.getElementById('editFloorName').value;
                        updateFloorInDatabase(floor.floorId, updatedFloorName);
                        fetchFloorsAndUpdateHTML();
                    });
                });

                
                floorBox.appendChild(editButton);
                const deleteButton = document.createElement('button');
                deleteButton.textContent = '';
                deleteButton.className = 'deleteButton';
                deleteButton.addEventListener('click', function() {
                const confirmDelete = window.confirm('Are you sure you want to delete this floor?');
                    if (confirmDelete) {
                        deleteFloorFromDatabase(floor.floorId);
                        fetchFloorsAndUpdateHTML();
                    }
                });
                floorBox.appendChild(deleteButton);
                bodyAreaDiv.appendChild(floorBox);
            });
        })
        .catch(error => {
            console.error('Error fetching floor data:', error);
            alert('Error fetching floor data. Please try again.');
        });
}

function deleteFloorFromDatabase(floorId) {
    fetch(`/deleteFloor/${floorId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log('Floor deleted successfully');
        fetchFloorsAndUpdateHTML();
    })
    .catch(error => console.error('Error deleting floor:', error));
}

function updateFloorInDatabase(floorId, updatedFloorName) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/updateFloor', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                console.log("Floor updated successfully");
            } else {
                console.error('Error updating floor:', xhr.statusText);
            }
        }
    };
    xhr.send(JSON.stringify({ id: floorId, name: updatedFloorName }));
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

