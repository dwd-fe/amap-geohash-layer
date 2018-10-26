const Polyline = (path, extData, style) => new window.AMap.Polyline({
  path,
  extData,
  ...style,
  strokeWeight: 1,
  strokeColor: '#000000',
  strokeOpacity: 0.1,
})

export default {
  Polyline,
}
