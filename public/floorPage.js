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

// Call the function when the window is fully loaded
function displayAreas(areas) {
    const bodyAreaDiv = document.getElementById('body-area-div');
    bodyAreaDiv.innerHTML = ''; // Clear existing content

    areas.forEach(area => {
        const areaBox = document.createElement('div');
        areaBox.className = 'floorBox';

        const areaLink = document.createElement('a');
        areaLink.textContent = `${area.name}`;
        areaLink.href = `/equipmentPage?areaId=${area.id}`;
        areaBox.appendChild(areaLink);

        // Create "Edit" button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'editButton'; // Add a class for styling
        editButton.addEventListener('click', function() {
            // Create a form for editing the area
            const editForm = document.createElement('form');
            editForm.id = 'editAreaForm';
            editForm.innerHTML = `
                <input type="text" id="editAreaName" name="editAreaName" value="${area.name}" required>
                <button type="submit">Save</button>
            `;
        
            // Replace the area's display box with the edit form
            areaBox.innerHTML = '';
            areaBox.appendChild(editForm);
        
            // Add an event listener to the form to handle the submission
            editForm.addEventListener('submit', function(event) {
                event.preventDefault();
                const updatedAreaName = document.getElementById('editAreaName').value;
        
                // Send the updated data to the server
                updateAreaInDatabase(area.id, updatedAreaName);
            });
        });
        
        areaBox.appendChild(editButton);

        // Create "Delete" button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'deleteButton'; // Add a class for styling
        deleteButton.addEventListener('click', function() {
            const confirmDelete = window.confirm('Are you sure you want to delete this area?');
            if (confirmDelete) {
                // User confirmed deletion, proceed with the deletion process
                deleteAreaFromDatabase(area.id);
            }
        });
        
        areaBox.appendChild(deleteButton);

        bodyAreaDiv.appendChild(areaBox);
    });
}


document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const floorId = urlParams.get('floorId');
    
    console.log(floorId);
    fetch(`/area`)
        .then(response => response.json())
        .then(results => {
            displayAreas(results);
            console.log(results);
        })
        .catch(error => {
            console.error('Error fetching areas:', error);
        });
});

document.addEventListener("DOMContentLoaded", function() {
    // Get the modal
    var modal = document.getElementById("myModal");

    // Get the button that opens the modal
    var btn = document.getElementById("addAreaBtn");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // Get the submit button inside the modal

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

    // Add event listener to the submit button inside the modal
});

document.getElementById('submitAreaBtn').addEventListener('click', function() {
    var areaName = document.getElementById('areaNameInput').value;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/areaPage', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                // Floor creation successful
                console.log("Area created successfully");
                // Display success message
                alert('Area created successfully');
                // Close the modal
                var modal = document.getElementById("myModal");
                modal.style.display = "none";       
            } else {
                // Display error message
                alert('Error creating Area');
            }
        }
    };
    xhr.send(JSON.stringify({ areaName: areaName }));
    console.log("name:", areaName);
});

function updateAreaInDatabase(areaId, updatedAreaName) {
    // Prepare the data to send
    const data = {
        areaId: areaId,
        updatedAreaName: updatedAreaName
    };

    // Convert the data to JSON format
    const jsonData = JSON.stringify(data);

    // Set up the request options
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonData
    };

    // Send the request to the server
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
            // Handle the error, e.g., show an error message to the user
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
        // Optionally, remove the area from the UI here
        areaBox.remove();
    })
    .catch(error => console.error('Error deleting area:', error));
}


