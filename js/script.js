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

var popupIcon = {
    "Heat": "<i class='fas fa-thermometer-full'></i>",
    "Sunshine": "<i class='fas fa-sun'></i>",
    "Drought": "<img class='popup-icon' src='img/drought-dark.svg'></img>",
    "Rain & flooding": "<i class='fas fa-tint'></i>",
    "Cold, snow & ice": "<i class='far fa-snowflake'></i>",
    "Oceans": "<i class='fas fa-ship'></i>",
    "Storm": "<i class='fas fa-bolt'></i>",
    "Wildfire": "<i class='fas fa-fire-alt'></i>",
    "Atmosphere": "<i class='fas fa-cloud'></i>",
    "Ecosystem function": "<i class='fas fa-seedling'></i>",
    "Coral bleaching": "<img class='popup-icon' src='img/coral-dark.svg'></img>",
    "El Nino": "<i class='fas fa-globe-asia'></i>"
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
        .setPopup(new mapboxgl.Popup({ offset: 25, closeButton: false }) // add popups
        .setHTML('<h3>' + feature.properties['location'] + '</h3><p>'
        + popupIcon[type] + " "  + type + '</p><p class="summary">' 
        + feature.properties['summary'] + '</p><p><a href="'
        + feature.properties['url'] + '" target="_blank">' + feature.properties['citation1'] + "</a> " + feature.properties['citation2'] + '</p>'))
        .addTo(map);

    });

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
            $(this).addClass("selected");
        } else {
            $(this).removeClass("selected");
        }

        filterMap()

    });

    let yearValue = "all";

    document.getElementById('selectorYear').addEventListener('change', function(e) {
        yearValue = e.target.value;
        console.log(yearValue);
        filterMap();
    });

    function filterMap () {

        // GATHER DATA ON CHECKBOXES
        let checkboxes = ["human", "natural", "unsure", "cloud", "cold", "coral", "drought", "eco", "nino", "heat", "ocean", "flood", "storm", "sun", "fire"];

        let selected = [];
        $('input:checked').each(function() {
            selected.push($(this).attr('name'));
        });

        // create array of checkboxes that aren't selected
        let unselected = checkboxes.filter(i => selected.indexOf(i) === -1);

        // make all map markers visible
        $(".marker").css("visibility", "visible");

        let years = ["2018", "2017", "2016", "2015", "2014", "2013", "2012", "2011"];
        
        // hide each of the unselected classes in turn

        if (yearValue == "all") {
            for (i = 0; i < unselected.length; i++) {
                $("." + unselected[i]).css("visibility", "hidden");
            }
        } else {
            // filter both
            for (i = 0; i < years.length; i++) {
                if (yearValue !== years[i]) {
                    $("." + years[i]).css("visibility", "hidden");
                }
            }

            for (i = 0; i < unselected.length; i++) {
                $("." + unselected[i]).css("visibility", "hidden");
            }

        }

    }

});