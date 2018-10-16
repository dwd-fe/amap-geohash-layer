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

    this.latSet = new Set()
    this.lngSet = new Set()

    this.shouldLayerRender = this.shouldLayerRender.bind(this)
    this.shouldLayerRender()// render when new GeohashLayer

    this.map.on('zoomend', this.shouldLayerRender)
    this.map.on('moveend', this.shouldLayerRender)
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
    const vertical = []
    const horizon = []
    const maxLng = northeast.lng + padding
    const minLng = southwest.lng - padding
    const maxLat = northeast.lat + padding
    const minLat = southwest.lat - padding
    const loop = lngList.length > latList.length ? lngList.length : latList.length
    for (let i = 0; i < loop; i++) {
      const lat = latList[i]
      const lng = lngList[i]
      lng && (horizon.push(Overlays.Polyline([[lng, maxLat], [lng, minLat]], lng)))
      lat && (vertical.push(Overlays.Polyline([[maxLng, lat], [minLng, lat]], lat)))
    }
    this.overlayGroup.clearOverlays()
    this.overlayGroup.addOverlays([...vertical, ...horizon])
    this.latSet.clear()
    this.lngSet.clear()
  }

  destroy() {
    this.map.off('zoomend', this.shouldLayerRender)
    this.map.off('moveend', this.shouldLayerRender)
    this.overlayGroup && (this.overlayGroup.clearOverlays())
  }

  invariant() {
    if (!this.map || !this.map.CLASS_NAME || this.map.CLASS_NAME !== 'AMap.Map' || !window.AMap) {
      throw new TypeError('map property is not an instancee of amap')
    }
  }
}
