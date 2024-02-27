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
                // Login successful, redirect to index.hbs
                console.log("asdasd");
                window.location.href = 'inventory?username=' + encodeURIComponent(username);   
            } else {
                // Display an error message
                alert('Invalid username or password');
            }
        }
    };
    xhr.send(JSON.stringify({ username: username, password: password }));
});
