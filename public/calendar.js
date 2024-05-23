function updateWelcomeMessage() {
    const usernameCookie = document.cookie.split('; ').find(cookie => cookie.startsWith('username='));
    if (usernameCookie) {
        const usernameValue = usernameCookie.split('=')[1];
        let username = decodeURIComponent(usernameValue);

        username = username.charAt(0).toUpperCase() + username.slice(1);
        document.getElementById('welcomeMessage').innerText = username;
    } else {
        console.log('Username cookie not found');
    }
}
window.addEventListener('load', updateWelcomeMessage);

function fetchAndDisplayEquipmentDetails() {
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
    equipBox.innerHTML = '';

    const entityNumberContainer = document.createElement('div');
    entityNumberContainer.className = 'entityNumber';
    const numberP = document.createElement('h3');
    numberP.textContent = details.entityNumber;
    entityNumberContainer.appendChild(numberP);
    equipBox.appendChild(entityNumberContainer);

    const nameP = document.createElement('p');
    nameP.textContent = details.equip_name;
    nameP.className = 'equipText';
    equipBox.appendChild(nameP);

    const img = document.createElement('img');
    img.src = `data:image/jpeg;base64,${details.equip_pic}`;
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

    fetchProposedDate(equipId);
    fetchActualDate(equipId);

    document.querySelector('.proposed').addEventListener('click', function() {
        isProposed = true;
        fetchProposedDate(equipId);
        fetchActualDate(equipId);
    });

    const proposedButton = document.querySelector('.proposed');
    const actualButton = document.querySelector('.actual');

    proposedButton.classList.add('active-button');
    actualButton.classList.remove('active-button');
});

const yearSelect = document.getElementById('yearSelect');
const currentYear = new Date().getFullYear();
for (let year = 2000; year <= 3000; year++) {
    let option = document.createElement('option');
    option.value = year;
    option.text = year;
    if (year === currentYear) {
        option.selected = true;
    }
    yearSelect.appendChild(option);
}

const monthSelect = document.getElementById('monthSelect');
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const currentMonth = new Date().getMonth() + 1;
months.forEach((month, index) => {
    let option = document.createElement('option');
    option.value = index + 1;
    option.text = month;
    if (index + 1 === currentMonth) {
        option.selected = true;
    }
    monthSelect.appendChild(option);
});

let chosenDay = 1;
let lastClickedDay = null;
document.addEventListener('DOMContentLoaded', function() {
    function generateCalendar(year, month) {
        const date = new Date(year, month - 1, 1);
        const daysInMonth = new Date(year, month, 0).getDate();
        
        const weekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weekLabels.forEach(label => {
            let labelDiv = document.createElement('div');
            labelDiv.textContent = label;
            calendar.appendChild(labelDiv);
        });

        for (let i = 0; i < date.getDay(); i++) {
            let day = document.createElement('div');
            calendar.appendChild(day);
        }
    
        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            let dayDiv = document.createElement('div');
            dayDiv.textContent = day;
            dayDiv.addEventListener('click', function() {
                if (lastClickedDay) {
                    lastClickedDay.style.removeProperty('background-color');
                }
                this.style.backgroundColor = '#B49B44';
                lastClickedDay = this;
                chosenDay = day;
                void this.offsetHeight;
            });
            calendar.appendChild(dayDiv);
        }

        const lastWeekDays = 7 - (new Date(year, month, 0).getDay() + 1);
        for (let i = 0; i < lastWeekDays; i++) {
        let dayDiv = document.createElement('div');
        dayDiv.textContent = '';
        calendar.appendChild(dayDiv);
    }
    }
    
    yearSelect.addEventListener('change', function() {
        while(calendar.firstChild) {
            calendar.removeChild(calendar.firstChild);
        }
        generateCalendar(this.value, monthSelect.value);
    });
    
    monthSelect.addEventListener('change', function() {
        while(calendar.firstChild) {
            calendar.removeChild(calendar.firstChild);
        }
        generateCalendar(yearSelect.value, this.value);
    });
    
    generateCalendar(yearSelect.value, monthSelect.value);
});

let isProposed = true;

document.querySelector('.proposed').addEventListener('click', function() {
    isProposed = true;
    const proposedButton = document.querySelector('.proposed');
    const actualButton = document.querySelector('.actual');

    proposedButton.classList.add('active-button');
    actualButton.classList.remove('active-button');
});

document.querySelector('.actual').addEventListener('click', function() {
    isProposed = false;
    const proposedButton = document.querySelector('.proposed');
    const actualButton = document.querySelector('.actual');
    actualButton.classList.add('active-button');
    proposedButton.classList.remove('active-button');
});

document.getElementById('saveBtn').addEventListener('click', function() {
    const year = yearSelect.value;
    const month = monthSelect.value;
    const day = chosenDay;
    const remarks = document.getElementById('remarks').value;

    const zeroBasedMonth = parseInt(month) - 1;
    const selectedDate = new Date(year, zeroBasedMonth, day+1);
    const formattedDate = selectedDate.toISOString().split('T')[0];

    const dateToSend = isProposed ? { proposedDate: formattedDate, remarks1: remarks } : { actualDate: formattedDate, remarks2: remarks };

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
    document.querySelector('.actual').classList.remove('actual-button-disabled');
    document.querySelector('.actual').style.cursor = 'pointer';
}

function disableActualButton() {
    document.querySelector('.actual').disabled = true;
    document.querySelector('.actual').classList.add('actual-button-disabled');
}

document.getElementById('finish').addEventListener('click', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const equipId = urlParams.get('equip_id');

    if (equipId) {
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
                alert('Schedule saved to history');
                location.reload();
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
    document.getElementById('finish').classList.remove('finish-button-disabled');
    document.getElementById('finish').style.cursor = 'pointer';
}

function disableFinishButton() {
    document.getElementById('finish').disabled = true;
    document.getElementById('finish').classList.add('finish-button-disabled');
}

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

document.addEventListener('DOMContentLoaded', function() {
    checkUserLoggedIn();
});

function logout() {
    const cookiePaths = [
        '/inventory', '/floorPage', '/areaPage', '/equipmentPage', '/partsPage', '/specsPage',
        '/scheduleFloorPage', '/scheduleAreaPage', '/scheduleEquipmentPage', '/calendarPage',
        '/inspectionFloorPage', '/inspectionAreaPage', '/inspectionEquipmentPage', '/inspectionPage',
        '/historyPage', '/historyDetailPage', '/pending','/createAccount'
    ];

    cookiePaths.forEach(path => {
        document.cookie = `username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
        document.cookie = `authority=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
    });

    window.location.href = '/';
}

document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const floorId = urlParams.get('floorId');
    const areaId = urlParams.get('areaId');
    const equipId = urlParams.get('equip_id');

    const floorLink = document.querySelector('.nav-link a[href="/scheduleFloorPage"]');
    const areaLink = document.querySelector('.nav-link a[href="/scheduleAreaPage"]');
    const equipmentLink = document.querySelector('.nav-link a[href="/scheduleEquipmentPage"]');
    const calendarLink = document.querySelector('.nav-link a[href="/calendarPage"]');

    floorLink.href = `/scheduleFloorPage`;
    areaLink.href = `/scheduleAreaPage?floorId=${floorId}`;
    equipmentLink.href = `/scheduleEquipmentPage?floorId=${floorId}&areaId=${areaId}`;
    calendarLink.href = `/calendarPage?floorId=${floorId}&areaId=${areaId}&equip_id=${equipId}`;
});