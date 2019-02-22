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

let screenWidth = window.innerWidth;

let boundsMobile = [
    [ -100, -70],[120, 85]
]

let boundsLaptop = [
    [ -160, -70],[160, 90]
]

let boundsDesktop = [
    [ -188, -75],[90, 86]
]

let boundsRetina = [
    [ -165, -65],[91, 78]
]

function getBounds () {
    if (screenWidth > 1400) {
        return boundsRetina
    }
    else if (screenWidth > 1024 && screenWidth < 1400) {
        return boundsDesktop
    } 
    else if (1024 > screenWidth && screenWidth > 850) {
        return boundsLaptop
    } else {
        return boundsMobile
    }
}

var bounds = getBounds();

// resize map for the screen
map.fitBounds(bounds, {padding: 10});

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
    "El Nino": "fas fa-globe-asia",
    "River flow": "fas fa-water"
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
    "El Nino": "nino",
    "River flow": "river"
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
    "El Nino": "<i class='fas fa-globe-asia'></i>",
    "River flow": "<i class='fas fa-water'></i>"
}

var colors = {
    "human": "#f47676",
    "natural": "#62b8dd",
    "unsure": "#999999"
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

        // replave hash marks with smart quotes
        let summary = feature.properties['summary'];
        summary = summary.substr(1, summary.length-2);
        summary = "\u201c" + summary + "\u201d";

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
        .setPopup(new mapboxgl.Popup({ offset: 10, closeButton: false }) // add popups
        .setHTML('<h3 style="padding-bottom: 4px; border-bottom: 2px solid ' + colors[impactTag] + ';">' + feature.properties['location'] + '</h3><ul class="list-group list-tooltip"><li>'
        + popupIcon[type] + " "  + type + '</li>' 
        + '<li><div class="colour-key" style="background-color: ' + colors[impactTag]+ '; margin-right: 5px;"></div>' + impact + '</li></ul><p class="summary">' 
        + summary + '</p><p class="citation"><a href="'
        + feature.properties['url'] + '" target="_blank">' + feature.properties['citation1'] + "</a><span class='citation2'> " + feature.properties['citation2'] + '</span></p>'))
        .addTo(map);

    });

    $(".list-group-item").click(function(e) {

        // CHANGE CLICK CHECKBOX
        let $tc = $(this).find('input:checkbox');
        // checks what the current status of the checkbox is
        let tv = $tc.attr('checked');
        // applies the opposite
        $tc.attr('checked', !tv);

        // UPDATE STYLE
        // tv is the previous value
        if (tv == "checked") {
            $(this).addClass("unselected");
        } else {
            $(this).removeClass("unselected");
        }

        filterMap();

    });

    $("#select").click(function(e) {

        $(".impact input:checkbox").each(function() {
            if(this.checked) {
                // do nothing
            } else {
                $(this).attr('checked', 'checked');
                // unselected = greyed out
                $(this).parent('li').removeClass('unselected');
            }
        });

        filterMap();

    });

    $("#deselect").click(function(e) {

        $(".impact input:checkbox").each(function() {
            if(this.checked) {
                $(this).attr('checked', false);
                // unselected = greyed out
                $(this).parent('li').addClass('unselected');
            } else {
                // do nothing
            }
        });

        filterMap();

    });

    let yearValue = "all";

    document.getElementById('selectorYear').addEventListener('change', function(e) {
        yearValue = e.target.value;
        filterMap();
    });

    function filterMap () {

        // GATHER DATA ON CHECKBOXES
        let checkboxes = ["human", "natural", "unsure", "cloud", "cold", "coral", "drought", "eco", "nino", "heat", "ocean", "flood", "river", "storm", "sun", "fire"];

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

        // UPDATE STUDIES

        let markers = [];

        $(".marker").each(function() {
            if (window.getComputedStyle(this).visibility === "visible") {
                markers.push($(this));
            }
        });

        $("#studies").text(markers.length);

    }

});

// reset dropdown on window reload

$(document).ready(function () {
    $("select").each(function () {
        $(this).val($(this).find('option[selected]').val());
    });
})

// TOGGLE BUTTON

$(".toggle").click(function() {
    $("#console").toggleClass('console-close console-open');
    $('.arrow-right-hidden').toggleClass('arrow-right');
    $('.arrow-left').toggleClass('arrow-left-hidden');
});