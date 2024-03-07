document.getElementById('createBtn').addEventListener('click', function() {
    var user = document.getElementById('user').value;
    var pass = document.getElementById('pass').value;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/createAccount', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                // Account creation successful
                console.log("Account created successfully");
                alert('Account created successfully');       
            } else if (xhr.status === 409) {
                // Username already exists
                alert('Username already exists');
            } else {
                // Display other error messages
                alert('Error creating account');
            }
        }
    };
    xhr.send(JSON.stringify({ user: user, pass: pass }));
});
