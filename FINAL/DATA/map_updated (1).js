
var initLoad = true;

var layerTypes = {
  fill: ["fill-opacity"],
  line: ["line-opacity"],
  circle: ["circle-opacity", "circle-stroke-opacity"],
  symbol: ["icon-opacity", "text-opacity"],
  raster: ["raster-opacity"],
  "fill-extrusion": ["fill-extrusion-opacity"],
  heatmap: ["heatmap-opacity"],
};

var alignments = {
  left: "lefty",
  center: "centered",
  right: "righty",
  full: "fully",
};

function getLayerPaintType(layer) {
  var layerType = map.getLayer(layer).type;
  return layerTypes[layerType];
}

function setLayerOpacity(layer) {
  var paintProps = getLayerPaintType(layer.layer);
  paintProps.forEach(function (prop) {
    var options = {};
    if (layer.duration) {
      var transitionProp = prop + "-transition";
      options = { duration: layer.duration };
      map.setPaintProperty(layer.layer, transitionProp, options);
    }
    map.setPaintProperty(layer.layer, prop, layer.opacity, options);
  });
}

// === 数据源 ===
map.on("load", function () {
  map.addSource("after29voc", {
    type: "geojson",
    data: "./DATA/AFTER29VOC.geojson"
  });

  map.addSource("after29svoc", {
    type: "geojson",
    data: "./DATA/AFTER29SVOC.geojson"
  });

  map.addSource("after29metal", {
    type: "geojson",
    data: "./DATA/AFTER29METAL.geojson"
  });

  // === VOC 图层 ===
  map.addLayer({
    id: "after29voc-layer",
    type: "circle",
    source: "after29voc",
    paint: {
      "circle-radius": 6,
      "circle-color": [
        "interpolate", ["linear"], ["get", "VOC-PASS-RATE"],
        75, "#000000", 100, "#8ED973"
      ],
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 1,
      "circle-opacity": 0
    }
  });

  map.addLayer({
    id: "after29voc-label",
    type: "symbol",
    source: "after29voc",
    layout: {
      "text-field": ["concat", ["get", "VOC-PASS-RATE"], "%"],
      "text-font": ["Arial Unicode MS Regular"],
      "text-size": 12,
      "text-offset": [0, 2],
      "text-anchor": "top",
      "text-allow-overlap": true
    },
    paint: {
      "text-color": "#000000",
      "text-halo-color": "#ffffff",
      "text-halo-width": 1,
      "text-opacity": 0
    }
  });

  map.on('click', 'after29voc-layer', function (e) {
    const props = e.features[0].properties;
    const popupHTML = `
      <div style="font-family: Raleway, sans-serif; font-size: 13px; line-height: 1.6;">
        <strong>Soil Sample CODE:</strong> ${props["CODE"]}<br>
        <strong>Number of failed tests:</strong> ${props["VOC-EXCEEDNUM"]}<br>
        <strong>Failed test items:</strong> ${props["VOC"]}
      </div>`;
    new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(popupHTML).addTo(map);
  });

  // === SVOC 图层 ===
  map.addLayer({
    id: "after29svoc-layer",
    type: "circle",
    source: "after29svoc",
    paint: {
      "circle-radius": 6,
      "circle-color": [
        "interpolate", ["linear"], ["get", "SVOC-PASS-RATE"],
        75, "#000000", 100, "#00FF00"
      ],
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 1,
      "circle-opacity": 0
    }
  });

  map.addLayer({
    id: "after29svoc-label",
    type: "symbol",
    source: "after29svoc",
    layout: {
      "text-field": ["concat", ["get", "SVOC-PASS-RATE"], "%"],
      "text-font": ["Arial Unicode MS Regular"],
      "text-size": 12,
      "text-offset": [0, 2],
      "text-anchor": "top",
      "text-allow-overlap": true
    },
    paint: {
      "text-color": "#000000",
      "text-halo-color": "#ffffff",
      "text-halo-width": 1,
      "text-opacity": 0
    }
  });

  map.on('click', 'after29svoc-layer', function (e) {
    const props = e.features[0].properties;
    const popupHTML = `
      <div style="font-family: Raleway, sans-serif; font-size: 13px; line-height: 1.6;">
        <strong>Soil Sample CODE:</strong> ${props["CODE"]}<br>
        <strong>Number of failed tests (out of 76):</strong> ${props["SVOC-EXCEEDNUM"]}<br>
        <strong>Failed test items (mg/kg):</strong> ${props["SVOC"]}
      </div>`;
    new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(popupHTML).addTo(map);
  });

  // === METAL 图层 ===
  map.addLayer({
    id: "after29metal-layer",
    type: "circle",
    source: "after29metal",
    paint: {
      "circle-radius": 6,
      "circle-color": [
        "interpolate", ["linear"], ["get", "METAL-PASS-RATE"],
        75, "#000000", 100, "#1E90FF"
      ],
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 1,
      "circle-opacity": 0
    }
  });

  map.addLayer({
    id: "after29metal-label",
    type: "symbol",
    source: "after29metal",
    layout: {
      "text-field": ["concat", ["get", "METAL-PASS-RATE"], "%"],
      "text-font": ["Arial Unicode MS Regular"],
      "text-size": 12,
      "text-offset": [0, 2],
      "text-anchor": "top",
      "text-allow-overlap": true
    },
    paint: {
      "text-color": "#000000",
      "text-halo-color": "#ffffff",
      "text-halo-width": 1,
      "text-opacity": 0
    }
  });

  map.on('click', 'after29metal-layer', function (e) {
    const props = e.features[0].properties;
    const popupHTML = `
      <div style="font-family: Raleway, sans-serif; font-size: 13px; line-height: 1.6;">
        <strong>Soil Sample CODE:</strong> ${props["CODE"]}<br>
        <strong>Number of failed tests:</strong> ${props["METAL-EXCEEDNUM"]}<br>
        <strong>Failed test items:</strong> ${props["METAL"]}
      </div>`;
    new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(popupHTML).addTo(map);
  });
});
