import geohash from 'ngeohash'

import Overlays from './overlays'

export default class GeohashLayer {
  /**
   *Creates an instance of GeohashLayer.
   * @param {*} {
   *     map,
   *     padding,
   *     zoomLimit
   *   }
   * @memberof GeohashLayer
   */
  constructor({
    map,
    padding,
    zoomLimit,
  }) {
    this.map = map
    this.padding = padding || 0.03
    this.zoomLimit = zoomLimit || 13
    this.overlayGroup = new window.AMap.OverlayGroup([]);
    this.overlayGroup.setMap(map)
    this.dump = []// dump those polygon out of bounds

    this.latSet = new Set()
    this.lngSet = new Set()

    this.shouldLayerRender = this.shouldLayerRender.bind(this)
    this.zoomChange = this.zoomChange.bind(this)

    this.map.on('zoomend', this.shouldLayerRender)
    this.map.on('moveend', this.shouldLayerRender)
    this.map.on('zoomchange', this.zoomChange)
  }

  zoomChange () {
    this.invariant()
    if (this.map.getZoom() < this.zoomLimit) {
      this.overlayGroup.hide()
      return
    }
  }

  shouldLayerRender() {
    this.invariant()
    if (this.map.getZoom() < this.zoomLimit) {
      this.overlayGroup.hide()
      return
    }
    this.render()
  }

  render() {
    const inBoundLat = []
    const inBoundLng = []
    const { padding } = this
    const bounds = this.map.getBounds()
    const { southwest, northeast } = bounds
    const bboxs = new Set(geohash.bboxes(
      southwest.lat - padding,
      southwest.lng - padding,
      northeast.lat + padding,
      northeast.lng + padding,
      7,
    ))

    console.log('size1', bboxs)

    this.overlayGroup.eachOverlay((ov) => {
      const extDate = ov.getExtData()
      const { hash, lat, lng } = extDate
      if (bboxs.has(hash)) {
        bboxs.delete(hash)
        lat && inBoundLat.push(lat)
        lng && inBoundLng.push(lng)
      } else {
        ov.setMap(null)
        this.dump.push(ov)
      }
    })
    console.log('size2', bboxs.size)


    if (this.dump.length) {
      this.overlayGroup.removeOverlays(this.dump)
      this.dump = []
    }


    // Deduplication, so we can get pure lat & lng
    for (let hash of bboxs.values()) {
      const bbox = geohash.decode_bbox(hash);
      this.latSet.add(bbox[0]).add(bbox[2])
      this.lngSet.add(bbox[1]).add(bbox[3])
    }

    const latList = [...this.latSet]
    const lngList = [...this.lngSet]
    const vertical = []
    const horizon = []
    const maxLng = northeast.lng + padding + 0.3
    const minLng = southwest.lng - padding - 0.3
    const maxLat = northeast.lat + padding + 0.3
    const minLat = southwest.lat - padding - 0.3
    const loop = lngList.length > latList.length ? lngList.length : latList.length
    for (let i = 0; i < loop; i++) {
      const lat = latList[i]
      const lng = lngList[i]
      if (lng && !inBoundLng.includes(lng)) {
        const lngLine = Overlays.Polyline(
          [[lng, maxLat], [lng, minLat]],
          { hash: geohash.encode(minLat + (maxLat - minLat) / 2, lng, 7), lat: minLat + (maxLat - minLat) / 2, lng: lng }
        )
        lng && (horizon.push(lngLine))
      }
      if (lat && !inBoundLat.includes(lat)) {
        const latLine = Overlays.Polyline(
          [[maxLng, lat], [minLng, lat]],
          { hash: geohash.encode(lat, minLng + (maxLng - minLng) / 2, 7), lat: lat, lng: minLng + (maxLng - minLng) / 2 }
        )
        lat && (vertical.push(latLine))
      }
    }
    // this.overlayGroup.clearOverlays()
    console.log('clear `=====', [...vertical, ...horizon])
    this.overlayGroup.addOverlays([...vertical, ...horizon])
    this.latSet.clear()
    this.lngSet.clear()
    bboxs.clear()
  }

  destroy() {
    this.map.off('zoomend', this.shouldLayerRender)
    this.map.off('moveend', this.shouldLayerRender)
    this.overlayGroup && (this.overlayGroup.clearOverlays())
    console.log(this.overlayGroup)
  }

  invariant() {
    if (!this.map || !this.map.CLASS_NAME || this.map.CLASS_NAME !== 'AMap.Map' || !window.AMap) {
      throw new TypeError('map property is not an instancee of amap')
    }
  }
}
