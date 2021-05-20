// google here is window.google, should be passed down from index.js 
function withinRegion(google, position, user, radius) {
    const to = new google.maps.LatLng(user.position.lat, user.position.lng)
    const from = new google.maps.LatLng(position.lat, position.lng)
    const distance = google.maps.geometry.spherical.computeDistanceBetween(from, to)

    return distance <= radius;
}

exports.withinRegion = withinRegion