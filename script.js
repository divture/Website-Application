// Base class: LeafletMap (Encapsulation & Abstraction)
class LeafletMap {
    constructor(containerId, center, zoom) {
        this.map = L.map(containerId).setView(center, zoom);
        this.initTileLayer();
        this.markers = []; // Store added markers
    }

    // Abstraction: Method to initialize the tile layer
    initTileLayer() {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 10,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
    }

    // Abstraction: Method to add markers
    addMarker(lat, lng, message) {
        const marker = L.marker([lat, lng]).addTo(this.map);
        marker.bindPopup(message);
        this.markers.push(marker);  // Store the marker in the array
    }

    // Encapsulation: Method to remove all markers
    removeMarkers() {
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];
    }

    // Encapsulation & Abstraction: Move map to a new location
    moveToLocation(lat, lng, message) {
        this.map.setView([lat, lng], 18); // Move map to new center
        this.removeMarkers(); // Clear existing markers
        this.addMarker(lat, lng, message); // Add marker to new location
    }
}

// Inheritance: Custom class that extends LeafletMap and adds new functionality
class CustomLeafletMap extends LeafletMap {
    constructor(containerId, center, zoom) {
        super(containerId, center, zoom);  // Inherit from LeafletMap
        this.customMarkers = [];  // Store custom markers
    }

    // Polymorphism: Adding a custom marker with different properties
    addCustomMarker(lat, lng, message, iconUrl) {
        const icon = L.icon({ iconUrl: iconUrl });
        const marker = L.marker([lat, lng], { icon: icon }).addTo(this.map);
        marker.bindPopup(message);
        this.customMarkers.push(marker);  // Store custom marker
    }

    // Overriding the removeMarkers function to remove custom markers as well
    removeMarkers() {
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.customMarkers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];
        this.customMarkers = [];
    }
}

// Using the classes: Create an instance of CustomLeafletMap
const myMap = new CustomLeafletMap('map', [8.360004, 124.868419], 18);

// Adding a regular marker
myMap.addMarker(8.360004, 124.868419, "Regular Marker");

// Adding a custom marker with a unique icon
myMap.addCustomMarker(8.361004, 124.869419, "Custom Marker",);

// Function to move the map based on button click (polymorphism in action)
function moveToLocation(lat, lng, message, isCustom = false, iconUrl = "") {
    if (isCustom) {
        myMap.addCustomMarker(lat, lng, message, iconUrl);  // Custom marker
    } else {
        myMap.moveToLocation(lat, lng, message);  // Regular marker
    }
}
