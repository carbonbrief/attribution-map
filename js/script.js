if (!mapboxgl.supported()) {
    alert('Your browser does not support Mapbox GL');
} else {
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
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

    geojson.features.forEach(function(feature) {

        let type = feature.properties['type'];
        let symbol = icons[type];

        // create class names to use as tags for filtering
        let typeTag = typeTags[type];
        let year = feature.properties['year'];
        let impact = feature.properties['impact'];
        let impactTag = impactTags[impact];

        // create a HTML element for each feature
        var el = document.createElement('div');
        el.className = 'marker ' + typeTag + " " + impactTag + " " + year;

        if (typeTag == "drought" || typeTag =="coral") {
            el.innerHTML = "<img class='marker-icon' src='img/" + typeTag + ".svg'></img>";
        } else {
            el.innerHTML = '<i class="' + symbol + '"></i>';
        }

        // make a marker for each feature and add to the map
        new mapboxgl.Marker(el)
        .setLngLat(feature.geometry.coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
        .setHTML('<h3>' + type + '</h3><p>' + feature.properties['summary'] + '</p>'))
        .addTo(map);

    });

    // try filter checkbox method instead

    // first change checkbox when list item is clicked
    $(".list-group-item").click(function(e) {

        // CHANGE CLICK CHECKBOX
        let $tc = $(this).find('input:checkbox');
        // checks what the current status of the checkbox is
        let tv = $tc.attr('checked');
        console.log(tv);
        // applies the opposite
        $tc.attr('checked', !tv);

        // UPDATE STYLE
        // tv is the previous value
        if (tv == "checked") {
            $(this).css("opacity", 0.3);
        } else {
            $(this).css("opacity", 1);
        }

        // FILTER MAP
        let checkboxes = ["human", "natural", "unsure", "cloud", "cold", "coral", "drought", "eco", "nino", "heat", "ocean", "flood", "storm", "sun", "fire"];
        
        let selected = [];
        $('input:checked').each(function() {
            selected.push($(this).attr('name'));
        });

        // create array of checkboxes that aren't selected
        let unselected = checkboxes.filter(i => selected.indexOf(i) === -1);

        // make all map markers visible
        $(".marker").css("visibility", "visible");
        
        // hide each of the unselected classes in turn
        for (i = 0; i < unselected.length; i++) {
            $("." + unselected[i]).css("visibility", "hidden");
        }

        console.log(selected);
        console.log(unselected);
    });

    let humanValue = "all";
    let impactValue = "all";
    let yearValue = "all";

    function filterMarkers () {

        if (humanValue == "all" || impactValue == "all" || yearValue == "all") {
            // write code here
            if (humanValue == "all" && impactValue !== "all" && yearValue == "all") {
                $(".marker").css("visibility", "hidden");
                $("." + impactValue).css("visibility", "visible");
            } else if (humanValue !== "all" && impactValue == "all" && yearValue == "all") {
                $(".marker").css("visibility", "hidden");
                $("." + humanValue).css("visibility", "visible");
            } else if (humanValue == "all" && impactValue !== "all" && yearValue !== "all") {
                $(".marker").css("visibility", "hidden");
                $("." + impactValue + "." + yearValue).css("visibility", "visible");
            } else if (humanValue !== "all" && impactValue == "all" && yearValue !== "all") {
                $(".marker").css("visibility", "hidden");
                $("." + humanValue + "." + yearValue).css("visibility", "visible");
            } else if (humanValue !== "all" && impactValue !== "all" && yearValue == "all") {
                $(".marker").css("visibility", "hidden");
                $("." + humanValue + "." + impactValue).css("visibility", "visible");
            } else if (humanValue == "all" && impactValue == "all" && yearValue !== "all") {
                $(".marker").css("visibility", "hidden");
                $("." + yearValue).css("visibility", "visible");
            } else {
                // make all markers visible if all filters are set to 'all'
                $(".marker").css("visibility", "visible");
            }

        } else {
            // hide all markers and then make those with the selected tags visible
            $(".marker").css("visibility", "hidden");
            $("." + humanValue + "." + impactValue + "." + yearValue).css("visibility", "visible");
        }

    }

    document.getElementById('selectorHuman').addEventListener('change', function(e) {
        humanValue = e.target.value;
        console.log(humanValue);
        filterMarkers();
    });
    
    document.getElementById('selectorImpact').addEventListener('change', function(e) {
        impactValue = e.target.value;
        console.log(impactValue);
        filterMarkers();
    });

    document.getElementById('selectorYear').addEventListener('change', function(e) {
        yearValue = e.target.value;
        console.log(yearValue);
        filterMarkers();
    });

});