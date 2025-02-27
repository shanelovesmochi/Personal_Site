window.onload = function () {
    mapboxgl.accessToken = 'pk.eyJ1Ijoiemh1eGlhb2ZhbiIsImEiOiJjbTZwbWExOTQxbHltMmpwejFhYjE4N2tyIn0.nLsjhcoYgKArlCgL2b99ng';

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/zhuxiaofan/cm6jjln1800bt01qqcqamed19',
        center: [-98, 38.88], 
        zoom: 3,
        maxZoom: 15,
        minZoom: 2,
        projection: 'mercator'
    });

document.getElementById('projectionSelect').addEventListener('change', function (e) {
    map.setProjection(e.target.value);
});

const zoomThreshold = 4;

// add one layor
map.on('load', function () {
    Promise.all([
        fetch("data/Merged_State.geojson").then(response => response.json()),
        fetch("data/Merged_County.geojson").then(response => response.json()),
        fetch("data/Merged_Census.geojson").then(response => response.json())
    ])

    .then(([stateData, countyData, censusData]) => {
        console.log("State GeoJSON Loaded:", stateData);
        console.log("County GeoJSON Loaded:", countyData);
        console.log("Census GeoJSON Loaded:", censusData);

    
/*         .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("GeoJSON Loaded:", data);
            console.log("First Feature Properties:", data.features[0].properties); */



            



                // 添加数据源
        map.addSource('state_data', {
            type: 'geojson',
            data: stateData
        });

        map.addSource('county_data', {
            type: 'geojson',
            data: countyData
        });

        map.addSource('census_data', {
            type: 'geojson',
            data: censusData
        });




        // 添加可视化图层
        map.addLayer({
            id: 'State_Data',
            type: 'fill',
            source: 'state_data',
            maxzoom: zoomThreshold,
            paint: {
                'fill-color': [
                    'step', ['get', 'PERCENTAGE'],
                    '#f1b481',
                    19.3, '#df6c62',
                    22.8, '#a84178',
                    25.0, '#6b237c',
                    27.5, '#250c4d',
                ],
                'fill-opacity': [
                    'case',
                    ['==', ['get', 'PERCENTAGE'], 0], 0.1,  // If 0, almost transparent
                    0.9  // Default opacity for all other values
                ],
                'fill-outline-color': '#ffffff'
            }
        }, 'water');


        map.addLayer({
            id: 'County_Data',
            type: 'fill',
            source: 'county_data',
            minzoom: zoomThreshold,
            paint: {
                'fill-color': [
                    'step', ['get', 'PERCENTAGE'],
                    '#f1b481',
                    21.4, '#df6c62',
                    26.4, '#a84178',
                    31.5, '#6b237c',
                    39.2, '#250c4d',
                ],
                'fill-opacity': [
                    'case',
                    ['==', ['get', 'PERCENTAGE'], 0], 0.1,  // If 0, almost transparent
                    0.9  // Default opacity for all other values
                ],
                'fill-outline-color': '#ffffff'
            }
        }, 'water');

        map.addLayer({
            id: 'Census_Data',
            type: 'fill',
            source: 'census_data',
            minzoom: zoomThreshold+2,
            paint: {
                'fill-color': [
                    'step', ['get', 'PERCENTAGE'],
                    '#f1b481',
                    16.3, '#df6c62',
                    24.5, '#a84178',
                    33.5, '#6b237c',
                    52.7, '#250c4d',
                ],
                'fill-opacity': [
                    'case',
                    ['==', ['get', 'PERCENTAGE'], 0], 0.1,  // If 0, almost transparent
                    0.9  // Default opacity for all other values
                ],
                'fill-outline-color': '#ffffff'
            }
        }, 'water');


        

/*         map.on('click', 'census_layer', function (e) {
            let props = e.features[0].properties;

            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(`
                    <p>Total Population: ${props["Total population"] || "N/A"}</p>
                    <p>Percent Age 60 Above: ${props["PERCENTAGE"] || "N/A"}%</p>
                `)
                .addTo(map);
        });


        map.on('mouseenter', 'census_layer', function () {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'census_layer', function () {
            map.getCanvas().style.cursor = '';
        });
 */

                

            


        })
        .catch(error => console.error("GeoJSON 加载失败:", error));




        const stateLegendEl = document.getElementById('state-legend');
        const countyLegendEl = document.getElementById('county-legend');
        const censusLegendEl = document.getElementById('census-legend')

        
        map.on('zoom', () => {
            const zoomLevel = map.getZoom();
        
            if (zoomLevel > zoomThreshold + 2) {  // 进一步放大，显示 Census 数据
                stateLegendEl.style.display = 'none';
                countyLegendEl.style.display = 'none';
                censusLegendEl.style.display = 'block';
        
                map.setLayoutProperty('State_Data', 'visibility', 'none'); 
                map.setLayoutProperty('County_Data', 'visibility', 'none'); 
                map.setLayoutProperty('Census_Data', 'visibility', 'visible');

            } 
            else if (zoomLevel > zoomThreshold) {  // 正常放大，显示 County 数据
                stateLegendEl.style.display = 'none';
                countyLegendEl.style.display = 'block';
                censusLegendEl.style.display = 'none';
        
                map.setLayoutProperty('state-data', 'visibility', 'none'); 
                map.setLayoutProperty('county-data', 'visibility', 'visible'); 
                map.setLayoutProperty('census-data', 'visibility', 'none');
            } 
            else {  // 默认显示 State 数据
                stateLegendEl.style.display = 'block';
                countyLegendEl.style.display = 'none';
                censusLegendEl.style.display = 'none';
        
                map.setLayoutProperty('state-data', 'visibility', 'visible'); 
                map.setLayoutProperty('county-data', 'visibility', 'none'); 
                map.setLayoutProperty('census-data', 'visibility', 'none');
            }
        });


        


    });
};



                
