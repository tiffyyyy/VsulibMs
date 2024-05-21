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
document.addEventListener("DOMContentLoaded", function() {
    var modal = document.getElementById("myModal");

    var btn = document.getElementById("addEquipmentBtn");

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

    // Function for submitting the equipment data
    document.getElementById('equipmentForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission
    
        var equipName = document.getElementById('equipNameInput').value;
        var equipNo = document.getElementById('equipNoInput').value;
        var equipPic = document.getElementById('equipPicInpu').files[0];
        var equipStatus = document.getElementById('equipStatusInput').value;
        const urlParams = new URLSearchParams(window.location.search);
        let areaId = urlParams.get('areaId');
        
        if (!equipPic.type.startsWith('image/')) {
            alert('Please select an image file for the equipment picture.');
            return;
        }

        var formData = new FormData();
        formData.append('equipName', equipName);
        formData.append('equipNo', equipNo);
        formData.append('equipPic', equipPic);
        formData.append('areaId', areaId);
        formData.append('equipStatus', equipStatus);
        
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/equipment', true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    fetchAndDisplayEquipment();
                    console.log('Equipment data saved successfully');
                    modal.style.display = "none";
                } else {
                    console.error('Error saving equipment data');
                    alert('Error saving equipment data');
                }
            }
        };
        xhr.send(formData);
    });

});

function fetchAndDisplayEquipment() {
    const urlParams = new URLSearchParams(window.location.search);
    let areaId = urlParams.get('areaId');
    let floorId = urlParams.get('floorId');

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

            const button1 = document.createElement('a');
            button1.href = `/specsPage?floorId=${areaId}&areaId=${areaId}&equip_id=${item.equip_id}`;
            button1.textContent = 'Specs';
            button1.className = 'button';
            buttonContainer.appendChild(button1);

            const button2 = document.createElement('a');
            button2.href = `/partsPage?floorId=${areaId}&areaId=${areaId}&equip_id=${item.equip_id}`;
            button2.textContent = 'Parts';
            button2.className = 'button';
            buttonContainer.appendChild(button2);

            equipBox.appendChild(buttonContainer);

            const deleteButton = document.createElement('button');
            deleteButton.className = 'deleteButton';
            deleteButton.addEventListener('click', function() {
                if (!confirm('Are you sure you want to delete this equipment?')) {
                    return;
                }
                deleteEquipment(item.equip_id);
                fetchAndDisplayEquipment();
            });

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'editButton';
            editButton.addEventListener('click', function() {
                const editForm = document.createElement('form');
                editForm.id = 'editEquipmentForm';
                editForm.innerHTML = `
                    <input type="text" id="editEquipName" name="editEquipName" value="${item.equip_name}" required>
                    <input type="text" id="editEquipNo" name="editEquipNo" value="${item.equip_no}" required>
                    <select id="editEquipStatus" name="editEquipStatus" required>
                        <option value="Good" ${item.status === 'Good' ? 'selected' : ''}>Good</option>
                        <option value="Need Maintenance" ${item.status === 'Need Maintenance' ? 'selected' : ''}>Need Maintenance</option>
                        <option value="Need Replacement" ${item.status === 'Need Replacement' ? 'selected' : ''}>Need Replacement</option>
                    </select>
                    <input type="file" id="editEquipPic" name="editEquipPic" accept="image/*">
                    <button type="submit">Save</button>
                `;
            
                equipBox.innerHTML = '';
                equipBox.appendChild(editForm);
            
                editForm.addEventListener('submit', function(event) {
                    event.preventDefault();
                    const updatedEquipName = document.getElementById('editEquipName').value;
                    const updatedEquipNo = document.getElementById('editEquipNo').value;
                    const updatedEquipStatus = document.getElementById('editEquipStatus').value;
                    const updatedEquipPic = document.getElementById('editEquipPic').files[0];
            
                    if (updatedEquipPic && !updatedEquipPic.type.startsWith('image/')) {
                        alert('Please select an image file for the equipment picture.');
                        return;
                    }

                    const formData = new FormData();
                    formData.append('equipId', item.equip_id);
                    formData.append('updatedEquipName', updatedEquipName);
                    formData.append('updatedEquipNo', updatedEquipNo);
                    formData.append('updatedEquipStatus', updatedEquipStatus);
                    formData.append('updatedEquipPic', updatedEquipPic);
            
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', '/updateEquipment', true);
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === XMLHttpRequest.DONE) {
                            if (xhr.status === 200) {
                                console.log('Equipment updated successfully');
                                fetchAndDisplayEquipment();
                            } else {
                                console.error('Error updating equipment data');
                                alert('Error updating equipment data');
                            }
                        }
                    };
                    xhr.send(formData);
                });
            });            
            equipBox.appendChild(editButton);
            equipBox.appendChild(deleteButton);
            row2.appendChild(equipBox);
            entityNumber++;
        });
    })
    .catch(error => console.error('Error fetching equipment data:', error));
}

