var map = L.map("map", {
  //center: [36.783912, -119.402656], //California
  //center: [40.725509, -73.988958],
  center: [37.8, -96],
  zoom: 4,
  zoomControl: false
});

var zoomlevel = map.getZoom();
console.log(zoomlevel);

var OSM_BW = L.tileLayer(
  "http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png",
  {
    maxZoom: 18,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }
).addTo(map);

var legend = L.control({
  position: "bottomright"
});

legend.onAdd = function (map) {
  var div = L.DomUtil.create("div", "info legend"),
    grades = [0, 1, 10, 20, 50, 100, 200, 500, 1000],
    labels = [];

  for (var i = 0; i < grades.length; i++) {
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
  }
  return div;
};

legend.addTo(map);


function getColor(d) {
  return d > 1000 ? '#b10026' :
    d > 500 ? '#e31a1c' :
      d > 200 ? '#fc4e2a' :
        d > 100 ? '#fd8d3c' :
          d > 50 ? '#feb24c' :
            d > 20 ? '#fed976' :
              d > 10 ? '#ffeda0' :
                d > 0 ? '#ffffcc' :
                  '#ffffff';
}

function style1(feature) {
  return {
    weight: 1,
    opacity: 0.3,
    color: "gray",
    dashArray: "3",
    fillOpacity: 0.8,
    fillColor: getColor(feature.properties.confirmed)
  };
}

function style2(feature) {
  return {
    weight: 1,
    opacity: 0.3,
    color: "gray",
    dashArray: "3",
    fillOpacity: 0.8,
    fillColor: getColor(feature.properties.deceased)
  };
}

function style3(feature) {
  return {
    weight: 1,
    opacity: 0.3,
    color: "gray",
    dashArray: "3",
    fillOpacity: 0.8,
    fillColor: getColor(feature.properties.recovered)
  };
}

function style4(feature) {
  return {
    weight: 1,
    opacity: 0.3,
    color: "gray",
    dashArray: "3",
    fillOpacity: 1,
    fillColor: getColor(feature.properties.confirmed)
  };
}

function style5(feature) {
  return {
    weight: 1,
    opacity: 0.3,
    color: "gray",
    dashArray: "3",
    fillOpacity: 1,
    fillColor: getColor(feature.properties.deceased)
  };
}

function style6(feature) {
  return {
    weight: 1,
    opacity: 0.3,
    color: "gray",
    dashArray: "3",
    fillOpacity: 1,
    fillColor: getColor(feature.properties.recovered)
  };
}


function onEachFeature(feature, layer) {
  //addEventListeners
  layer.bindPopup(
    "<h3>" +
    feature.properties.admin +
    "</h3><br>" +
    "Time: " +
    c_time +
    "<br>" +
    "Confirmed: " +
    feature.properties.confirmed +
    "<br>" +
    "Deaths: " +
    feature.properties.deceased +
    "<br>" +
    "Recovered: " +
    feature.properties.recovered +
    "<br></p>"
  );
}

function onEachFeature2(feature, layer) {
  //addEventListeners
  layer.bindPopup(
    "<h3>" +
    feature.properties.name +
    "</h3><br>" +
    "Time: " +
    c_time +
    "<br>" +
    "Confirmed: " +
    feature.properties.confirmed +
    "<br>" +
    "Deaths: " +
    feature.properties.deceased +
    "<br>" +
    "Recovered: " +
    feature.properties.recovered +
    "<br></p>"
  );
}

var timeline1;
var timeline2;
var timeline3;
var timeline4;
var timeline5;
var timeline6;
var time;
var time_parsed;
var date;
var t_confirmed = 729
var t_deceased = 7
var t_recovered = 245

var c_date = new Date();
var m = c_date.getMonth() + 1;
var zone = c_date.toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ')[2]
var userAgent = navigator.userAgent;
var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1;
var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;
if (isIE || isIE11) {
  var c_time = c_date.getFullYear() + "-" + m + "-" + c_date.getDate() + " " + c_date.getHours() + ":" + (Array(2).join(0) + c_date.getMinutes()).slice(-2)
} else {
  var c_time = c_date.getFullYear() + "-" + m + "-" + c_date.getDate() + " " + c_date.getHours() + ":" + (Array(2).join(0) + c_date.getMinutes()).slice(-2) + ' ' + zone;
}

// var query =
//   "https://xiaoxuan4889.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM jhu_3_10_admin0_1";
var query =
  "http://54.227.126.3:8082/geoserver/COVID19/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=COVID19%3Acovid19_country&outputFormat=application%2Fjson";

