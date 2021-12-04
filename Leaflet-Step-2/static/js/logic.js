// Create the tile layer that will be the background of our map
var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "satellite-streets-v11",
  accessToken: API_KEY
});

var greyscalemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "light-v10",
  accessToken: API_KEY
});

var outdoorsmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "outdoors-v11",
  accessToken: API_KEY
});



// Create a layergroup for earthquake
var earthquakeMap = L.layerGroup();
var tectonicPlatesMap = L.layerGroup();

// Create an overlay object
var overlayMaps = {
    "Fault Lines": tectonicPlatesMap,
    "Earthquakes": earthquakeMap
  };

// Create a baseMaps object to choose background map styles
var baseMaps = {
    "Satellite": satellitemap,
    "Greyscale": greyscalemap,
    "Outdoors": outdoorsmap
};

// Create the map with our layers
var map = L.map("map", {
    center: [37.09, -112.71],
    zoom: 5,
    layers: [satellitemap, earthquakeMap, tectonicPlatesMap]
});


// Pass our map layers into our layer control
// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(map);

// Perform an API call to the USGS Earthquake endpoint for past 7 days all earthquake information
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function(earthquake) {
    // Use a function to call the USGS Earthquake Feature .
    console.log(earthquake.features);
    // Create a function to get marker size based on maginitude
    function markerSize(mag) {
      return mag * 4;
    };
    // Create a function to get marker color based on maginitude
    function markerColor(mag) {
      switch(true) {
        case mag > 5:
          return "red";
        case mag > 4:
          return "orangered";
        case mag > 3:
          return "orange";
        case mag > 2:
          return "gold";
        case mag > 1:
          return "yellowgreen";
        default:
          return "green";
      }
    };

    // Add circle marker layer onto the map
    L.geoJson(earthquake, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: markerSize(feature.properties.mag),
          fillColor: markerColor(feature.properties.mag),
        //   color: "#000",
        //   weight: 0.5,
          opacity: 0,
          fillOpacity: 1
        });
      },
      onEachFeature: function (feature, layer) {
        layer.bindPopup("ID: " + feature.id + "<br>Place: " + feature.properties.place + "<br>Maginitude: "+ feature.properties.mag);
      }
    }).addTo(earthquakeMap);

    // Create a legend to display information about our map
    var info = L.control({
      position: "bottomright"
    });
    // When the layer control is added, insert a div with the class of "legend"
    info.onAdd = function() {
      var div = L.DomUtil.create("div", "legend");
      var maginitude = [0, 1, 2, 3, 4, 5];
      // Create a loop for legend for different magnitude
      for (var i = 0; i < maginitude.length; i++) {
        div.innerHTML += 
          "<i style='background: " + markerColor(maginitude[i]+0.5) + "'></i>" +
          maginitude[i] + (maginitude[i+1] ? "&ndash;" + maginitude[i+1] + "<br>" : "+");
      }
      return div;
    };
    // Add the info legend to the map
    info.addTo(map);
    earthquakeMap.addTo(map);
});

d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function(tectonicplate) {
    // Add tectonic plate layer onto the map
    L.geoJson(tectonicplate, {
        color: "orange",
        weight: 3
    }).addTo(tectonicPlatesMap);
    tectonicPlatesMap.addTo(map);
});