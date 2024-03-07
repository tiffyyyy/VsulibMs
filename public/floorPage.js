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

function displayAreas(areas) {
    const row2 = document.querySelector('.row2');
    row2.innerHTML = ''; // Clear existing content

    areas.forEach(area => {
        const areaLink = document.createElement('a');
        areaLink.textContent = `${area.name}`;
        areaLink.href = `path/to/new/html/file?areaId=${area.id}`; // Replace with the actual path to the new HTML file and the area ID
        row2.appendChild(areaLink);

        // Add a line break after each link
        row2.appendChild(document.createElement('br'));
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

