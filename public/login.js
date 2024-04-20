document.getElementById('loginBtn').addEventListener('click', function() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    // Send a POST request to the server with username and password
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/login', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                // Login successful, save the username in a cookie
                document.cookie = `username=${encodeURIComponent(username)}; path=/inventory`;
                document.cookie = `username=${encodeURIComponent(username)}; path=/floorPage`;
                document.cookie = `username=${encodeURIComponent(username)}; path=/areaPage`;
                document.cookie = `username=${encodeURIComponent(username)}; path=/equipmentPage`;
                document.cookie = `username=${encodeURIComponent(username)}; path=/partsPage`;
                document.cookie = `username=${encodeURIComponent(username)}; path=/specsPage`;
                document.cookie = `username=${encodeURIComponent(username)}; path=/scheduleFloorPage`;
                document.cookie = `username=${encodeURIComponent(username)}; path=/scheduleAreaPage`;
                document.cookie = `username=${encodeURIComponent(username)}; path=/scheduleEquipmentPage`;
                document.cookie = `username=${encodeURIComponent(username)}; path=/calendarPage`;
                document.cookie = `username=${encodeURIComponent(username)}; path=/inspectionFloorPage`;
                document.cookie = `username=${encodeURIComponent(username)}; path=/inspectionAreaPage`;
                document.cookie = `username=${encodeURIComponent(username)}; path=/inspectionEquipmentPage`;
                document.cookie = `username=${encodeURIComponent(username)}; path=/inspectionPage`;
                console.log(document.cookie);
                // Redirect to inventory page
                window.location.href = 'inventory';   
            } else {
                // Display an error message
                alert('Invalid username or password');
            }
        }
    };
    xhr.send(JSON.stringify({ username: username, password: password }));
});
