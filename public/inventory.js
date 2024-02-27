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

// Retrieve the stored username from localStorage
let currentUsername = localStorage.getItem('username') || '';

function updateWelcomeMessage() {
    // Get the username from the URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');

    if (username) {
        // Store the username in localStorage
        localStorage.setItem('username', username);

        // Display the username in the welcome message
        currentUsername = username; // Assign the username to the currentUsername variable
        document.getElementById('welcomeMessage').innerText = currentUsername; // Display the username
    }
    console.log(currentUsername);
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
        // Assuming '/floors' endpoint returns an array of floor objects with floorId and name properties
        fetch('/floors')
            .then(response => response.json())
            .then(floorsData => {
                const row2 = document.querySelector('.row2');
                row2.innerHTML = ''; // Clear existing content

                floorsData.forEach(floor => {
                    const p = document.createElement('p');
                    const floorLink = document.createElement('a');
                    floorLink.textContent = floor.name;
                    floorLink.href = `/floorPage?floorId=${floor.floorId}`; // Set href attribute to floorPage with floorId parameter
                    p.appendChild(floorLink);
                    row2.appendChild(p);
                });
            })
            .catch(error => {
                console.error('Error fetching floor data:', error);
                alert('Error fetching floor data. Please try again.');
            });
    }

    // Call the function after the page loads to initially fetch and display the floors
    fetchFloorsAndUpdateHTML();
});









