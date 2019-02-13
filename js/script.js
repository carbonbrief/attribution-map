if (!mapboxgl.supported()) {
    alert('Your browser does not support Mapbox GL');
} else {
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        center: [8, 20],
        zoom: 1.5
    });
}

var icons = {
    "Heat": "fas fa-thermometer-full",
    "Sunshine": "fas fa-sun",
    "Drought": "fal fa-raindrops",
    "Rain & flooding": "fas fa-tint",
    "Cold, snow & ice": "far fa-snowflake",
    "Oceans": "fas fa-ship",
    "Storm": "fas fa-bolt",
    "Wildfire": "fas fa-fire-alt",
    "Atmosphere": "fas fa-cloud",
    "Ecosystem function": "fas fa-seedling",
    "Coral bleaching": "fas fa-fish",
    "El Nino": "fas fa-globe-asia"
};

var typeTags = {
    "Heat": "heat",
    "Sunshine": "sun",
    "Drought": "drought",
    "Rain & flooding": "flood",
    "Cold, snow & ice": "cold",
    "Oceans": "ocean",
    "Storm": "storm",
    "Wildfire": "fire",
    "Atmosphere": "cloud",
    "Ecosystem function": "eco",
    "Coral bleaching": "coral",
    "El Nino": "nino"
};

var impactTags = {
    "Insufficient data/inconclusive": "unsure",
    "More severe or more likely to occur": "human",
    "Decrease, less severe or less likely to occur": "human",
    "No discernible human influence": "natural"
}

map.addControl(new mapboxgl.NavigationControl());

map.on('load', function() {

    map.addSource("geojson", {
        "type": "geojson",
        "data": geojson
    });

    // map.addLayer({
    //     "id": "studies",
    //     "type": "symbol",
    //     "source": "geojson"
    // });

    geojson.features.forEach(function(feature) {

        let type = feature.properties['type'];
        console.log(type);
        let symbol = icons[type];
        console.log(symbol);

        // create class names to use as tags for filtering
        let typeTag = typeTags[type];
        let year = feature.properties['year'];
        let impact = feature.properties['impact'];
        let impactTag = impactTags[impact];

        // create a HTML element for each feature
        var el = document.createElement('div');
        el.className = 'marker ' + typeTag + " " + impactTag + " " + year;
        el.innerHTML = '<i class="' + symbol + '"></i>';

        // make a marker for each feature and add to the map
        new mapboxgl.Marker(el)
        .setLngLat(feature.geometry.coordinates)
        .addTo(map);

        

    });

});