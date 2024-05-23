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

document.addEventListener('DOMContentLoaded', function() {
    checkUserLoggedIn();
});

function checkUserLoggedIn() {
    const usernameCookie = document.cookie.split('; ').find(cookie => cookie.startsWith('username='));
    if (!usernameCookie) {
        window.location.href = '/';
        return;
    }
    const authorityCookie = document.cookie.split('; ').find(cookie => cookie.startsWith('authority='));
    const authority = authorityCookie? authorityCookie.split('=')[1] : '0';
    const inventoryLink = document.getElementById('inv');
    const addAccountLink = document.getElementById('inv1');
    const createAccountLink = document.getElementById('inv2');

    if (authority === '1') {
        inventoryLink.style.display = 'none';
        addAccountLink.style.display = 'none';
        createAccountLink.style.display = 'none';
    }
}