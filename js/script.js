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

map.addControl(new mapboxgl.NavigationControl());

map.on('load', function() {

    map.addSource("studies", {
        "type": "geojson",
        "data": geojson
    });

    geojson.features.forEach(function(feature) {

        // create a HTML element for each feature
        var el = document.createElement('div');
        el.className = 'marker';

        // make a marker for each feature and add to the map
        new mapboxgl.Marker(el)
        .setLngLat(feature.geometry.coordinates)
        .addTo(map);

    });

});