document.addEventListener("DOMContentLoaded", function() {
    // Get the modal
    var modal = document.getElementById("myModal");

    // Get the button that opens the modal
    var btn = document.getElementById("addFloorBtn");

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
window.addEventListener('load', updateWelcomeMessage);

document.getElementById('submitFloorBtn').addEventListener('click', function() {
    var floorName = document.getElementById('floorNameInput').value;

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
                    floorLink.href = `/floorPage?floorId=${floor.floorId}`;
                    p.appendChild(floorLink);
                    floorBox.appendChild(p);

                    // Add Edit Button
                    const editButton = document.createElement('button');
                    editButton.textContent = 'Edit';
                    editButton.className = 'editButton';
                    // Add an event listener to the edit button for each floor
                    editButton.addEventListener('click', function() {
                        // Create a form for editing the floor
                        const editForm = document.createElement('form');
                        editForm.id = 'editFloorForm';
                        editForm.innerHTML = `
                            <input type="text" id="editFloorName" name="editFloorName" value="${floor.name}" required>
                            <button type="submit">Save</button>
                        `;

                        // Replace the floor's display box with the edit form
                        floorBox.innerHTML = ''; // Clear the floorBox content
                        floorBox.appendChild(editForm); // Append the edit form to the floorBox

                        // Add an event listener to the form to handle the submission
                        editForm.addEventListener('submit', function(event) {
                            event.preventDefault();
                            const updatedFloorName = document.getElementById('editFloorName').value;

                            // Assuming you have a function to handle updating the floor in the database
                            // This function should take the floor ID and the updated floor name as parameters
                            updateFloorInDatabase(floor.floorId, updatedFloorName);
                            fetchFloorsAndUpdateHTML();// Assuming you have a function to fetch and display floors
                        });
                    });

                    
                    floorBox.appendChild(editButton);

                    // Add Delete Button
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.className = 'deleteButton';
                    deleteButton.addEventListener('click', function() {
                        // Assuming you have a function to handle deletion
                        deleteFloorFromDatabase(floor.floorId);
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
    fetchFloorsAndUpdateHTML();
});

function deleteFloorFromDatabase(floorId) {
    fetch(`/deleteFloor/${floorId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log('Floor deleted successfully');
        // Optionally, remove the floor from the UI here
        // Assuming you have a reference to the floorBox element, you can remove it like this:
        // floorBox.remove();
        // However, since we're dynamically creating these elements, you might need to find the specific element to remove.
        // One approach is to add a unique identifier to each floorBox and use it to find and remove the specific element.
    })
    .catch(error => console.error('Error deleting floor:', error));
}

function updateFloorInDatabase(floorId, updatedFloorName) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/updateFloor', true); // Assuming '/updateFloor' is the endpoint for updating floors
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                console.log("Floor updated successfully");
                // Optionally, refresh the floors list or update the UI
            } else {
                console.error('Error updating floor:', xhr.statusText);
            }
        }
    };
    xhr.send(JSON.stringify({ id: floorId, name: updatedFloorName }));
}

