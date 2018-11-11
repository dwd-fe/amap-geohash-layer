import geohash from 'ngeohash'

import Overlays from './overlays'

export default class GeohashLayer {
  /**
   *Creates an instance of GeohashLayer.
   * @param {*} {
   *     map,
   *     padding,
   *     zoomLimit,
   *     strokeColor,
   *     strokeOpacity
   *   }
   * @memberof GeohashLayer
   */
  constructor({
    map,
    padding,
    zoomLimit,
    strokeColor,
    strokeOpacity,
    strokeWeight,
    strokeStyle
  }) {
    this.map = map
    this.polylineStyle = { strokeColor, strokeOpacity, strokeWeight, strokeStyle }
    this.padding = padding || 0.03
    this.zoomLimit = zoomLimit || 14
    this.layerx = Overlays.Polyline([], null, this.polylineStyle)
    this.layery = Overlays.Polyline([], null, this.polylineStyle)
    this.layerx.setMap(map)
    this.layery.setMap(map)
    this.latSet = new Set()
    this.lngSet = new Set()

    this.shouldLayerRender = this.shouldLayerRender.bind(this)
    this.map.on('zoomend', this.shouldLayerRender)
    this.map.on('moveend', this.shouldLayerRender)
  }

  render() {
    this.shouldLayerRender()
  }

  shouldLayerRender() {
    this.invariant()
    if (this.map.getZoom() < this.zoomLimit) {
      this.layerx.hide()
      this.layery.hide()
      return
    }
    this.main()
  }

  main() {
    const { padding } = this
    const bounds = this.map.getBounds()
    const { southwest, northeast } = bounds
    const bboxs = geohash.bboxes(
      southwest.lat - padding,
      southwest.lng - padding,
      northeast.lat + padding,
      northeast.lng + padding,
      7,
    )

    // Deduplication, so we can get pure lat & lng
    for (let i = 0; i < bboxs.length; i++) {
      const hash = bboxs[i]
      const bbox = geohash.decode_bbox(hash);
      this.latSet.add(bbox[0]).add(bbox[2])
      this.lngSet.add(bbox[1]).add(bbox[3])
    }
    const latList = [...this.latSet]
    const lngList = [...this.lngSet]
    const latLength = latList.length - 1
    const lngLength = lngList.length - 1
    const minLat = latList[0] - padding
    const minLng = lngList[0] - padding
    const maxLat = latList[latLength] + padding
    const maxLng = lngList[lngLength] + padding
    const pathx = []
    const pathy = []
    for (let i = 0; i < lngLength; i++) {
      const isOdd = i % 2
      const stepDown = [lngList[i], minLat]
      const stepUp = [lngList[i], maxLat]
      isOdd
        ? pathx.push(stepDown, stepUp)
        : pathx.push(stepUp, stepDown)
    }
    for (let i = 0; i < latLength; i++) {
      const isOdd = i % 2
      const stepDown = [minLng, latList[i]]
      const stepUp = [maxLng, latList[i]]
      isOdd
        ? pathy.push(stepDown, stepUp)
        : pathy.push(stepUp, stepDown)
    }
    this.layerx.setPath(pathx)
    this.layery.setPath(pathy)
    this.layerx.show()
    this.layery.show()
    this.latSet.clear()
    this.lngSet.clear()
  }

  destroy() {
    this.map.off('zoomend', this.shouldLayerRender)
    this.map.off('moveend', this.shouldLayerRender)
    this.layerx && this.layerx.setMap(null)
    this.layery && this.layery.setMap(null)
    this.layerx = null
    this.layery = null
  }

  invariant() {
    if (!this.map || !this.map.CLASS_NAME || this.map.CLASS_NAME !== 'AMap.Map' || !window.AMap) {
      throw new TypeError('map property is not an instancee of amap')
    }
  }
}
