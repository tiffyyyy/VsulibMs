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

function displayAreas() {
    const bodyAreaDiv = document.getElementById('body-area-div');
    bodyAreaDiv.innerHTML = ''; // Clear existing content

    const urlParams = new URLSearchParams(window.location.search);
    let floorId = urlParams.get('floorId');
    console.log(floorId);
    fetch(`/area`)
        .then(response => response.json())
        .then(areas => {
            areas.forEach(area => {
                const areaBox = document.createElement('div');
                areaBox.className = 'floorBox';

                const areaLink = document.createElement('a');
                areaLink.textContent = `${area.name}`;
                areaLink.href = `/equipmentPage?floorId=${floorId}&areaId=${area.id}`;
                areaBox.appendChild(areaLink);

                const editButton = document.createElement('button');
                editButton.className = 'editButton';
                editButton.addEventListener('click', function() {

                    const editForm = document.createElement('form');
                    editForm.id = 'editAreaForm';
                    editForm.innerHTML = `
                        <input type="text" id="editAreaName" name="editAreaName" value="${area.name}" required>
                        <button type="submit">Save</button>
                    `;
                
                    areaBox.innerHTML = '';
                    areaBox.appendChild(editForm);
                
                    editForm.addEventListener('submit', function(event) {
                        event.preventDefault();
                        const updatedAreaName = document.getElementById('editAreaName').value;
                
                        updateAreaInDatabase(area.id, updatedAreaName);
                        displayAreas();
                    });
                });
                
                areaBox.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.className = 'deleteButton';
                deleteButton.addEventListener('click', function() {
                    const confirmDelete = window.confirm('Are you sure you want to delete this area?');
                    if (confirmDelete) {
                        deleteAreaFromDatabase(area.id);
                        displayAreas();
                    }
                });
                
                areaBox.appendChild(deleteButton);

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


document.addEventListener("DOMContentLoaded", function() {
    var modal = document.getElementById("myModal");

    var btn = document.getElementById("addAreaBtn");

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

document.getElementById('submitAreaBtn').addEventListener('click', function() {
    var areaName = document.getElementById('areaNameInput').value;

    if (areaName.trim() === '') {
        alert('Area name cannot be empty. Please enter a valid floor name.');
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/areaPage', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                console.log("Area created successfully");
                alert('Area created successfully');
                displayAreas();
                var modal = document.getElementById("myModal");
                modal.style.display = "none";       
            } else {
                alert('Error creating Area');
            }
        }
    };
    xhr.send(JSON.stringify({ areaName: areaName }));
    console.log("name:", areaName);
});

function updateAreaInDatabase(areaId, updatedAreaName) {
    const data = {
        areaId: areaId,
        updatedAreaName: updatedAreaName
    };

    const jsonData = JSON.stringify(data);

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonData
    };

    fetch('/updateArea', requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Area updated successfully:', data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function deleteAreaFromDatabase(areaId) {
    fetch(`/deleteArea/${areaId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log('Area deleted successfully');
    })
    .catch(error => console.error('Error deleting area:', error));
}

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

    const floorLink = document.querySelector('.nav-link a[href="/inventory"]');
    const areaLink = document.querySelector('.nav-link a[href="/floorPage"]');

    floorLink.href = `/inventory`;
    areaLink.href = `/floorPage?floorId=${floorId}`;
});
