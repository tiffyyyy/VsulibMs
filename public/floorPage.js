function displayAreas(areas) {
    const row2 = document.querySelector('.row2');
    row2.innerHTML = ''; // Clear existing content

    areas.forEach(area => {
        const areaElement = document.createElement('p');
        areaElement.textContent = `Area: ${area.name}`;
        row2.appendChild(areaElement);
        console.log('Area:', area);
    });
}

document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const floorId = urlParams.get('floorId');
    
    console.log(floorId);
    fetch(`/area`)
        .then(response => response.json())
        .then(results => {
            displayAreas(results);
            console.log(results);
        })
        .catch(error => {
            console.error('Error fetching areas:', error);
        });
});

