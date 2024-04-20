function updateWelcomeMessage() {
    // Get the username from the cookie
    const usernameCookie = document.cookie.split('; ').find(cookie => cookie.startsWith('username='));
    if (usernameCookie) {
        const usernameValue = usernameCookie.split('=')[1];
        const username = decodeURIComponent(usernameValue);

        // Display the username in the welcome message
        document.getElementById('welcomeMessage').innerText = username;
    } else {
        console.log('Username cookie not found');
    }
}
window.addEventListener('load', updateWelcomeMessage);

document.addEventListener('DOMContentLoaded', () => {
    const labelsTable = document.querySelector('.labelsTable');

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Function to fetch and display all history data
    function fetchAndDisplayAllHistory() {
        fetch('/api/history')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                labelsTable.innerHTML = `
                    <tr>
                        <th>Equipment Name</th>
                        <th>Equipment Number</th>
                        <th>Saved Date</th>
                    </tr>
                `;

                data.forEach(record => {
                    const formattedDate = formatDate(record.saved_at);
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${record.equip_name}</td>
                        <td>${record.equip_no}</td>
                        <td>${formattedDate}</td>
                    `;
                    const link = document.createElement('a');
                    link.href = `/historyDetailPage?id=${record.id}`;
                    link.appendChild(row);
                    labelsTable.appendChild(link);
                    console.log(record.id);
                });
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
    }

    fetchAndDisplayAllHistory();
});
