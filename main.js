let map = L.map("map").setView([16.0471, 108.2068], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

async function searchLocation() {
  const name = document.getElementById("locationInput").value;
  if (!name) return alert("Nhập tên địa điểm!");

  const geoURL =
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=1&countrycodes=vn`;

  const geoRes = await fetch(geoURL);
  const geoData = await geoRes.json();

  if (geoData.length === 0) {
    alert("Không tìm thấy địa điểm!");
    return;
  }

  const lat = geoData[0].lat;
  const lon = geoData[0].lon;

  map.setView([lat, lon], 15);

  const query = `
    [out:json];
    (
      node(around:800, ${lat}, ${lon})[amenity];
      way(around:800, ${lat}, ${lon})[amenity];
    );
    out center 5;
  `;

  const overpassURL = "https://overpass-api.de/api/interpreter";

  const poiRes = await fetch(overpassURL, {
    method: "POST",
    body: query,
  });

  const poiData = await poiRes.json();
  const elements = poiData.elements.slice(0, 5);

  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) map.removeLayer(layer);
  });

  elements.forEach((poi) => {
    const lat = poi.lat || poi.center.lat;
    const lon = poi.lon || poi.center.lon;

    const name = poi.tags.name || "Không có tên";
    const type = poi.tags.amenity || "POI";

    L.marker([lat, lon]).addTo(map).bindPopup(`
      <b>${name}</b><br>
      Loại: ${type}
    `);
  });
}
