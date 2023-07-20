// Set up the map object.
let map = L.map("map", {
    center: [38, -118],
    zoom: 4
    });


// Add the tile layer.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

// Load the GeoJSON data.
let geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let geojson;


// Fetch and process the earthquake data:
// Parse the GeoJSON data and extract the necessary information (magnitude, coordinates, depth, etc.) for each earthquake.
// Fetch and process earthquake data using D3
d3.json(geoData).then(function(data) {

    // Access the features array in the GeoJSON data, which contains the information for each earthquake
    var features = data.features;

    // Variables to store the maximum magnitude and depth
    var maxMagnitude = -Infinity;
    var maxDepth = -Infinity;
    var minDepth = Infinity;

    // Iterate over the features array to find the maximum values
    features.forEach(function(feature) {

        var magnitude = feature.properties.mag;
        var depth = feature.geometry.coordinates[2];

        // Update maxMagnitude if current magnitude is larger
        if (magnitude > maxMagnitude) {
            maxMagnitude = magnitude;
        }

        // Update maxDepth if current depth is larger
        if (depth > maxDepth) {
            maxDepth = depth;
        }
        
        // Update minDepth if current depth is smaller
        if (depth < minDepth) {
            minDepth = depth;
    }   
    }); 

    // Logging for tracking purposes
    console.log("Max Magnitude:", maxMagnitude);
    console.log("Max Depth:", maxDepth);

    // Linear scale for magnitude
    var magnitudeScale = d3.scaleLinear()
    .domain([0, maxMagnitude]) 
    .range([5, 25]); 

    // Linear scale for depth
    var depthScale = d3.scaleLog() // using Log b/c of outlier >500. Example used 90.
    .domain([.1, maxDepth]) // these selections added more variability to colors, better representing the majority of the data
    .range(['yellow', 'red']); 

    // Iterate over the features array and process each earthquake
    features.forEach(function(feature) {
        // Extract the necessary information from each earthquake feature
        var magnitude = feature.properties.mag;
        var coordinates = feature.geometry.coordinates;
        var depth = coordinates[2];

        // Calculate marker size and color based on magnitude and depth
        var marker = L.circleMarker([coordinates[1], coordinates[0]], {
        radius: magnitudeScale(magnitude),
        fillColor: depthScale(depth).toString(),
        color: 'white',
        weight: 0.2,
        });

        // Convert ISO 8601 time to a human-readable format
        var time = new Date(feature.properties.time).toLocaleString();

        // Bind a popup to the marker with additional earthquake information
        marker.bindPopup(`
            <h3>Earthquake Information</h3>
            <ul>
                <li><strong>Magnitude:</strong> ${feature.properties.mag}</li>
                <li><strong>Location:</strong> ${feature.properties.place}</li>
                <li><strong>Time:</strong> ${time}</li>
                ${feature.geometry.coordinates[2] ? `<li><strong>Depth:</strong> ${feature.geometry.coordinates[2]} km</li>` : ''}
                ${feature.properties.felt ? `<li><strong>Felt Reports:</strong> ${feature.properties.felt}</li>` : ''}
                ${feature.properties.alert ? `<li><strong>Alert Level:</strong> ${feature.properties.alert}</li>` : ''}
            </ul>
            <a href="${feature.properties.url}" target="_blank">More Information</a>
            `);

        // Add the marker to the map
        marker.addTo(map);


        
        });

// Create the legend
var legend = L.control({ position: 'bottomright' });
legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info legend'),
        depth = [0, 10, 30, 50, 70, 90],
        labels = [];

    // Add the "Depth" title directly within the JavaScript
    div.innerHTML = '<div class="legend-title">Depth</div>';

    // Loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < depth.length; i++) {
        div.innerHTML +=
            '<i style="background:' + depthScale(depth[i] + 1) + '"></i> ' +
            depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);


// Create the magnitude legend
var magnitudeLegend = L.control({ position: 'bottomleft' });
magnitudeLegend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info magnitude-legend'),
        magnitudes = [1, 5], // Modify these values based on your data
        labels = [];

    // Add the "Magnitude" title directly within the JavaScript
    div.innerHTML = '<div class="legend-title">Magnitude</div>';

    // Loop through our magnitude intervals and generate a label with a circle for each interval
    for (var i = 0; i < magnitudes.length; i++) {
        var radius = magnitudeScale(magnitudes[i]); // Use the magnitudeScale to calculate the circle radius

        div.innerHTML +=
            '<div class="legend-circle" style="width: ' + (2 * radius) + 'px; height: ' + (2 * radius) + 'px; border-radius: 50%; border: 2px solid #000;">' +
            '<span class="legend-label">' + magnitudes[i] + '</span>' + // Add magnitude number inside the circle
            '</div> ';
    }

    return div;
};

magnitudeLegend.addTo(map);








  });




// Create the legend:

// Design and implement the legend using HTML and CSS.
// Determine the appropriate range values for magnitude and depth.
// Use the legend to provide visual cues for the marker size and color corresponding to the magnitude and depth of the earthquakes.