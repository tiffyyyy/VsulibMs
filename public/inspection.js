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

                const editButton = document.createElement('button');
                editButton.className = 'editButton';
                editButton.addEventListener('click', function() {
                    const editForm = document.createElement('form');
                    editForm.id = 'editPartForm';
                    editForm.innerHTML = `
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
                        const updatedPartStatus = document.getElementById('editPartStatus').value;
                        equipStats();
                        updatePartInDatabase(part.id, updatedPartStatus);
                        fetchAndDisplayParts();
                    });
                });                                                     

                partsDisplayBox.appendChild(partNameElement);
                partsDisplayBox.appendChild(editButton);
                partsDisplayContainer.appendChild(partsDisplayBox);
            });
        })
        .catch(error => console.error('Error fetching parts:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    fetchAndDisplayParts();
});

function updatePartInDatabase(partId, updatedPartStatus) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/updatePartInspection', true);
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
    xhr.send(JSON.stringify({ id: partId, status: updatedPartStatus }));
}

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const equipId = urlParams.get('equip_id');

    if (!equipId) {
        console.error('Equipment ID not found in URL');
        return;
    }

    fetch(`/getEquipDetails?equip_id=${equipId}`)
        .then(response => response.json())
        .then(details => {
            document.getElementById('equipName').textContent = details.equip_name;
            
        })
        .catch(error => console.error('Error fetching equipment details:', error));
});

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const equipId = urlParams.get('equip_id');

    if (!equipId) {
        console.error('Equipment ID not found in URL');
        return;
    }

    fetch(`/getEquipDetails?equip_id=${equipId}`)
        .then(response => response.json())
        .then(details => {
            document.getElementById('equipName').textContent = details.equip_name;
            document.getElementById('statusSelect').value = details.status;
        })
        .catch(error => console.error('Error fetching equipment details:', error));

    document.getElementById('updateBtn').addEventListener('click', function() {
        const newStatus = document.getElementById('statusSelect').value;
        fetch(`/updateEquipStatus?equip_id=${equipId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Status updated successfully.');
                location.reload();
            } else {
                alert('Failed to update status.');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Failed to update status.');
        });
    });
});

function equipStats() {
    const urlParams = new URLSearchParams(window.location.search);
    const equipId = urlParams.get('equip_id');

    if (!equipId) {
        console.error('Equipment ID not found in URL');
        return;
    }

    fetch(`/getParts?equip_id=${equipId}`)
        .then(response => response.json())
        .then(parts => {
            let workingCount = 0;
            let notWorkingCount = 0;

            parts.forEach(part => {
                if (part.status === 'Working') {
                    workingCount++;
                } else {
                    notWorkingCount++;
                }
            });

            document.getElementById('workingCount').textContent = `Working: ${workingCount}`;
            document.getElementById('notWorkingCount').textContent = `Not Working: ${notWorkingCount}`;
        })
        .catch(error => console.error('Error fetching parts:', error));
}

document.addEventListener('DOMContentLoaded', function equipStats() {
    const urlParams = new URLSearchParams(window.location.search);
    const equipId = urlParams.get('equip_id');

    if (!equipId) {
        console.error('Equipment ID not found in URL');
        return;
    }

    fetch(`/getParts?equip_id=${equipId}`)
        .then(response => response.json())
        .then(parts => {
            let workingCount = 0;
            let notWorkingCount = 0;

            parts.forEach(part => {
                if (part.status === 'Working') {
                    workingCount++;
                } else {
                    notWorkingCount++;
                }
            });

            document.getElementById('workingCount').textContent = `Working: ${workingCount}`;
            document.getElementById('notWorkingCount').textContent = `Not Working: ${notWorkingCount}`;
        })
        .catch(error => console.error('Error fetching parts:', error));
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

document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const floorId = urlParams.get('floorId');
    const areaId = urlParams.get('areaId');
    const equipId = urlParams.get('equip_id');

    const floorLink = document.querySelector('.nav-link a[href="/inspectionFloorPage"]');
    const areaLink = document.querySelector('.nav-link a[href="/inspectionAreaPage"]');
    const equipmentLink = document.querySelector('.nav-link a[href="/inspectionEquipmentPage"]');
    const inspectLink = document.querySelector('.nav-link a[href="/inspectionPage"]');

    floorLink.href = `/inspectionFloorPage`;
    areaLink.href = `/inspectionAreaPage?floorId=${floorId}`;
    equipmentLink.href = `/inspectionEquipmentPage?floorId=${floorId}&areaId=${areaId}`;
    inspectLink.href = `/inspectionPage?floorId=${floorId}&areaId=${areaId}&equip_id=${equipId}`;
});