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

// --- 页面布局 ---
var story = document.getElementById("story");
var features = document.createElement("div");
var header = document.createElement("div");
features.setAttribute("id", "features");

// Header
if (config.topTitle) {
  var topTitle = document.createElement("div");
  topTitle.innerHTML = config.topTitle;
  header.appendChild(topTitle);
}
if (config.title) {
  var titleText = document.createElement("div");
  titleText.innerHTML = config.title;
  header.appendChild(titleText);
}
if (config.subtitle) {
  var subtitleText = document.createElement("div");
  subtitleText.innerHTML = config.subtitle;
  header.appendChild(subtitleText);
}
if (config.byline) {
  var bylineText = document.createElement("div");
  bylineText.innerHTML = config.byline;
  header.appendChild(bylineText);
}
if (config.description) {
  var descriptionText = document.createElement("div");
  descriptionText.innerHTML = config.description;
  header.appendChild(descriptionText);
}
if (header.innerText.length > 0) {
  header.classList.add(config.theme);
  header.setAttribute("id", "header");
  story.appendChild(header);
}

// Chapters
config.chapters.forEach((record, idx) => {
  var container = document.createElement("div");
  var chapter = document.createElement("div");
  chapter.classList.add("br3");
  chapter.innerHTML = record.chapterDiv;
  container.setAttribute("id", record.id);
  container.classList.add("step");
  if (idx === 0) {
    container.classList.add("active");
  }
  chapter.classList.add(config.theme);
  container.appendChild(chapter);
  container.classList.add(alignments[record.alignment] || "centered");
  if (record.hidden) {
    container.classList.add("hidden");
  }
  features.appendChild(container);
});
story.appendChild(features);

// Footer
var footer = document.createElement("div");
if (config.footer) {
  var footerText = document.createElement("p");
  footerText.innerHTML = config.footer;
  footer.appendChild(footerText);
}
if (footer.innerText.length > 0) {
  footer.classList.add(config.theme);
  footer.setAttribute("id", "footer");
  story.appendChild(footer);
}

// --- 初始化地图 ---
mapboxgl.accessToken = config.accessToken;
var map = new mapboxgl.Map({
  container: "map",
  style: config.style,
  center: config.chapters[0].location.center,
  zoom: config.chapters[0].location.zoom,
  bearing: config.chapters[0].location.bearing,
  pitch: config.chapters[0].location.pitch,
  interactive: false,
  projection: config.projection,
});

// Inset MiniMap
if (config.inset) {
  map.addControl(new GlobeMinimap({ ...config.insetOptions }), config.insetPosition);
}

// 默认marker
if (config.showMarkers) {
  var marker = new mapboxgl.Marker({ color: config.markerColor });
  marker.setLngLat(config.chapters[0].location.center).addTo(map);
}

var scroller = scrollama();

map.on("load", function () {

  // --- 加载基础数据 ---
  if (config.use3dTerrain) {
    map.addSource("mapbox-dem", {
      type: "raster-dem",
      url: "mapbox://mapbox.mapbox-terrain-dem-v1",
      tileSize: 512,
      maxzoom: 14,
    });
    map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
    map.addLayer({
      id: "sky",
      type: "sky",
      paint: {
        "sky-type": "atmosphere",
        "sky-atmosphere-sun": [0.0, 0.0],
        "sky-atmosphere-sun-intensity": 15,
      },
    });
  }

  map.addSource("willetsPoint", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [-73.847892, 40.755808]
        }
      }]
    },
  });
  map.addLayer({
    id: "willetsPointMarker",
    type: "circle",
    source: "willetsPoint",
    paint: {
      "circle-radius": 6,
      "circle-color": "#e63946",
      "circle-stroke-color": "#fff",
      "circle-stroke-width": 2,
      "circle-opacity": 0
    },
  });



  map.addSource("coronaclinic", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [-73.86025, 40.7532]
        }
      }]
    }
  });
  map.addLayer({
    id: "coronaclinicpoint",
    type: "circle",
    source: "coronaclinic",
    paint: {
      "circle-radius": 8,
      "circle-color": "#f59e0b",
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 2,
      "circle-opacity": 0
    }
  });
  // 点击黄色圆点，弹出Popup
map.on('click', 'coronaclinicpoint', function (e) {
  e.originalEvent.cancelBubble = true;  // ✅ 阻止事件冒泡
  new mapboxgl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(`
      <h4>Corona Family Health Center</h4>
      <img src="./PIC/clinic.png" style="width:200px; border-radius:6px; margin-top:5px;">
    `)
    .addTo(map);
});


map.addSource("flushingclinic", {
  type: "geojson",
  data: {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      properties: {},
      geometry: {
        type: "Point",
        coordinates: [-73.8274, 40.7576]
      }
    }]
  }
});
map.addLayer({
  id: "flushingclinicpoint",
  type: "circle",
  source: "flushingclinic",
  paint: {
    "circle-radius": 8,
    "circle-color": "#f59e0b",
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 2,
    "circle-opacity": 0
  }
});
// 点击黄色圆点，弹出Popup
map.on('click', 'flushingclinicpoint', function (e) {
new mapboxgl.Popup()
  .setLngLat(e.lngLat)
  .setHTML(`
    <h4>ALLSTAR PHARMACY INC. </h4>
    <h4>仁济西药房</h4>
    <img src="./PIC/chiclinic.png" style="width:200px; border-radius:6px; margin-top:5px;">
  `)
  .addTo(map);
});



