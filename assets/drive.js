//User input function

var destination = localStorage.getItem('destination');

function inputSubmit(event) {
    event.preventDefault();
    const startInput = document.getElementById('startPoint').value;
    const endInput = document.getElementById('endPoint').value;
    console.log(startInput, endInput);
    //store in local storage
    localStorage.setItem(startInput, endInput);
}

//function to get end point 
function destinationINFO(destinationCity, startingLat, startingLon) {
    fetch(`https://geocode.search.hereapi.com/v1/geocode?apikey=vZbOvGRRqgLAPG9Cz9CDrJ-4tIAW5-9L-kyYJGKX2MY&q=${destinationCity}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            var finalLatitude = data.items[0].position.lat;
            //console.log(lat);

            var finalLongitude = data.items[0].position.lng;
            //console.log(lon);
            calculateRouteFromAtoB(platform, startingLat, startingLon, finalLatitude, finalLongitude)
        })
        .catch(error => {
            console.error('Error:', error);
        })

}
//function to get starting point 
function startingINFO(startingCity, finalCity) {
    fetch(`https://geocode.search.hereapi.com/v1/geocode?apikey=vZbOvGRRqgLAPG9Cz9CDrJ-4tIAW5-9L-kyYJGKX2MY&q=${startingCity}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            var latitude = data.items[0].position.lat;
            //console.log(lat);

            var longitude = data.items[0].position.lng;
            //console.log(lon);
            destinationINFO(finalCity, latitude, longitude)
        })
        .catch(error => {
            console.error('Error:', error);
        })

}
//funtion to pull routing service from api and run parameters 
function calculateRouteFromAtoB(platform, startingLat, startingLon, finalLat, finalLon) {

    var router = platform.getRoutingService(null, 8);
    routeRequestParams = {

        routingMode: 'fast',
        transportMode: 'car',
        origin: `${startingLat},${startingLon}`, //Start point
        destination: `${finalLat},${finalLon}`, // End point
        return: 'polyline,turnbyturnactions,actions,instructions,travelSummary',
    };
    router.calculateRoute(
        routeRequestParams,
        onSuccess,
        onError
    );
}
//function ran once data is returned successful 
function onSuccess(data) {
    console.log(data);
    var route = data.routes[0];
    //run seperate functions once data is available 
    addRouteShapeToMap(route);
    addManueversToMap(route);
    addWaypointsToPanel(route);
    addManueversToPanel(route);
    addSummaryToPanel(route);
}

//This function will be called if a communication error occurs during the JSON-P

function onError(error) {
    alert('Can\'t reach the remote server');
}

// the map + panel
var mapContainer = document.getElementById('map');
var routeInstructionsContainer = document.getElementById('panel');

//communication with the platform
var platform = new H.service.Platform({
    apikey: 'vZbOvGRRqgLAPG9Cz9CDrJ-4tIAW5-9L-kyYJGKX2MY'
});

var defaultLayers = platform.createDefaultLayers();
// initialize map
var map = new H.Map(mapContainer,
    defaultLayers.vector.normal.map, {
    center: { lat: '', lng: '' },
    zoom: 1,
    pixelRatio: window.devicePixelRatio || 1
});
//Resize listener to make sure that the map occupies the whole container
window.addEventListener('resize', () => map.getViewPort().resize());
//Map behaviour
var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
//Default UI components
var ui = H.ui.UI.createDefault(map, defaultLayers);
// Hold a reference to any infobubble opened
var bubble;
//info bubble
function openBubble(position, text) {
    if (!bubble) {
        bubble = new H.ui.InfoBubble(
            position,
            // The FO property holds the province name.
            { content: text });
        ui.addBubble(bubble);
    } else {
        bubble.setPosition(position);
        bubble.setContent(text);
        bubble.open();
    }
}
//route polyline

