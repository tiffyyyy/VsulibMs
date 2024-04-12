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
document.addEventListener("DOMContentLoaded", function() {
    // Get the modal
    var modal = document.getElementById("myModal");

    // Get the button that opens the modal
    var btn = document.getElementById("addEquipmentBtn");

    // Get the <span> element that closes the modal
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

    // Add event listener to the form submission
    document.getElementById('equipmentForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission
    
        // Get form data
        var equipName = document.getElementById('equipNameInput').value;
        var equipNo = document.getElementById('equipNoInput').value;
        var equipPic = document.getElementById('equipPicInpu').files[0]; // Get the file object
        var equipStatus = document.getElementById('equipStatusInput').value; // Get the status
        const urlParams = new URLSearchParams(window.location.search);
        let areaId = urlParams.get('areaId');
        
        if (!equipPic.type.startsWith('image/')) {
            alert('Please select an image file for the equipment picture.');
            return; // Exit the function if the file is not an image
        }

        // Create FormData object to send file data
        var formData = new FormData();
        formData.append('equipName', equipName);
        formData.append('equipNo', equipNo);
        formData.append('equipPic', equipPic);
        formData.append('areaId', areaId);
        formData.append('equipStatus', equipStatus); // Add the status
        
        // Send data to server using XMLHttpRequest
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/equipment', true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    fetchAndDisplayEquipment();
                    console.log('Equipment data saved successfully');
                    modal.style.display = "none"; // Close the modal
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
    fetch('/fetchEquipment') // Adjust the URL as necessary
    .then(response => response.json())
    .then(data => {
        // Get the row2 element
        const row2 = document.querySelector('.row2');

        // Clear any existing content in row2
        row2.innerHTML = '';

        // Initialize a counter for the entity number
        let entityNumber = 1;

        // Iterate over the data and create HTML elements for each item
        data.forEach(item => {
            // Create a new div element for each item to hold the name, image, and equip_no
            const equipBox = document.createElement('div');
            equipBox.className = 'equipBox'; // Ensure this class has the desired styling

            // Create a new div element for the entity number
            const entityNumberContainer = document.createElement('div');
            entityNumberContainer.className = 'entityNumber';

            // Create a new h3 element for the entity number
            const numberP = document.createElement('h3');
            numberP.textContent = entityNumber;
            entityNumberContainer.appendChild(numberP);

            // Append the entity number container to the equipBox
            equipBox.appendChild(entityNumberContainer);

            // Create a new paragraph element for the equipment name
            const nameP = document.createElement('p');
            nameP.textContent = `${item.equip_name}`;
            nameP.className = 'equipText';
            equipBox.appendChild(nameP);

            // Create an img element for the equipment image
            const img = document.createElement('img');
            img.src = `data:image/jpeg;base64,${item.equip_pic}`; // Adjust the MIME type as necessary
            img.alt = `${item.equip_name} Image`;
            equipBox.appendChild(img);

            // Create a new paragraph element for the equipment status
            const statusP = document.createElement('p');
            statusP.textContent = `Status: ${item.status}`; // Display the status
            equipBox.appendChild(statusP);

            // Create a new paragraph element for the equipment number
            const equipNoP = document.createElement('p');
            equipNoP.textContent = `Serial Number: ${item.equip_no}`;
            equipBox.appendChild(equipNoP);

            // Create two buttons and append them to the equipBox
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container';

            const button1 = document.createElement('a');
            button1.href = `/specsPage?equip_id=${item.equip_id}`;
            button1.textContent = 'Specs';
            button1.className = 'button';
            buttonContainer.appendChild(button1);

            const button2 = document.createElement('a');
            button2.href = `/partsPage?equip_id=${item.equip_id}`; // Corrected from equipment.equip_id to item.equip_id
            button2.textContent = 'Parts';
            button2.className = 'button';
            buttonContainer.appendChild(button2);

            const detailsButton = document.createElement('a');
            detailsButton.href = `/calendarPage?equip_id=${item.equip_id}`;
            detailsButton.className = 'schedBtn'; // Assuming you want to style this button differently
            detailsButton.style.float = 'right'; // Position the button to the top right
            equipBox.appendChild(detailsButton);

            equipBox.appendChild(buttonContainer);

            // Append the equipBox containing the entity number, name, image, status, and equip_no to row2
            row2.appendChild(equipBox);

            // Increment the entity number for the next entity
            entityNumber++;
        });
    })
    .catch(error => console.error('Error fetching equipment data:', error));
}

document.addEventListener("DOMContentLoaded", function() {
    // Fetch equipment data from the server
    fetchAndDisplayEquipment();
});