document.addEventListener("DOMContentLoaded", function() {
    fetchAndDisplayEquipment();

    searchBox.addEventListener('input', function() {
        const searchTerm = this.value.trim();
        if (searchTerm === ' ') {
            fetchAndDisplayEquipment();
        }
        else {
            fetchAndDisplayEquipments(searchTerm);
        }
    });
});

function deleteEquipment(equipId) {
    fetch(`/deleteEquipment/${equipId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log('Equipment deleted successfully');
    })
    .catch(error => console.error('Error deleting equipment:', error));
}

function fetchAndDisplayEquipments(searchTerm = '') {
    const urlParams = new URLSearchParams(window.location.search);
    let areaId = urlParams.get('areaId');
    let floorId = urlParams.get('floorId');

    let apiUrl = `/fetchEquipmentsinArea${searchTerm? `?term=${encodeURIComponent(searchTerm)}` : ''}`;

    fetch(apiUrl) 
  .then(response => response.json())
  .then(data => {
        const bodyAreaDiv = document.getElementById('body-area-div');
        bodyAreaDiv.innerHTML = '';
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

            const button1 = document.createElement('a');
            button1.href = `/specsPage?floorId=${areaId}&areaId=${areaId}&equip_id=${item.equip_id}`;
            button1.textContent = 'Specs';
            button1.className = 'button';
            buttonContainer.appendChild(button1);

            const button2 = document.createElement('a');
            button2.href = `/partsPage?floorId=${areaId}&areaId=${areaId}&equip_id=${item.equip_id}`;
            button2.textContent = 'Parts';
            button2.className = 'button';
            buttonContainer.appendChild(button2);

            equipBox.appendChild(buttonContainer);

            const deleteButton = document.createElement('button');
            deleteButton.className = 'deleteButton';
            deleteButton.addEventListener('click', function() {
                if (!confirm('Are you sure you want to delete this equipment?')) {
                    return;
                }
                deleteEquipment(item.equip_id);
                fetchAndDisplayEquipment();
            });

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'editButton';
            editButton.addEventListener('click', function() {
                const editForm = document.createElement('form');
                editForm.id = 'editEquipmentForm';
                editForm.innerHTML = `
                    <input type="text" id="editEquipName" name="editEquipName" value="${item.equip_name}" required>
                    <input type="text" id="editEquipNo" name="editEquipNo" value="${item.equip_no}" required>
                    <select id="editEquipStatus" name="editEquipStatus" required>
                        <option value="Good" ${item.status === 'Good' ? 'selected' : ''}>Good</option>
                        <option value="Need Maintenance" ${item.status === 'Need Maintenance' ? 'selected' : ''}>Need Maintenance</option>
                        <option value="Need Replacement" ${item.status === 'Need Replacement' ? 'selected' : ''}>Need Replacement</option>
                    </select>
                    <input type="file" id="editEquipPic" name="editEquipPic" accept="image/*">
                    <button type="submit">Save</button>
                `;
            
                equipBox.innerHTML = '';
                equipBox.appendChild(editForm);
            
                editForm.addEventListener('submit', function(event) {
                    event.preventDefault();
                    const updatedEquipName = document.getElementById('editEquipName').value;
                    const updatedEquipNo = document.getElementById('editEquipNo').value;
                    const updatedEquipStatus = document.getElementById('editEquipStatus').value;
                    const updatedEquipPic = document.getElementById('editEquipPic').files[0];
            
                    if (updatedEquipPic && !updatedEquipPic.type.startsWith('image/')) {
                        alert('Please select an image file for the equipment picture.');
                        return;
                    }

                    const formData = new FormData();
                    formData.append('equipId', item.equip_id);
                    formData.append('updatedEquipName', updatedEquipName);
                    formData.append('updatedEquipNo', updatedEquipNo);
                    formData.append('updatedEquipStatus', updatedEquipStatus);
                    formData.append('updatedEquipPic', updatedEquipPic);
            
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', '/updateEquipment', true);
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === XMLHttpRequest.DONE) {
                            if (xhr.status === 200) {
                                console.log('Equipment updated successfully');
                                fetchAndDisplayEquipment();
                            } else {
                                console.error('Error updating equipment data');
                                alert('Error updating equipment data');
                            }
                        }
                    };
                    xhr.send(formData);
                });
            });            
            equipBox.appendChild(editButton);
            equipBox.appendChild(deleteButton);
            bodyAreaDiv.appendChild(equipBox);
            entityNumber++;
        });
    })
    .catch(error => console.error('Error fetching equipment data:', error));
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

document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const floorId = urlParams.get('floorId');
    const areaId = urlParams.get('areaId');

    const floorLink = document.querySelector('.nav-link a[href="/inventory"]');
    const areaLink = document.querySelector('.nav-link a[href="/floorPage"]');
    const equipmentLink = document.querySelector('.nav-link a[href="/equipmentPage"]');

    floorLink.href = `/inventory`;
    areaLink.href = `/floorPage?floorId=${floorId}`;
    equipmentLink.href = `/equipmentPage?floorId=${floorId}&areaId=${areaId}`;
});