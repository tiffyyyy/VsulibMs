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
    event.preventDefault(); // Prevent the default form submission

    // Gather form data
    var partsName = document.getElementById('partsNameInpute').value;
    var equipStatus = document.getElementById('equipStatusInput').value;

    // Create an XMLHttpRequest object
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/saveParts', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                // Parts creation successful
                console.log("Parts created successfully");
                // Display success message
                alert('Parts created successfully');
                // Update the display with the new list of parts
                fetchAndDisplayParts()
            } else {
                // Display error message
                alert('Error creating Parts');
            }
        }
    };
    // Send data to server
    xhr.send(JSON.stringify({ partsName: partsName, equipStatus: equipStatus }));
    console.log("Parts Name:", partsName, "Equip Status:", equipStatus);
});

function fetchAndDisplayParts() {
    fetch('/getParts')
        .then(response => response.json())
        .then(parts => {
            // Correctly target the second row2c1 div
            const partsDisplayContainer = document.querySelector('.row2c2');
            partsDisplayContainer.innerHTML = ''; // Clear previous content

            // Loop through the parts and create HTML elements to display them
            parts.forEach(part => {
                const partsDisplayBox = document.createElement('div');
                partsDisplayBox.className = 'partsDisplay'; // Assign class for styling

                // Create elements for part name and status
                const partNameElement = document.createElement('p');
                partNameElement.textContent = `Part Name: ${part.name} Status: ${part.status}`;

                // Create Edit and Delete buttons
                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.className = 'editButton'; // Add a class for styling
                editButton.addEventListener('click', function() {
                    // Create a form for editing the part
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
                
                    // Replace the part's display box with the edit form
                    partsDisplayBox.innerHTML = '';
                    partsDisplayBox.appendChild(editForm);
                
                    // Add an event listener to the form to handle the submission
                    editForm.addEventListener('submit', function(event) {
                        event.preventDefault();
                        const updatedPartName = document.getElementById('editPartName').value;
                        const updatedPartStatus = document.getElementById('editPartStatus').value;
                
                        // Send the updated data to the server
                        updatePartInDatabase(part.id, updatedPartName, updatedPartStatus);
                        fetchAndDisplayParts();
                    });
                });                    

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'deleteButton'; // Add a class for styling
                deleteButton.addEventListener('click', function() {
                    // Display a confirmation dialog
                    const confirmDelete = confirm("Are you sure you want to delete this part?");
                    if (confirmDelete) {
                        // If the user confirms, send a DELETE request to the server
                        fetch(`/deletePart/${part.id}`, {
                            method: 'DELETE',
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            // After successfully deleting the part, refresh the display
                            fetchAndDisplayParts();
                        })
                        .catch(error => {
                            console.error('Error deleting part:', error);
                        });
                    }
                });                                   

                // Append part name and status to the partsDisplayBox
                partsDisplayBox.appendChild(partNameElement);

                // Append Edit and Delete buttons to the partsDisplayBox
                partsDisplayBox.appendChild(editButton);
                partsDisplayBox.appendChild(deleteButton);

                // Append the partsDisplayBox to the partsDisplayContainer
                partsDisplayContainer.appendChild(partsDisplayBox);
            });
        })
        .catch(error => console.error('Error fetching parts:', error));
}

// Function to fetch and display parts
document.addEventListener('DOMContentLoaded', function() {
    // Function to fetch and display parts

    // Call the function to fetch and display parts when the page loads
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
                // Optionally, refresh the parts list or update the UI
            } else {
                console.error('Error updating part:', xhr.statusText);
            }
        }
    };
    xhr.send(JSON.stringify({ id: partId, name: updatedPartName, status: updatedPartStatus }));
}



