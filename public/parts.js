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

document.getElementById('partsForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var partsName = document.getElementById('partsNameInpute').value;
    var equipStatus = document.getElementById('equipStatusInput').value;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/saveParts', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                console.log("Parts created successfully");
                alert('Parts created successfully');
                fetchAndDisplayParts()
            } else {
                alert('Error creating Parts');
            }
        }
    };
    xhr.send(JSON.stringify({ partsName: partsName, equipStatus: equipStatus }));
    console.log("Parts Name:", partsName, "Equip Status:", equipStatus);
});

function fetchAndDisplayParts() {
    fetch('/getParts')
        .then(response => response.json())
        .then(parts => {
            const partsDisplayContainer = document.querySelector('.row2c2');
            partsDisplayContainer.innerHTML = '';

            parts.forEach(part => {
                const partsDisplayBox = document.createElement('div');
                partsDisplayBox.className = 'partsDisplay';

                const partNameElement = document.createElement('p');
                partNameElement.textContent = `Part Name: ${part.name} Status: ${part.status}`;

                const buttonsContainer = document.createElement('div');
                buttonsContainer.className = 'divStyle'

                const editButton = document.createElement('button');
                editButton.className = 'editButton';
                editButton.addEventListener('click', function() {
                    const editForm = document.createElement('form');
                    editForm.id = 'editPartForm';
                    editForm.innerHTML = `
                        <input type="text" id="editPartName" name="editPartName" value="${part.name}" required>
                        <select id="editPartStatus" name="editPartStatus" required>
                            <option value="Working" ${part.status === 'Working' ? 'selected' : ''}>Working</option>
                            <option value="Not Working" ${part.status === 'Not Working' ? 'selected' : ''}>Not Working</option>
                        </select>
                        <button type="submit">Save</button>
                    `;

                    partsDisplayBox.innerHTML = '';
                    partsDisplayBox.appendChild(editForm);

                    editForm.addEventListener('submit', function(event) {
                        event.preventDefault();
                        const updatedPartName = document.getElementById('editPartName').value;
                        const updatedPartStatus = document.getElementById('editPartStatus').value;

                        updatePartInDatabase(part.id, updatedPartName, updatedPartStatus);
                        fetchAndDisplayParts();
                    });
                });

                const deleteButton = document.createElement('button');
                deleteButton.className = 'deleteButton';
                deleteButton.addEventListener('click', function() {
                    const confirmDelete = confirm("Are you sure you want to delete this part?");
                    if (confirmDelete) {
                        fetch(`/deletePart/${part.id}`, {
                            method: 'DELETE',
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            fetchAndDisplayParts();
                        })
                        .catch(error => {
                            console.error('Error deleting part:', error);
                        });
                    }
                });

                buttonsContainer.appendChild(editButton);
                buttonsContainer.appendChild(deleteButton);

                partsDisplayBox.appendChild(partNameElement);
                partsDisplayBox.appendChild(buttonsContainer);

                partsDisplayContainer.appendChild(partsDisplayBox);
            });
        })
        .catch(error => console.error('Error fetching parts:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    fetchAndDisplayParts();
});

function updatePartInDatabase(partId, updatedPartName, updatedPartStatus) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/updatePart', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                console.log("Part updated successfully");
            } else {
                console.error('Error updating part:', xhr.statusText);
            }
        }
    };
    xhr.send(JSON.stringify({ id: partId, name: updatedPartName, status: updatedPartStatus }));
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