map.on('mouseenter', 'after29voc-layer', () => {
  map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'after29voc-layer', () => {
  map.getCanvas().style.cursor = '';
});



map.on('mouseenter', 'after29svoc-layer', () => {
  map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'after29svoc-layer', () => {
  map.getCanvas().style.cursor = '';
});


  map.addSource("insuranceLayer", {
    type: "geojson",
    data: "./DATA/InsurancePercentage.geojson"
  });
  
  map.addLayer({
    id: "insuranceLayerShow",
    type: "fill",   // 是 Polygon，所以用 fill
    source: "insuranceLayer",
    paint: {
      "fill-color": [
        "interpolate",
        ["linear"],
        ["get", "percentage with"],  // <<< 注意这里，要用带引号的字段名
        0, "#ffffff",    // 0% -> 白色
        0.8, "#90cdf4",  // 50% -> 浅蓝
        1.0, "#1e3a8a"   // 100% -> 深蓝
      ],
      "fill-opacity": 0  // 初始透明
    }
  });
  
  
  // 加载 LeadAge3.geojson
map.addSource("leadAgeLayer", {
  type: "geojson",
  data: "./DATA/LeadAge3.geojson"
});

map.addLayer({
  id: "leadAgeLayerShow",
  type: "fill",
  source: "leadAgeLayer",
  paint: {
    "fill-color": [
      "case",
      ["==", ["get", "Percent"], null], "#cccccc", 
      [
        "interpolate",
        ["linear"],
        ["get", "Percent"],
        65, "#ffffff",
        95, "#7f1d1d"
      ]
    ],
    "fill-opacity": 0
  }
});
map.moveLayer('willetsPointMarker');


// 加载 selfreporthealth.geojson
map.addSource("selfreport", {
  type: "geojson",
  data: "./DATA/SelfReportHealth.geojson"
});

map.addLayer({
  id: "childasthma",
  type: "fill",
  source: "selfreport",
  paint: {
    "fill-color": [
      "case",
      ["==", ["get", "Child_Asthma_y"], null], "#cccccc",
      [
        "interpolate",
        ["linear"],
        ["get", "Child_Asthma_y"],
        20, "#fff7ec",
        200, "#fdbb84",
        400, "#e34a33",
        540, "#b30000"
      ]
    ],
    "fill-opacity": 0
  }
});


// 把willetsPointMarker移到最上面
map.moveLayer('willetsPointMarker');


// 加载 nyc_lead.geojson
map.addSource("nyc_lead", {
  type: "geojson",
  data: "./DATA/nyc_lead.geojson"
});

// 图层1：lead浓度
map.addLayer({
  id: "lead_layer",
  type: "fill",
  source: "nyc_lead",
  paint: {
    "fill-color": [
      "case",
      ["==", ["get", "lead"], 999.99], "#cccccc",
      [
        "interpolate",
        ["linear"],
        ["get", "lead"],
        0, "#ffffff",
        50, "#4B4B4B"
      ]
    ],
    "fill-opacity": 0
  }
});

// 把willetsPointMarker移到最上面
map.moveLayer('willetsPointMarker');

// 图层2：cooper浓度
map.addLayer({
  id: "cooper_layer",
  type: "fill",
  source: "nyc_lead",
  paint: {
    "fill-color": [
      "case",
      ["==", ["get", "cooper"], 999.99], "#cccccc",
      [
        "interpolate",
        ["linear"],
        ["get", "cooper"],
        0, "#ffffff",
        1, "#654321"
      ]
    ],
    "fill-opacity": 0
  }
});

// 把willetsPointMarker移到最上面
map.moveLayer('willetsPointMarker');





map.addSource("after29voc", {
  type: "geojson",
  data: "./DATA/AFTER29VOC.geojson"
});

map.addLayer({
  id: "after29voc-layer",
  type: "circle",
  source: "after29voc",
  paint: {
    "circle-radius": 6,
    "circle-color": [
      "interpolate", ["linear"], ["get", "VOC-PASS-RATE"],
      97, "#250c4d",
      100, "#df6c62"
    ],
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 1,
    "circle-opacity": 0
  }
});

//NEW VOC LAYER
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
    "text-color": "#000",
    "text-opacity": 0
  }
});


//voc new popup



//new svoc
map.addSource("after29svoc", {
  type: "geojson",
  data: "./DATA/AFTER29SVOC.geojson"
});

