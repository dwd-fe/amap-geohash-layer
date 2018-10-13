# amap-geohash-layer
geohash mesh layer for AMap. 高德地图geohash网格图层

> geohashLayer read coords directly from amap api, which means so there is no need to transform coordinates, geohashLayer will also return GCJ02 coordinates.

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

- render line if out of bounds + padding