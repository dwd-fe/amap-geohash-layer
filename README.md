# amap-geohash-layer
geohash mesh layer for AMap. 高德地图geohash网格图层

<p align="center"><img src="https://github.com/haowen737/amap-geohash-layer/blob/master/docs/example.jpeg?raw=true"></p>

## USAGE

```
  /**
   *Creates an instance of GeohashLayer.
   * @param {*} {
   *     map,
   *     padding,
   *     zoomLimit
   *   }
   * @memberof GeoHashBox
   */
  const geohashLayer = new GeohashLayer({ map, zoomLimit, padding })
  geohashLayer.render()
  geohashLayer.destroy()
```

## FEATURE

- Support multi geohash precision