// get data and create objects that are added to a timeline object
$.ajaxSettings.async = false;
$.getJSON(query, function (cartodbdata) {
  cartodbdata.features.forEach(function (hom) {
    hom.properties.time = c_time;
    time = hom.properties.time;
    time_parsed = time.match(/\d{4}\-\d{2}\-\d{2}/);
    date = new Date(time_parsed);
    hom.properties.start = date.getTime();
    hom.properties.end = hom.properties.time + 500400000;
    // 86400000 ms corresponds to one day!

    t_confirmed += hom.properties.confirmed
    t_deceased += hom.properties.deceased
    t_recovered += hom.properties.recovered
  });
  // format timestamps properly and give them a duration
  var getInterval = function (hom) {
    // Some manipulation is needed to make the timestamps fitted
    // the format of timeline - see video
    var time = hom.properties.time; //debugger;
    var time_parsed = time.match(/\d{4}\-\d{2}\-\d{2}/);
    var date = new Date(time_parsed);
    return {
      start: date.getTime(),
      end: date.getTime() + 500400000 //ms ~ 1week
    };
  };
  // some formatting for the control (play buttons and date display)
  var timelineControl = L.timelineSliderControl({
    formatOutput: function (date) {
      return moment(date).format("YYYY-MM-DD HH:MM:SS");
    }
  });
  // create the timeline, which is similar to L.GeoJSON(https://github.com/skeate/Leaflet.timeline)
  timeline1 = L.timeline(cartodbdata, {
    style: style1, //style neighborhood polygons
    getInterval: getInterval,
    onEachFeature: onEachFeature
  });
  timeline2 = L.timeline(cartodbdata, {
    style: style2, //style neighborhood polygons
    getInterval: getInterval,
    onEachFeature: onEachFeature
  });
  timeline3 = L.timeline(cartodbdata, {
    style: style3, //style neighborhood polygons
    getInterval: getInterval,
    onEachFeature: onEachFeature
  });
  timelineControl.addTo(map);
  timelineControl.addTimelines(timeline1);
  timelineControl.addTimelines(timeline2);
  timelineControl.addTimelines(timeline3);
  timeline1.addTo(map);

  //Dectect radio buttoms status dynamically
  $("input[type=radio][name=viz-toggle]").change(function () {
    if (this.value == "1") {
      try {
        map.removeLayer(timeline2);
        map.removeLayer(timeline3);
        timeline1.addTo(map);
        if (zoomlevel <= 3) {
          map.removeLayer(timeline4);
        }
      } catch (err) { console.log(err.message); }
    } else if (this.value == "2") {
      try {
        map.removeLayer(timeline1);
        map.removeLayer(timeline3);
        timeline2.addTo(map);
        if (zoomlevel <= 3) {
          map.removeLayer(timeline5);
        }
      } catch (err) { console.log(err.message); }

    } else if (this.value == "3") {
      try {
        map.removeLayer(timeline1);
        map.removeLayer(timeline2);
        timeline3.addTo(map);
        if (zoomlevel <= 3) {
          map.removeLayer(timeline6);
        }
      } catch (err) { console.log(err.message); }
    }
  });

  map.on("zoomend", function () {
    zoomlevel = map.getZoom();
    console.log(zoomlevel);
    if (zoomlevel <= 1) {
      var radio1 = document.getElementById("ConfirmedLayers").checked;
      var radio2 = document.getElementById("DeathsLayers").checked;
      var radio3 = document.getElementById("RecoveredLayers").checked;
      try {
        map.removeLayer(timeline1);
        map.removeLayer(timeline2);
        map.removeLayer(timeline3);
      } catch (err) { console.log(err.message); }
      if (radio1 == true) {
        timeline1.addTo(map);
      } else if (radio2 == true) {
        timeline2.addTo(map);
      } else if (radio3 == true) {
        timeline3.addTo(map);
      }
    }
  });
});

var info = L.control({
  position: "topleft"
});

info.onAdd = function (map) {
  this._div = L.DomUtil.create("div", "info");
  this._div.innerHTML = "<h3>Global Coronavirus Cases<br/>" +
    "<small class='text-muted'>" + c_time +
    "</small></h3><span style='font-size:16px; color:#3477eb'>Confirmed: " + t_confirmed +
    "</span><br><span style='font-size:16px; color:#eb4034'>Deaths: " + t_deceased +
    "</span><br><span style='font-size:16px; color:#00b81c'>Recovered: " + t_recovered + "</span>"
  return this._div;
};

info.addTo(map);

