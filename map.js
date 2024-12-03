// LeafletMap encapsulating all map-related functionality
class LeafletMap {
    constructor(containerId, center, zoom) {
        this.map = L.map(containerId).setView(center, zoom);
        this.initTileLayer();
        this._markers = [];  // Encapsulated internal data (markers)
    }

    // Method for adding a tile layer
    initTileLayer() {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 7,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
    }

      // Add a marker to the map (Abstraction for map logic)
      addMarker(lat, lng, title, descript, image, status, link) {
        // Create a custom icon
        const customIcon = L.icon({
            iconUrl: 'images/marker.png', // Path to your custom icon image
            iconSize: [32, 32],  // Size of the icon
            iconAnchor: [16, 32],  // Point of the icon which will correspond to marker's location
            popupAnchor: [0, -32]  // Adjust the popup position
        });

        // Create a marker with the custom icon
        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.map);

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
        this._markers.push({ lat, lng, title, marker, descript, status, link });  // Encapsulated marker data
        return marker;
    }
    // Open a popup for a specific marker
    openPopup(lat, lng) {
        const marker = this._markers.find(m => m.lat === lat && m.lng === lng);
        if (marker) {
            this.map.setView([lat, lng], 18); // Zoom to the marker's location
            marker.marker.openPopup(); // Open the popup
        }
    }

    // Load markers from a JSON source (Abstraction for data handling)
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

// Class for rendering and managing location data
class LocationRenderer {
    constructor(containerId, searchInputId, mapInstance) {
        this.container = document.getElementById(containerId);
        this.searchInput = document.getElementById(searchInputId);
        this.mapInstance = mapInstance;
        this.appletData = [];
        this.filteredData = [];
        this.searchInput.addEventListener('input', () => this.filterLocations());
    }

    // Fetch location data from an external source
    fetchLocationData(url) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                this.appletData = data;
                this.filteredData = data;  // Initially show all locations
                this.renderLocation(this.filteredData);  // Render all initially
            })
            .catch(error => console.error('Error loading location data:', error));
    }

    // Render location data cards
    renderLocation(data) {
        this.container.innerHTML = '';  // Clear the container before rendering new items
        data.forEach(location => {
            const locationCard = new LocationCard(
                location.title, 
                location.latitude, 
                location.longitude, 
                location.descript, 
                location.image, 
                location.brief, 
                location.photo, 
                location.link
            );
            const cardElement = locationCard.createCard();
            this.container.appendChild(cardElement);
        });
    }

    // Filter locations based on search input
    filterLocations() {
        const query = this.searchInput.value.toLowerCase();  // Get search query
        this.filteredData = this.appletData.filter(location =>
            location.title.toLowerCase().includes(query) ||
            (location.descript && location.descript.toLowerCase().includes(query))  // Check description as well
        );
        this.renderLocation(this.filteredData);  // Render the filtered data
    }
}

// Base Class for LocationCard
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
            <div class="card-body" style="background-color: rgb(192 199 140);">
              <div class="row">
                <div class="col-sm-4">
                    <img src="${this.photo}" class="card-img-top" alt="..."> <!-- Use photo here -->
                </div>
                <div class="col-sm-8">
                     <h5 class="card-title">${this.title}</h5>
                     <p class="card-text" style="font-size: 12px;">${this.brief}</p> <!-- Use the brief here -->
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

// A specialized LocationCard subclass for a different type of location (could be a specific category, etc.)
class DetailedLocationCard extends LocationCard {
    constructor(title, lat, lng, descript, image, brief, photo, link, additionalDetails) {
        super(title, lat, lng, descript, image, brief, photo, link);  // Call parent class constructor
        this.additionalDetails = additionalDetails;  // Additional details specific to this subclass
    }

    // Override createCard to show more details
    createCard() {
        const cardDiv = super.createCard();  // Get the basic card HTML from the parent class

        // Add more details to the card
        const detailsDiv = document.createElement('div');
        detailsDiv.innerHTML = `<p><strong>Additional Info:</strong> ${this.additionalDetails}</p>`;
        cardDiv.appendChild(detailsDiv);

        return cardDiv;
    }
}


const myMap = new LeafletMap('map', [8.360004, 124.868419], 14);
myMap.loadMarkersFromJson('map.json');

const locationRenderer = new LocationRenderer('location-container', 'searchLocation', myMap);
locationRenderer.fetchLocationData('map.json');
