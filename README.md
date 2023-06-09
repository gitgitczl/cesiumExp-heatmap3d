# Cesium 3d热力图插件
### [在线体验](http://mapgl.com/shareCode/#/Heatmap3d?downUrl=)  
gitee：[https://gitee.com/caozl1132/cesiumExp-heatmap3d](https://gitee.com/caozl1132/cesiumExp-heatmap3d)  
github：[https://github.com/gitgitczl/cesiumExp-heatmap3d](https://github.com/gitgitczl/cesiumExp-heatmap3d)

***
ps：如果可以的话，希望大家能给我个star，好让我有更新下去的动力；
***
实现原理： 
核心是使用了heatmap.js这个库，这个库生成的热力图是用canvas绘制的，那么在Cesium中，我们只要将canvas转图片，当初材质贴到我们的对象上就行。因为要做3d热力图，所以要采用geometry自己构建了顶点着色器，然后材质和二维热力图一样，还是使用了材质贴图。
三维热力图与二维热力图的唯一区别在于使用顶点坐标与顶点缓冲区的构建，注意在构建顶点缓冲区时，边界要单独处理。此案例中，我对于边缘部分的计算还有瑕疵。
调用方法： 
```
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
```
***
支持原heatmap.js的参数传参，具体可见src/js/heatmap.js类，并且primitiveType支持了两种类型，TRANGLE（面）以及LINES（网格）

其它：     
qq群：606645466（GIS之家共享交流群）

[更多案例地址](http://mapgl.com/shareCode/)&nbsp;&nbsp;&nbsp; [更多免费数据](http://mapgl.com/shareData/)&nbsp;&nbsp;&nbsp; [开发文档说明](http://mapgl.com/3dapi/)   

[其它源码下载（标绘、量算、动态材质、漫游、地图分析等）](http://mapgl.com/introduce/)
