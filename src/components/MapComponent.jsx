// components/MapComponent.jsx

import React, { useEffect } from 'react';

const MapComponent = ({ latitude, longitude, onLocationSelect }) => {
  useEffect(() => {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    const defaultLat = latitude ? parseFloat(latitude) : -26.2041;
    const defaultLng = longitude ? parseFloat(longitude) : 28.0473;

    const mapHtml = `
      <div style="height: 100%; width: 100%; border-radius: 8px; overflow: hidden;">
        <div id="leaflet-map" style="height: 100%; width: 100%;"></div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.js"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css" />
        <script>
          const map = L.map('leaflet-map').setView([${defaultLat}, ${defaultLng}], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          
          let marker;
          
          if (${latitude} && ${longitude}) {
            marker = L.marker([${defaultLat}, ${defaultLng}]).addTo(map);
          }

          map.on('click', function(e) {
            if (marker) {
              map.removeLayer(marker);
            }
            marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
            
            window.parent.postMessage({
              type: 'map-click',
              latitude: e.latlng.lat,
              longitude: e.latlng.lng
            }, '*');
          });
        </script>
      </div>
    `;

    mapContainer.innerHTML = mapHtml;

    const handleMessage = (event) => {
      if (event.data.type === 'map-click') {
        onLocationSelect(event.data.latitude, event.data.longitude);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [latitude, longitude, onLocationSelect]);

  return (
    <div 
      id="map-container" 
      style={{
        height: '100%',
        width: '100%',
        borderRadius: '8px',
        border: '1px solid #ccc'
      }}
    />
  );
};

export default MapComponent;
