<template>
    <div id="mapContainer"></div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import Prompt from "./js/prompt/prompt.js"
import util from "./js/util"
import Heatmap3d from "./js/heatmap3d.js"
let viewer = undefined;
let mapContainer = ref()
onMounted(() => {
    viewer = new Cesium.Viewer('mapContainer', {
        imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
            url: "http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer"
        }),
        terrainProvider: new Cesium.CesiumTerrainProvider({
            url: "http://data.marsgis.cn/terrain"
        }),
        animation: false,  // 设置动画小组件关闭展示
        timeline: false, // 时间轴关闭展示
        infoBox: false, // 信息盒子关闭展示
        geocoder: false, // 地理编码搜索关闭展示
        baseLayerPicker: false, // 基础图层选择器关闭展示
        sceneModePicker: false, // 场景选择器关闭展示
        fullscreenButton: false, // 全屏按钮关闭展示
        navigationInstructionsInitiallyVisible: false, // 导航说明是否最初展示
        navigationHelpButton: false, // 导航帮助按钮关闭展示
        homeButton: false
    });
    document.getElementsByClassName("cesium-viewer-bottom")[0].style.display = "none";
    util.setCameraView({
        "x": 117.31366962163708,
        "y": 31.582212285238125,
        "z": 12222.804219526453,
        "heading": 354.6893925320491,
        "pitch": -16.957477434957926,
        "roll": 0.13837382238243223,
        "duration": 0
    }, viewer)

    let list = [];
    for (let i = 0; i < 100; i++) {
        list.push({
            "lnglat": [
                117.28 + Math.random() * .1 * (Math.random() > 0.5 ? 1 : -1),
                31.923 + Math.random() * .1 * (Math.random() > 0.5 ? 1 : -1)
            ],
            "value": 1000 * Math.random()
        })
    }
    new Heatmap3d(viewer, {
        list: list,
        raduis: 15,
        baseHeight: 800,
        primitiveType: "TRNGLE",
        gradient: {
            ".3": "blue",
            ".5": "green",
            ".7": "yellow",
            ".95": "red"
        }
    })
})



</script>

<style scoped>
.toolbar {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 999;
}

.toolbar-btn {
    margin: 10px;
}

#mapContainer {
    margin: 0;
    padding: 0;
    height: 100%;
}
</style>

