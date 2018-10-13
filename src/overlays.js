const Polyline = (path, extData) => new window.AMap.Polyline({
  path,
  extData,
  strokeWeight: 1,
  strokeColor: '#000000',
  strokeOpacity: 0.1,
})

export default {
  Polyline,
}
