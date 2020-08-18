
require(["esri/Map", "esri/views/MapView", 'esri/layers/MapImageLayer'], function (Map, MapView, MapImageLayer) {
    var assemblyDistricts = new MapImageLayer({
        url: "https://gispublic.waterboards.ca.gov/portalserver/rest/services/GAMA/CA_Assembly_Districts/MapServer",
        sublayers: [{
            id: 0,
            popupTemplate:{
                title:'{DISTRICT}',
                content:'{POP}'
            }
        }],
        opacity: 0.6,
        title: "Assembly Districts",
    });

    var map = new Map({
        basemap: "satellite",
        layers: [assemblyDistricts]
    });

    var view = new MapView({
        container: "webmap",
        map: map,
        center: [-118, 34],
        zoom: 11
    });
});