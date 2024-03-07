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

