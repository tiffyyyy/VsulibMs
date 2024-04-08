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
            // Assuming you have a container where you want to display the specs
            const specsDisplayContainer = document.querySelector('.row2c2');
            specsDisplayContainer.innerHTML = ''; // Clear previous content

            // Loop through the specs and create HTML elements to display them
            specs.forEach(spec => {
                // Create a container for each spec
                const specContainer = document.createElement('div');
                specContainer.className = 'specsDisplay'; // Assign class for styling

                // Create elements for spec name
                const specNameElement = document.createElement('p');
                specNameElement.textContent = `Spec Name: ${spec.name}`;

                // Create Edit and Delete buttons
                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.className = 'editButton'; // Add a class for styling
                editButton.addEventListener('click', function() {
                    // Create a form for editing the spec
                    const editForm = document.createElement('form');
                    editForm.id = 'editSpecForm';
                    editForm.innerHTML = `
                        <input type="text" id="editSpecName" name="editSpecName" value="${spec.name}" required>
                        <button type="submit">Save</button>
                    `;
                
                    // Replace the spec's display box with the edit form
                    specContainer.innerHTML = '';
                    specContainer.appendChild(editForm);
                
                    // Add an event listener to the form to handle the submission
                    editForm.addEventListener('submit', function(event) {
                        event.preventDefault();
                        const updatedSpecName = document.getElementById('editSpecName').value;
                
                        // Send the updated data to the server
                        updateSpecInDatabase(spec.id, updatedSpecName);
                        fetchAndDisplaySpecs();
                    });
                });

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'deleteButton'; // Add a class for styling
                // Inside the fetchAndDisplaySpecs function, after creating the deleteButton
                deleteButton.addEventListener('click', function() {
                    // Confirm deletion
                    if (!confirm('Are you sure you want to delete this spec?')) {
                        return;
                    }

                    // Send the delete request to the server
                    deleteSpecFromDatabase(spec.id);
                    fetchAndDisplaySpecs(); // Refresh the specs list
                });
                // Append spec name, Edit, and Delete buttons to the specContainer
                specContainer.appendChild(specNameElement);
                specContainer.appendChild(editButton);
                specContainer.appendChild(deleteButton);

                // Append the specContainer to the specsDisplayContainer
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
    xhr.open('POST', '/updateSpec', true); // Assuming '/updateSpec' is the endpoint for updating specs
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                console.log("Spec updated successfully");
                // Optionally, refresh the specs list or update the UI
            } else {
                console.error('Error updating spec:', xhr.statusText);
            }
        }
    };
    xhr.send(JSON.stringify({ id: specId, name: updatedSpecName }));
}


// Call the function to fetch and display specs when the page loads
document.addEventListener('DOMContentLoaded', fetchAndDisplaySpecs);




