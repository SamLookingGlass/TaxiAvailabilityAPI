let singapore = [1.29, 103.85]
let map = L.map('map').setView(singapore, 13);

// ESRI Leaflet API Token
let apiToken = 'AAPKa44cc3d9e4ae4facae3db37598891536u8VcocjPLyXxxaguleDVkZdePzQo7nEOjYWuzaKIfZfzB0QumPr6svIIJ-IBz8b8'

// Taxi Availability API
const API_ENDPOINT_1 = 'https://api.data.gov.sg/v1/transport/taxi-availability';

// Customizing the marker
var taxiIcon = L.icon({
    iconUrl: 'https://icon-library.com/images/cab-icon/cab-icon-1.jpg',
    // shadowUrl: '',

    iconSize:     [30, 30], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

// Set up Tile Layer
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw' //demo access token
}).addTo(map);


// ESRI Geocoding Service
let geocodeService = L.esri.Geocoding.geocodeService({
  apikey: apiToken // 
});

// Give address for any latlgn on click
// map.on('click', (result) => {
//   console.log(result)
//   geocodeService.reverse().latlng(result.latlng).run(function (error, result) {
//     if (error) {
//       return;
//     }

//     L.marker(result.latlng).addTo(map).bindPopup(result.address.Match_addr).openPopup();
//   });
// });
    
// Create cluster layer 
let markerClusterLayer = L.markerClusterGroup();

// Available Taxi
async function getTaxi() {
  let response = await axios.get(API_ENDPOINT_1);
  let availCoordinates = response.data.features[0].geometry.coordinates;
  for (let i of availCoordinates) {
    let latSpan = parseFloat(i[1]);
    let lngSpan = parseFloat(i[0]);
    let pos = [latSpan, lngSpan]
    geocodeService.reverse().latlng(pos).run(function (error, result) {
    if (error) {
      return;
    }
    L.marker(pos, {icon: taxiIcon}).addTo(markerClusterLayer).bindPopup(result.address.Match_addr);
  })
  }
  markerClusterLayer.addTo(map)
  // Refresh API every 10 seconds
  setTimeout(() =>  getTaxi(), 10000)
  }
    
// getTaxi()

function getRandomLatLng(map) {
  // get the boundaries of the map
  let bounds = map.getBounds();
  let southWest = bounds.getSouthWest();
  let northEast = bounds.getNorthEast();
  let lngSpan = northEast.lng - southWest.lng;
  let latSpan = northEast.lat - southWest.lat;

  let randomLng = Math.random() * lngSpan + southWest.lng;
  let randomLat = Math.random() * latSpan + southWest.lat;

  return [ randomLat, randomLng,];
}

let group= L.layerGroup(); // 1. create the layer group
L.marker(getRandomLatLng(map)).addTo(group);  // 2. add markers to the group
L.marker(getRandomLatLng(map)).addTo(group);
L.marker(getRandomLatLng(map)).addTo(group);

// add the group layer to the map
group.addTo(map); // 3. add the layer to the map

let group2 = L.layerGroup();
for (let i = 0; i < 5; i++) {
    L.circle(getRandomLatLng(map), {
    color: 'red',
    fillColor:"orange",
    fillOpacity:0.5,
    radius: 500
}).addTo(group2);
}

let group3 = L.layerGroup();
for (let i = 0; i < 5; i++) {
    L.circle(getRandomLatLng(map), {
    color: 'red',
    fillColor:"green",
    fillOpacity:0.5,
    radius: 250
}).addTo(group3);
}

let baseLayers ={
  'Markers': group,
  'Circles': group2
}

let overlays = {
  'Green Circle':group3
}

L.control.layers(baseLayers, overlays).addTo(map);