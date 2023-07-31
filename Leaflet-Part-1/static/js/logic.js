// Creating the map object
let myMap = L.map("map", {
    center: [27.96044, -82.30695],
    zoom: 7
  });
  
  // Adding the tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(myMap);
  
  // Load the GeoJSON data.
  let geoDataUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
  
  // Get the data with d3.
  d3.json(geoDataUrl).then(function (data) {
    // Function to style the markers based on earthquake magnitude and depth
    function getMarkerStyle(feature) {
      let magnitude = feature.properties.mag;
      let depth = feature.geometry.coordinates[2];
  
      // Define the color and size scales based on depth and magnitude
      let depthColors = ["#66bd63", "#d9ef8b", "#fee08b", "#fc8d59", "#d73027"]; // Customize the colors as needed
      let depthScale = d3.scaleQuantile().domain([0, 10, 50, 100, 300]).range(depthColors);
  
      let magnitudeScale = d3.scalePow().exponent(0.5).domain([0, 10]).range([5, 25]); // Adjust the scale range as needed
  
      return {
        radius: magnitudeScale(magnitude),
        fillColor: depthScale(depth),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      };
    }
  
    // Create a GeoJSON layer with the data and style the markers
    let geojson = L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, getMarkerStyle(feature));
      },
      onEachFeature: function (feature, layer) {
        // Binding a popup to each layer
        layer.bindPopup(
          `<strong>Location:</strong> ${feature.properties.place}<br>
           <strong>Magnitude:</strong> ${feature.properties.mag}<br>
           <strong>Depth:</strong> ${feature.geometry.coordinates[2]} km`
        );
      }
    }).addTo(myMap);
  
    // Fit the map to show all earthquake markers
    myMap.fitBounds(geojson.getBounds());
  
    // Set up the legend.
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function (map) {
      let div = L.DomUtil.create("div", "info legend");
      let depths = [0, 10, 50, 100, 300];
      let depthColors = ["#66bd63", "#d9ef8b", "#fee08b", "#fc8d59", "#d73027"]; // Use the same colors as in the marker style function
      let labels = [];
  
      // Loop through the depth intervals and generate a label with color for each interval
      div.innerHTML += '<strong>Depth (km)</strong><br>';
      for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
          '<i style="background:' + depthColors[i] + '"></i> ' +
          depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km<br>' : '+ km');
      }
  
      return div;
    };
  
    // Adding the legend to the map
    legend.addTo(myMap);
  
    // Add legend text indicating colors
    let legendText = '<strong>Depth Colors:</strong><br>';
    legendText += '<i style="background:#66bd63"></i> 0-10 km<br>';
    legendText += '<i style="background:#d9ef8b"></i> 10-50 km<br>';
    legendText += '<i style="background:#fee08b"></i> 50-100 km<br>';
    legendText += '<i style="background:#fc8d59"></i> 100-300 km<br>';
    legendText += '<i style="background:#d73027"></i> 300+ km<br>';
  
    let legendDiv = L.DomUtil.create("div", "info legend");
    legendDiv.innerHTML = legendText;
    myMap.controls[0]._container.appendChild(legendDiv);
  });
  