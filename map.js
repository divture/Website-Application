class LeafletMap {
    constructor(containerId, center, zoom) {
        this.map = L.map(containerId).setView(center, zoom);
        this.initTileLayer();
        this.markers = []; // Store marker references to open popup later
    }

    initTileLayer() {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 7,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
    }

    addMarker(lat, lng, title, descript, image, status, link) {
        const marker = L.marker([lat, lng]).addTo(this.map);

        // Ensure the HTML syntax is correct (no semicolon in the div tag)
        const popupContent = `
            <div class="popup-content" style="width: 20rem;">
                <h3>${title}</h3>
                <img src="${image}" class="card-img-top" alt="..." style="width:13rem; height: 8rem; margin-left: 3rem;">
                <p><strong>Description:</strong> ${descript}</p>
                <p><strong>Conservation Status:</strong> ${status}</p>
                <p><strong>Longitude:</strong> ${lng} <strong> Latitude: </strong> ${lat} </p>
                <a href="${link}" target="_blank">Learn more</a>
            </div>
        `;

        marker.bindPopup(popupContent);
        this.markers.push({ lat, lng, title, marker, descript, status, link });
        return marker;
    }

    openPopup(lat, lng) {
        const marker = this.markers.find(m => m.lat === lat && m.lng === lng);
        if (marker) {
            this.map.setView([lat, lng], 18); // Zoom to the marker's location
            marker.marker.openPopup(); // Open the popup
        }
    }

    loadMarkersFromJson(url) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                data.forEach(marker => {
                    this.addMarker(
                        marker.latitude,
                        marker.longitude,
                        marker.title,
                        marker.descript,
                        marker.image,
                        marker.status,
                        marker.link
                    );
                });
            })
            .catch(error => console.error('Error loading markers:', error));
    }
}

class LocationCard {
    constructor(title, lat, lng, descript = "No description available", image, brief = "Brief info not available", photo, link) {
        this.title = title;
        this.lat = lat;
        this.lng = lng;
        this.descript = descript;
        this.image = image;
        this.brief = brief;
        this.photo = photo; 
        this.link = link;   
    }

    createCard() {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card location-card';
        cardDiv.innerHTML = `
            <div class="card-body" style="background-color: rgb(232 236 215);">
              <div class="row">
                <div class="col-sm-4">
                    <img src="${this.photo}" class="card-img-top" alt="..."> <!-- Use photo here -->
                </div>
                <div class="col-sm-8">
                     <h5 class="card-title">${this.title}</h5>
                     <p class="card-text" style="font-size: 14px;">${this.brief}</p> <!-- Use the brief here -->
                </div>        
              </div>
            </div>
        `;

        // Add a click event to the card to open the corresponding marker popup
        cardDiv.addEventListener('click', () => {
            myMap.openPopup(this.lat, this.lng); // Open the popup for that location
        });

        return cardDiv;
    }
}

class LocationRenderer {
    constructor(containerId, searchInputId, mapInstance) {
        this.container = document.getElementById(containerId);
        this.searchInput = document.getElementById(searchInputId);
        this.mapInstance = mapInstance;
        this.appletData = [];
        this.filteredData = [];
        this.searchInput.addEventListener('input', () => this.filterLocations());
    }

    fetchLocationData(url) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                this.appletData = data;
                this.filteredData = data;  // initially show all locations
                this.renderLocation(this.filteredData);  // render all initially
            })
            .catch(error => console.error('Error loading location data:', error));
    }

    renderLocation(data) {
        this.container.innerHTML = '';  // clear the container before rendering new items
        data.forEach(location => {
            const locationCard = new LocationCard(
                location.title, 
                location.latitude, 
                location.longitude, 
                location.descript, 
                location.image, 
                location.brief, 
                location.photo, // Pass photo
                location.link // Pass link
            );
            const cardElement = locationCard.createCard();
            this.container.appendChild(cardElement);
        });
    }

    filterLocations() {
        const query = this.searchInput.value.toLowerCase();  // get search query
        this.filteredData = this.appletData.filter(location =>
            location.title.toLowerCase().includes(query) ||
            (location.descript && location.descript.toLowerCase().includes(query))  // check description as well
        );
        this.renderLocation(this.filteredData);  // render the filtered data
    }
}

// Function to move map and open popup based on button click
function moveToLocation(lat, lng, title) {
    myMap.openPopup(lat, lng);  // Open popup for that location
    myMap.map.setView([lat, lng], 18);  // Zoom in on the location
}

const myMap = new LeafletMap('map', [8.360004, 124.868419], 14);

// Load markers from an external JSON file
myMap.loadMarkersFromJson('map.json');

const locationRenderer = new LocationRenderer('location-container', 'searchLocation', myMap);
locationRenderer.fetchLocationData('map.json');
