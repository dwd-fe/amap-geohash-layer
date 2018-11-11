const Polyline = (path, extData, style) => new window.AMap.Polyline({
  path,
  extData,
  strokeWeight: style.strokeWeight || 1,
  strokeColor: style.strokeColor || '#000000',
  strokeOpacity: style.strokeOpacity || 0.2,
})

export default {
  Polyline,
}
