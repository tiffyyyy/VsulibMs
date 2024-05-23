document.getElementById('loginBtn').addEventListener('click', function() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/login', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (response.loginStatus === 'success') {
                    const authority = response.authority;
                    const id = response.id;
                    const paths = [
                        '/inventory',
                        '/floorPage',
                        '/createAccount',
                        '/areaPage',
                        '/equipmentPage',
                        '/partsPage',
                        '/specsPage',
                        '/scheduleFloorPage',
                        '/scheduleAreaPage',
                        '/scheduleEquipmentPage',
                        '/calendarPage',
                        '/inspectionFloorPage',
                        '/inspectionAreaPage',
                        '/inspectionEquipmentPage',
                        '/inspectionPage',
                        '/historyPage',
                        '/historyDetailPage',
                        '/pdf/:id',
                        '/pending',
                        '/changePass',
                        '/summary'
                    ];
                    paths.forEach(path => {
                        document.cookie = `username=${encodeURIComponent(username)}; path=${path};`;
                        document.cookie = `authority=${encodeURIComponent(authority)}; path=${path};`;
                        document.cookie = `id=${encodeURIComponent(id)}; path=${path};`; // Set the id cookie for each path
                    });

                    console.log(document.cookie);
                    window.location.href = `scheduleFloorPage?id=${id}`;
                } else {
                    alert('Invalid username or password');
                }
            } else {
                alert('Invalid username or password');
            }
        }
    };
    xhr.send(JSON.stringify({ username: username, password: password }));
});
