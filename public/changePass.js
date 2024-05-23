document.getElementById('createBtn').addEventListener('click', async function() {
    const username = document.getElementById('user').value;
    const password = document.getElementById('pass').value;

    // Fetch the ID from the cookie
    const id = getCookie('id');
    console.log(id);
    if (!id) {
        alert('User ID not found');
        return;
    }

    try {
        const response = await fetch('/updateAccount', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, username, password })
        });

        const result = await response.json();
        if (result.status === 'success') {
            alert('Account updated successfully');
        } else {
            alert('Failed to update account: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the account');
    }
});

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