$(".leaflet-control-layers-toggle").hover(function () {
  $("#menu").css("display", "block");
  $(this).css("display", "none");
}, function () {

});
$("#menu").hover(function () {

}, function () {
  $(".leaflet-control-layers-toggle").css("display", "block");
  $(this).css("display", "none");
});
//var baseMaps = {
//    "Grayscale": grayscale,
//    "Streets": streets
//};
//var overlayMaps = {
//    "Confirmed": timeline1,
//    "Deaths": timeline2,
//    "Recovered": timeline3,
//};
//L.control.layers(baseMaps, overlayMaps).addTo(map);


// var query2 =
//   "https://xiaoxuan4889.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM covid19_states";
var query2 =
  "http://54.227.126.3:8082/geoserver/COVID19/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=COVID19%3Acovid19_states&outputFormat=application%2Fjson";

// get data and create objects that are added to a timeline object
$.getJSON(query2, function (cartodbdata) {
  // format timestamps properly and give them a duration
  var getInterval = function (hom) {
    // Some manipulation is needed to make the timestamps fitted
    // the format of timeline - see video
    hom.properties.time = c_time;
    var time = hom.properties.time; //debugger;
    var time_parsed = time.match(/\d{4}\-\d{2}\-\d{2}/);
    var date = new Date(time_parsed);
    return {
      start: date.getTime(),
      end: date.getTime() + 500400000 //ms ~ 1week
    };
  };
  // some formatting for the control (play buttons and date display)
  var timelineControl = L.timelineSliderControl({
    formatOutput: function (date) {
      return moment(date).format("YYYY-MM-DD HH:MM:SS");
    }
  });
  // create the timeline, which is similar to L.GeoJSON(https://github.com/skeate/Leaflet.timeline)
  timeline4 = L.timeline(cartodbdata, {
    style: style4, //style neighborhood polygons
    getInterval: getInterval,
    onEachFeature: onEachFeature2
  });
  timeline5 = L.timeline(cartodbdata, {
    style: style5, //style neighborhood polygons
    getInterval: getInterval,
    onEachFeature: onEachFeature2
  });
  timeline6 = L.timeline(cartodbdata, {
    style: style6, //style neighborhood polygons
    getInterval: getInterval,
    onEachFeature: onEachFeature2
  });
  timelineControl.addTo(map); // connects control to map (buttons and date)
  timelineControl.addTimelines(timeline4);
  timelineControl.addTimelines(timeline5);
  timelineControl.addTimelines(timeline6);

  //Dectect radio buttoms status dynamically
  $("input[type=radio][name=viz-toggle]").change(function () {
    zoomlevel = map.getZoom();
    if (this.value == "1") {
      try {
        map.removeLayer(timeline5);
        map.removeLayer(timeline6);
        timeline4.addTo(map);
        if (zoomlevel <= 3) {
          map.removeLayer(timeline4);
        }
      } catch (err) { console.log(err.message); }
    } else if (this.value == "2") {
      try {
        map.removeLayer(timeline4);
        map.removeLayer(timeline6);
        timeline5.addTo(map);
        if (zoomlevel <= 3) {
          map.removeLayer(timeline5);
        }
      } catch (err) { console.log(err.message); }
    } else if (this.value == "3") {
      try {
        map.removeLayer(timeline4);
        map.removeLayer(timeline5);
        timeline6.addTo(map);
      } catch (err) { console.log(err.message); }
      if (zoomlevel <= 3) {
        map.removeLayer(timeline6);
      }
    }
  });

  map.on("zoomend", function () {
    zoomlevel = map.getZoom();
    console.log(zoomlevel);
    var radio1 = document.getElementById("ConfirmedLayers").checked;
    var radio2 = document.getElementById("DeathsLayers").checked;
    var radio3 = document.getElementById("RecoveredLayers").checked;
    if (zoomlevel > 3) {
      try {
        map.removeLayer(timeline4);
        map.removeLayer(timeline5);
        map.removeLayer(timeline6);
      } catch (err) { console.log(err.message); }

      if (radio1 == true) {
        timeline4.addTo(map);
      } else if (radio2 == true) {
        timeline5.addTo(map);
      } else if (radio3 == true) {
        timeline6.addTo(map);
      }
    } else if (zoomlevel <= 3) {
      try {
        map.removeLayer(timeline4);
        map.removeLayer(timeline5);
        map.removeLayer(timeline6);
      } catch (err) { console.log(err.message); }
      if (radio1 == true) {
        timeline1.addTo(map);
      } else if (radio2 == true) {
        timeline2.addTo(map);
      } else if (radio3 == true) {
        timeline3.addTo(map);
      }

    }
  });
});


map._layersMaxZoom = 6;
map._layersMinZoom = 2;
map.setMaxBounds([
  [-90, -180],
  [90, 180]
])
