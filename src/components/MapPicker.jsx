import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import icon2x from 'leaflet/dist/images/marker-icon-2x.png'
import shadow from 'leaflet/dist/images/marker-shadow.png'
import { useEffect } from 'react'

const pin = L.icon({ iconUrl: icon, iconRetinaUrl: icon2x, shadowUrl: shadow, iconSize: [25, 41], iconAnchor: [12, 41] })
const SOWETO = [-26.2678, 27.8585]

function Clicks({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) })
  return null
}
function Recenter({ pos }) {
  const map = useMap()
  useEffect(() => { if (pos) map.setView(pos, Math.max(map.getZoom(), 15)) }, [pos?.[0], pos?.[1]]) // eslint-disable-line
  return null
}

/** Click-to-place map. `value` = { latitude, longitude } (strings or numbers). */
export default function MapPicker({ value, onChange, height = 260 }) {
  const lat = parseFloat(value?.latitude)
  const lng = parseFloat(value?.longitude)
  const pos = Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null

  return (
    <div className="overflow-hidden rounded-xl border border-line" style={{ height }}>
      <MapContainer center={pos || SOWETO} zoom={pos ? 15 : 12} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
        <Clicks onPick={(la, ln) => onChange({ latitude: +la.toFixed(6), longitude: +ln.toFixed(6) })} />
        <Recenter pos={pos} />
        {pos && <Marker position={pos} icon={pin} />}
      </MapContainer>
    </div>
  )
}
