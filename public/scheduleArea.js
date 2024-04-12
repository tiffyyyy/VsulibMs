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
function displayAreas() {
    const bodyAreaDiv = document.getElementById('body-area-div');
    bodyAreaDiv.innerHTML = '';

    // Fetch the areas from the server
    fetch(`/area`)
        .then(response => response.json())
        .then(areas => {
            areas.forEach(area => {
                const areaBox = document.createElement('div');
                areaBox.className = 'floorBox';

                const areaLink = document.createElement('a');
                areaLink.textContent = `${area.name}`;
                areaLink.href = `/scheduleEquipmentPage?areaId=${area.id}`;
                areaBox.appendChild(areaLink);
                bodyAreaDiv.appendChild(areaBox);
            });
        })
        .catch(error => {
            console.error('Error fetching areas:', error);
        });
}

// Call the function when the window is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    displayAreas();
});