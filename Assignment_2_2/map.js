mapboxgl.accessToken = 'pk.eyJ1Ijoiemh1eGlhb2ZhbiIsImEiOiJjbTZwbWExOTQxbHltMmpwejFhYjE4N2tyIn0.nLsjhcoYgKArlCgL2b99ng';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/zhuxiaofan/cm6jjln1800bt01qqcqamed19',
    zoom: 10,
    center: [-74, 40.725],

    // 限制地图zoom in or out的范围
    maxZoom: 15,
    minZoom: 8,
    maxBounds: [[-74.45, 40.45], [-73.55, 41]]

    // 最后一行每次都没有逗号，所以如果往下继续加代码，记得在最后一行打逗号
});



map.on('load', function () {
    let layers = map.getStyle().layers;
    let firstSymbolId;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol') {
            firstSymbolId = layers[i].id;
            break;
        }
    }


    // 添加data数据源
    map.addSource('bikeAccidents', {
        'type': 'geojson',
        'data': 'data/BikeCrash.geojson'
    });

    map.addSource('bikeStations', {
        'type': 'geojson',
        'data': 'data/station_counts.geojson'
    });


    // 填色layer
    map.addLayer({
        'id': 'Bike Accident Data',
        'type': 'heatmap',
        'source': 'bikeAccidents',
        'layout': {
            'visibility': 'visible'
        },
        'paint': {
            // 热力颜色渐变：低密度蓝色，高密度红色
            'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(33,102,172,0)',
                0.01, 'rgba(33, 102, 172, 0.5)',
                0.2, 'rgba(102, 204, 255, 0.6)',
                0.97, 'rgba(0, 255, 0, 0.8)',
                0.98, 'rgba(255, 255, 0, 0.9)',
                0.99, 'rgba(255, 140, 0, 0.9)', 
                1, 'rgba(255, 0, 0, 1)'
            ],
            // 热力图强度（按 zoom 级别调整）
            'heatmap-intensity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                8, 0.2,
                12, 1,
                15, 12
            ],
            // zoom in之后圆点的缩放半径
            'heatmap-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                8, 30,
                9, 23,
                11, 21,
                15, 20
            ],
            // 透明度
            'heatmap-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                8, 0.8,
                15, 0.3
            ]
        }
    }, firstSymbolId); // 🔹 确保热力图位于第一个 symbol 图层的下方


    // where are the accidents?
    map.addLayer({
        'id': 'Bike Accident Points',
        'type': 'circle',
        'source': 'bikeAccidents',
        'minzoom': 14, // 只在 zoom > 14 时显示点
        'paint': {
            'circle-radius': 5,
            'circle-color': 'white',
            'circle-opacity': 0.6
        }
    }, firstSymbolId);

    map.addLayer({
        'id': 'NYC City Bike Data',
        'type': 'circle',
        'source': 'bikeStations',
        'paint': {
            // 圆点颜色（随出发次数变化）
            'circle-color': [
                'interpolate',
                ['linear'],
                ['get', 'start_count'],
                0, 'rgba(227, 140, 140, 0.11)',
                50, 'rgba(210, 78, 78, 0.36)',
                200, 'rgba(197, 24, 24, 0.7)',
            ],
            // 圆点边框颜色
            'circle-stroke-color': '#000000',
            'circle-stroke-width': 0.3,

            // 圆点大小
        'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, ['interpolate', ['linear'], ['+', ['get', 'start_count'], ['get', 'end_count']],
                0, 2,
                100, 4,
                300, 6,
                500, 10,
                1000, 20
            ],
            15, ['interpolate', ['linear'], ['+', ['get', 'start_count'], ['get', 'end_count']],
                0, 4,     // 小站点也变大
                100, 8,
                300, 12,
                500, 18,
                1000, 30   // 高流量站点更大
            ]
        ],
        'circle-opacity': 0.8
        }
    })
});



// Create the popup
map.on('click', 'NYC City Bike Data', function (e) {
    let stationName = e.features[0].properties.station_name;
    let startCount = e.features[0].properties.start_count;
    let endCount = e.features[0].properties.end_count;

    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(
            `<h4>${stationName}</h4>
             <p><b>🚲 bicycle departures:</b> ${startCount}</p>
             <p><b>🚲 bicycle returns:</b> ${endCount}</p>`
        )
        .addTo(map);
});

// 鼠标悬停时显示指针
map.on('mouseenter', 'NYC City Bike Data', function () {
    map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'NYC City Bike Data', function () {
    map.getCanvas().style.cursor = '';
});



// add menu

var toggleableLayerIds = ['NYC City Bike Data', 'Bike Accident Data'];

for (let i = 0; i < toggleableLayerIds.length; i++) {
    let id = toggleableLayerIds[i];

    let link = document.createElement('a');
    link.href = '#';
    link.className = 'active';
    link.textContent = id;

    link.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();

        let visibility = map.getLayoutProperty(id, 'visibility');

        if (visibility === 'visible') {
            map.setLayoutProperty(id, 'visibility', 'none');  // 隐藏图层
            this.className = '';
        } else {
            map.setLayoutProperty(id, 'visibility', 'visible'); // 显示图层
            this.className = 'active';
        }
    };

    let menu = document.getElementById('menu');
    menu.appendChild(link);
}
