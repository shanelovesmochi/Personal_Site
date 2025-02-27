window.onload = function () {
    mapboxgl.accessToken = 'pk.eyJ1Ijoiemh1eGlhb2ZhbiIsImEiOiJjbTZwbWExOTQxbHltMmpwejFhYjE4N2tyIn0.nLsjhcoYgKArlCgL2b99ng';

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/zhuxiaofan/cm6jjln1800bt01qqcqamed19',
        center: [-73.935242, 40.730610], // NYC
        zoom: 10,
        maxZoom: 15,
        minZoom: 4,
        projection: 'mercator'
    });

document.getElementById('projectionSelect').addEventListener('change', function (e) {
    map.setProjection(e.target.value);
});




map.on('load', function () {
    fetch("data/Age_Census_merged_data.geojson")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("GeoJSON Loaded:", data);
            console.log("First Feature Properties:", data.features[0].properties);



            



                // 添加数据源
        map.addSource('census_data', {
            type: 'geojson',
            data: data
        });

        // 添加可视化图层
        map.addLayer({
            id: 'census_layer',
            type: 'fill',
            source: 'census_data',
            paint: {
                'fill-color': [
                    'step', ['get', 'Total Percent age 60 above'],
                    '#f1b481',
                    16.3, '#df6c62',
                    24.5, '#a84178',
                    33.5, '#6b237c',
                    52.7, '#250c4d',
                ],
                'fill-opacity': [
                    'case',
                    ['==', ['get', 'Total Percent age 60 above'], 0], 0.1,  // If 0, almost transparent
                    0.9  // Default opacity for all other values
                ],
                'fill-outline-color': '#ffffff'
            }
        }, 'water');

        // click for info
        map.on('click', 'census_layer', function (e) {
            let props = e.features[0].properties;

            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(`
                    <h4>Census Tract: ${props.GEOID}</h4>
                    <p>Total Population: ${props["Total population"] || "N/A"}</p>
                    <p>Percent Age 60 Above: ${props["Total Percent age 60 above"] || "N/A"}%</p>
                `)
                .addTo(map);
        });


        // 鼠标悬停效果
        map.on('mouseenter', 'census_layer', function () {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'census_layer', function () {
            map.getCanvas().style.cursor = '';
        });


                

            


        })
        .catch(error => console.error("GeoJSON 加载失败:", error));
    });
};



                
