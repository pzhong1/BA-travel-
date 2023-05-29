function calculateRouteFromAtoB(platform) {
    var router = platform.getRoutingService(null, 8),
        routeRequestParams = {

            routingMode: 'fast',
            transportMode: 'car',
            origin: '29.424349,-98.491142', //Start point
            destination: '32.779167,-96.808891', // End point
            return: 'polyline,turnByTurnActions,actions,instructions,travelSummary'
        };
    router.calculateRoute(
        routeRequestParams,
        onSuccess,
        onError
    );
}

function onSuccess(result) {
    var route = result.routes[0];
    //styling the route
    addRouteShapeToMap(route);
    addManueversToMap(route);
}

//This function will be called if a communication error occurs during the JSON-P

function onError(error) {
    alert('Can\'t reach the remote server');
}

// the map + panel
var mapContainer = document.getElementById('map'),
    routeInstructionsContainer = document.getElementById('panel');
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
//pannel trip summary
function addSummaryToPanel(route) {
    let duration = 0,
        distance = 0;
    route.sections.forEach((section) => {
        distance += section.travelSummary.length;
        duration += section.travelSummary.duration;
    });
    var summaryDiv = document.createElement('div'),
        content = '<b>Total distance</b>: ' + distance + 'm. <br />' +
            '<b>Travel Time</b>: ' + toMMSS(duration) + ' (in current traffic)';
    summaryDiv.style.fontSize = 'small';
    summaryDiv.style.marginLeft = '5%';
    summaryDiv.style.marginRight = '5%';
    summaryDiv.innerHTML = content;

}
//map marker points
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
    //routeInstructionsContainer.appendChild(nodeOL);
}
function toMMSS(duration) {
    return Math.floor(duration / 60) + ' minutes ' + (duration % 60) + ' seconds.';
}
calculateRouteFromAtoB(platform);