map.addLayer({
  id: "after29svoc-layer",
  type: "circle",
  source: "after29svoc",
  paint: {
    "circle-radius": 6,
    "circle-color": [
      "interpolate", ["linear"], ["get", "SVOC-PASS-RATE"],
      93, "#250c4d",
      100, "#df6c62"
    ],
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 1,
    "circle-opacity": 0  // 初始隐藏，由章节控制
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
    "text-opacity": 0  // 初始隐藏，由章节控制
  }
});
// ✅ 4. 点击和鼠标交互逻辑（放在 source+layer 后面）


map.on('mouseenter', 'after29svoc-layer', () => {
  map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'after29svoc-layer', () => {
  map.getCanvas().style.cursor = '';
});

//new meatal
map.addSource("after29metal", {
  type: "geojson",
  data: "./DATA/AFTER29Metal.geojson"
});

map.addLayer({
  id: "after29metal-layer",
  type: "circle",
  source: "after29metal",
  paint: {
    "circle-radius": 6,
    "circle-color": [
      "interpolate",
      ["linear"],
      ["get", "METAL-PASS-RATE"],
      76, "#250c4d",
      100, "#df6c62"
    ],
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 1,
    "circle-opacity": 0  // 初始透明
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



map.on('mouseenter', 'after29metal-layer', () => {
  map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'after29metal-layer', () => {
  map.getCanvas().style.cursor = '';
});


// ✅ 统一的点击响应逻辑（放在所有 layer 添加完之后）
map.on('click', function (e) {
  const layers = [
    { id: 'after29metal-layer', key: 'METAL' },
    { id: 'after29svoc-layer', key: 'SVOC' },
    { id: 'after29voc-layer', key: 'VOC' }
  ];

  for (const layer of layers) {
    const visibility = map.getPaintProperty(layer.id, 'circle-opacity');
    if (visibility === 0) continue; // 跳过当前不可见图层

    const features = map.queryRenderedFeatures(e.point, { layers: [layer.id] });
    if (features.length) {
      const props = features[0].properties;
      const popupHTML = `
        <div style="font-family: Raleway, sans-serif; font-size: 13px;">
          <strong>Soil Sample CODE:</strong> ${props["CODE"]}<br>
          <strong>Number of failed tests:</strong> ${props[`${layer.key}-EXCEEDNUM`]}<br>
          <strong>Failed test items:</strong> ${props[layer.key]}
        </div>
      `;
      new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(popupHTML).addTo(map);
      break; // 只显示一个
    }
  }
});

map.addSource('affordable_housing', {
  type: 'geojson',
  data: './data/affordable_housing.geojson'
});

map.addLayer({
  id: 'affordable_housing_layer',
  type: 'circle',
  source: 'affordable_housing',
  paint: {
    'circle-radius': 6,
    'circle-color': '#36A7CA',
    'circle-opacity': 0   // 初始为0，不显示
  }
});




  // --- 监听滚动 ---
  scroller
    .setup({ step: ".step", offset: 0.5, progress: true })
    .onStepEnter((response) => {
      var current_chapter = config.chapters.findIndex(chap => chap.id === response.element.id);
      var chapter = config.chapters[current_chapter];

      response.element.classList.add("active");
      map[chapter.mapAnimation || "flyTo"](chapter.location);

      if (config.showMarkers) {
        marker.setLngLat(chapter.location.center);
      }
      if (chapter.onChapterEnter.length > 0) {
        chapter.onChapterEnter.forEach(setLayerOpacity);
      }

      // 检测滚到 blackout
      if (response.element.id === "blackout") {
        const blackout = document.getElementById("blackout-overlay");
        const text = document.getElementById("blackout-text");
        
        blackout.style.opacity = "1"; // 背景黑色淡入
        setTimeout(() => {
          text.style.opacity = "1";    // 文字淡入
        }, 1500);
      }
      

      if (chapter.callback) window[chapter.callback]();

      if (chapter.rotateAnimation) {
        map.once("moveend", () => {
          const rotateNumber = map.getBearing();
          map.rotateTo(rotateNumber + 180, { duration: 30000, easing: (t) => t });
        });
      }

      if (config.auto) {
        var next_chapter = (current_chapter + 1) % config.chapters.length;
        map.once("moveend", () => {
          document.querySelectorAll('[data-scrollama-index="' + next_chapter.toString() + '"]')[0].scrollIntoView();
        });
      }
    })
    .onStepExit((response) => {
      var chapter = config.chapters.find(chap => chap.id === response.element.id);
      response.element.classList.remove("active");
      if (chapter.onChapterExit.length > 0) {
        chapter.onChapterExit.forEach(setLayerOpacity);
      }
    });

  if (config.auto) {
    document.querySelectorAll('[data-scrollama-index="0"]')[0].scrollIntoView();
  }
});

// --- 键盘控制 Space 下一页 ---
document.addEventListener("keydown", function (event) {
  if (event.code === "Space" || event.code === "PageDown") {
    event.preventDefault();
    const active = document.querySelector(".step.active");
    const steps = Array.from(document.querySelectorAll(".step"));
    const currentIndex = steps.indexOf(active);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      const offset = nextStep.offsetTop;
      const adjustment = window.innerHeight * 0.2;
      window.scrollTo({ top: offset - adjustment, behavior: "smooth" });
    }
  }
});