function addRouteShapeToMap(route) {
    mapContainer.innerHTML = "";
    map = new H.Map(mapContainer,
        defaultLayers.vector.normal.map, {
        center: { lat: '', lng: '' },
        zoom: 1,
        pixelRatio: window.devicePixelRatio || 1
    });
    route.sections.forEach((section) => {
        // decode LineString from the flexible polyline
        let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);
        // Create a polyline to display the route:
        let polyline = new H.map.Polyline(linestring, {
            style: {
                lineWidth: 4,
                strokeColor: 'rgba(0, 128, 255, 0.7)'
            }
        });
        // Adds polyline to the map
        map.addObject(polyline);
        // Adds zoom to its bounding rectangle
        map.getViewModel().setLookAtData({
            bounds: polyline.getBoundingBox()

        });

    });
}
//Map markers
function addManueversToMap(route) {
    var svgMarkup = '<svg width="18" height="18" ' +
        'xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="8" cy="8" r="8" ' +
        'fill="#1b468d" stroke="white" stroke-width="1" />' +
        '</svg>',
        dotIcon = new H.map.Icon(svgMarkup, { anchor: { x: 8, y: 8 } }),
        group = new H.map.Group(),
        i,
        j;
    route.sections.forEach((section) => {
        let poly =
            H.geo.LineString.fromFlexiblePolyline(section.polyline).getLatLngAltArray();
        let actions = section.actions;
        console.log(actions);

        // Add a marker for each maneuver
        for (i = 0; i < actions.length; i += 1) {
            let action = actions[i];
            var marker = new H.map.Marker({
                lat: poly[action.offset * 3],
                lng: poly[action.offset * 3 + 1]
            },
                { icon: dotIcon });
            marker.instruction = action.instruction;
            group.addObject(marker);
        }
        group.addEventListener('tap', function (evt) {
            map.setCenter(evt.target.getGeometry());
            openBubble(evt.target.getGeometry(), evt.target.instruction);
        }, false);
        // Add the maneuvers group to the map
        map.addObject(group);
    });
}
//Adds turn by turn instructions to bottom of map
function addWaypointsToPanel(route) {
    var nodeH3 = document.createElement('h3'),
        labels = [];

    route.sections.forEach((section) => {
        labels.push(
            section.turnByTurnActions[0].nextRoad.name[0].value)
        labels.push(
            section.turnByTurnActions[section.turnByTurnActions.length - 1].currentRoad.name[0].value)
    });

    nodeH3.textContent = labels.join(' - ');
    routeInstructionsContainer.innerHTML = '';
    routeInstructionsContainer.appendChild(nodeH3);
}
//Adds summary of trip to bottom of map
function addSummaryToPanel(route) {
    let duration = 0,
        distance = 0;

    route.sections.forEach((section) => {
        distance += section.travelSummary.length;
        duration += section.travelSummary.duration;
    });
    // Shows time and distance on Info Panel
    var summaryDiv = document.createElement('div'),
        content = '<b>Total distance</b>: ' + distance + 'm. <br />' +
            '<b>Travel Time</b>: ' + toMMSS(duration) + ' (in current traffic)';

    summaryDiv.style.fontSize = 'small';
    summaryDiv.style.marginLeft = '5%';
    summaryDiv.style.marginRight = '5%';
    summaryDiv.innerHTML = content;
    routeInstructionsContainer.appendChild(summaryDiv);
}

function addManueversToPanel(route) {
    var nodeOL = document.createElement('ol');

    nodeOL.style.fontSize = 'small';
    nodeOL.style.marginLeft = '5%';
    nodeOL.style.marginRight = '5%';
    nodeOL.className = 'directions';

    route.sections.forEach((section) => {
        section.actions.forEach((action, idx) => {
            var li = document.createElement('li'),
                spanArrow = document.createElement('span'),
                spanInstruction = document.createElement('span');

            spanArrow.className = 'arrow ' + (action.direction || '') + action.action;
            spanInstruction.innerHTML = section.actions[idx].instruction;
            li.appendChild(spanArrow);
            li.appendChild(spanInstruction);

            nodeOL.appendChild(li);
        });
    });

    routeInstructionsContainer.appendChild(nodeOL);
}

function toMMSS(duration) {
    return Math.floor(duration / 60) + ' minutes ' + (duration % 60) + ' seconds.';
}

$('#submitButton').on('click', function() {

    var startingPoint = $('#startPoint').val();
    startingINFO(startingPoint, destination);
})
