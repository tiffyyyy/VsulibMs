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
window.addEventListener('load', updateWelcomeMessage);

function fetchAndDisplayEquipmentDetails() {
    // Extract the equipId from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const equipId = urlParams.get('equip_id');

    if (!equipId) {
        console.error('Equipment ID not found in URL');
        return;
    }

    fetch(`/getEquipDetails?equip_id=${equipId}`)
        .then(response => response.json())
        .then(details => {
            displayEquipmentDetails(details);
        })
        .catch(error => console.error('Error fetching equipment details:', error));
}

function displayEquipmentDetails(details) {
    const equipBox = document.querySelector('.equipBox');
    equipBox.innerHTML = ''; // Clear the existing content

    // Create and append the new content based on the details
    const entityNumberContainer = document.createElement('div');
    entityNumberContainer.className = 'entityNumber';
    const numberP = document.createElement('h3');
    numberP.textContent = details.entityNumber; // Assuming details contains entityNumber
    entityNumberContainer.appendChild(numberP);
    equipBox.appendChild(entityNumberContainer);

    const nameP = document.createElement('p');
    nameP.textContent = details.equip_name;
    nameP.className = 'equipText';
    equipBox.appendChild(nameP);

    const img = document.createElement('img');
    img.src = `data:image/jpeg;base64,${details.equip_pic}`; // Adjust the MIME type as necessary
    img.alt = `${details.equip_name} Image`;
    equipBox.appendChild(img);

    const statusP = document.createElement('p');
    statusP.textContent = `Status: ${details.status}`;
    equipBox.appendChild(statusP);

    const equipNoP = document.createElement('p');
    equipNoP.textContent = `Serial Number: ${details.equip_no}`;
    equipBox.appendChild(equipNoP);
}

document.addEventListener("DOMContentLoaded", function() {
    fetchAndDisplayEquipmentDetails();

    const urlParams = new URLSearchParams(window.location.search);
    let equipId = urlParams.get('equip_id');

    // Fetch the proposed date when the page loads
    fetchProposedDate(equipId);
    fetchActualDate(equipId);

    // Also fetch the proposed date when the "Proposed" button is clicked
    document.querySelector('.proposed').addEventListener('click', function() {
        isProposed = true;
        fetchProposedDate(equipId); // Fetch the proposed date again
        fetchActualDate(equipId);
    });

});

const yearSelect = document.getElementById('yearSelect');
const currentYear = new Date().getFullYear();
for (let year = 2000; year <= 3000; year++) {
    let option = document.createElement('option');
    option.value = year;
    option.text = year;
    if (year === currentYear) {
        option.selected = true; // Set the current year as selected
    }
    yearSelect.appendChild(option);
}

// Populate month dropdown
const monthSelect = document.getElementById('monthSelect');
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11, so we add 1 to get 1-12
months.forEach((month, index) => {
    let option = document.createElement('option');
    option.value = index + 1;
    option.text = month;
    if (index + 1 === currentMonth) {
        option.selected = true; // Set the current month as selected
    }
    monthSelect.appendChild(option);
});

let chosenDay = 1;
document.addEventListener('DOMContentLoaded', function() {
    function generateCalendar(year, month) {
        const calendar = document.getElementById('calendar');
        calendar.innerHTML = '';
    
        const date = new Date(year, month - 1, 1);
        const daysInMonth = new Date(year, month, 0).getDate();
    
        // Fill in days of the week
        for (let i = 0; i < date.getDay(); i++) {
            let day = document.createElement('div');
            calendar.appendChild(day);
        }
    
        // Fill in days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            let dayDiv = document.createElement('div');
            dayDiv.textContent = day;
            dayDiv.addEventListener('click', function() {
                chosenDay = day;
            });
            calendar.appendChild(dayDiv);
        }
    }
    
    // Update calendar on dropdown change
    yearSelect.addEventListener('change', function() {
        generateCalendar(this.value, monthSelect.value);
    });
    
    monthSelect.addEventListener('change', function() {
        generateCalendar(yearSelect.value, this.value);
    });
    
    // Generate initial calendar
    generateCalendar(yearSelect.value, monthSelect.value);
});

// Declare isProposed at the top level of your script
let isProposed = true;

// Event listener for the "Proposed" button
document.querySelector('.proposed').addEventListener('click', function() {
    isProposed = true;
});

// Event listener for the "Actual" button
document.querySelector('.actual').addEventListener('click', function() {
    isProposed = false;
});

document.getElementById('saveBtn').addEventListener('click', function() {
    const year = yearSelect.value;
    const month = monthSelect.value;
    const day = chosenDay; // Assuming chosenDay is defined elsewhere in your code

    // Convert the month to a zero-based index (January is 0, December is 11)
    const zeroBasedMonth = parseInt(month) - 1;

    // Create a Date object for the selected date
    const selectedDate = new Date(year, zeroBasedMonth, day+1);

    // Convert the date to a string in the format YYYY-MM-DD
    const formattedDate = selectedDate.toISOString().split('T')[0];

    // Determine which date to send based on the flag
    const dateToSend = isProposed ? { proposedDate: formattedDate } : { actualDate: formattedDate };
    console.log(isProposed); // This should now correctly log the value of isProposed

    // Send the formatted date to the server
    fetch('/saveSchedule', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dateToSend),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Schedule saved successfully.');
            location.reload();
        } else {
            alert('Failed to save schedule.');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Failed to save schedule.');
    });
});

function fetchProposedDate(equipId) {
    console.log(equipId);
    fetch(`/getProposedDate?equip_id=${equipId}`)
        .then(response => response.json())
        .then(data => {
            if (data.proposedDate) {
                enableActualButton();
                console.log(data.proposedDate);
            } else {
                disableActualButton();
            }
        })
        .catch(error => console.error('Error fetching proposed date:', error));
}

function enableActualButton() {
    document.querySelector('.actual').disabled = false;
}

function disableActualButton() {
    document.querySelector('.actual').disabled = true;
}

document.getElementById('finish').addEventListener('click', function() {
    // Extract equip_id from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const equipId = urlParams.get('equip_id');

    if (equipId) {
        // Send a request to your server-side script
        fetch('/finishMaintenance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ equipId: equipId }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Schedule saved to history and deleted from schedule.');
            } else {
                alert('An error occurred.');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An error occurred.');
        });
    } else {
        alert('Equipment ID not found in the URL.');
    }
});

function fetchActualDate(equipId) {
    console.log(equipId);
    fetch(`/getActualDate?equip_id=${equipId}`)
        .then(response => response.json())
        .then(data => {
            if (data.actualDate) {
                enableFinishButton();
                console.log(data.actualDate);
            } else {
                disableFinishButton();
            }
        })
        .catch(error => console.error('Error fetching actual date:', error));
}

function enableFinishButton() {
    document.getElementById('finish').disabled = false;
}

function disableFinishButton() {
    document.getElementById('finish').disabled = true;
}
