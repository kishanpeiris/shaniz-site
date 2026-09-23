import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { apiGet } from '../../api/client.js'

// Bundlers (Vite included) break Leaflet's default marker icon, because
// Leaflet's own CSS points at relative image paths that don't survive
// bundling — the well-known fix is pointing it at the actual bundled
// asset URLs instead. Without this, the pin silently doesn't render.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow })

const SRI_LANKA_CENTER = [7.8731, 80.7718] // roughly the geographic center of the country — a sensible default zoom target when no branch has coordinates yet

// A branch location picker: a real click-to-place map (drag the pin, or
// click anywhere to move it) plus a "Find on map" button that geocodes
// the typed address via the backend (see branches.routes.js — uses
// OpenStreetMap's free Nominatim, no API key). Either method just
// updates the same lat/lng fields, so admins can use whichever is more
// convenient and fine-tune with the other.
export default function LocationPicker({ latitude, longitude, address, onChange }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const [geocoding, setGeocoding] = useState(false)
  const [geocodeError, setGeocodeError] = useState('')

  // Initialize the map once. Re-running this on every keystroke in the
  // form would tear down and rebuild the whole map, which is both
  // wasteful and visually jarring (the pin would jump/flash) — so this
  // effect intentionally has an empty dependency array and reads
  // latitude/longitude only for the ONE-TIME initial marker position.
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const hasCoords = latitude !== '' && longitude !== '' && latitude != null && longitude != null
    const startCenter = hasCoords ? [Number(latitude), Number(longitude)] : SRI_LANKA_CENTER
    const startZoom = hasCoords ? 15 : 8

    const map = L.map(mapContainerRef.current).setView(startCenter, startZoom)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    const marker = L.marker(startCenter, { draggable: true }).addTo(map)
    marker.on('dragend', () => {
      const pos = marker.getLatLng()
      onChange(pos.lat, pos.lng)
    })
    map.on('click', (e) => {
      marker.setLatLng(e.latlng)
      onChange(e.latlng.lat, e.latlng.lng)
    })

    mapRef.current = map
    markerRef.current = marker

    // Leaflet measures its container's size on init — if this component
    // mounts inside something still animating open (e.g. the edit-row
    // toggle), the container can be 0×0 at that instant, freezing the
    // map at the wrong size until the window is resized. One
    // invalidateSize() shortly after mount covers that.
    setTimeout(() => map.invalidateSize(), 100)

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // If the coordinates change from OUTSIDE this component (the "Find on
  // map" geocode result, or the parent form loading different initial
  // values), move the marker AND recenter the map. But if the change
  // came from the user's own click/drag on the map, the marker is
  // already sitting exactly there — recentering anyway would jump the
  // view right after their own click, which feels broken rather than
  // helpful. Distinguishing the two: compare the marker's current
  // position to the incoming one first.
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return
    if (latitude === '' || longitude === '' || latitude == null || longitude == null) return
    const newPos = L.latLng(Number(latitude), Number(longitude))
    const currentPos = markerRef.current.getLatLng()
    const cameFromMapItself = currentPos.distanceTo(newPos) < 1 // metres — effectively identical
    markerRef.current.setLatLng(newPos)
    if (!cameFromMapItself) {
      mapRef.current.setView(newPos, Math.max(mapRef.current.getZoom(), 14))
    }
  }, [latitude, longitude])

  const findOnMap = async () => {
    if (!address || !address.trim()) {
      setGeocodeError('Type an address above first.')
      return
    }
    setGeocoding(true)
    setGeocodeError('')
    try {
      const result = await apiGet(`/api/branches/geocode?address=${encodeURIComponent(address)}`)
      onChange(result.latitude, result.longitude)
    } catch (err) {
      setGeocodeError(err.message)
    } finally {
      setGeocoding(false)
    }
  }

  return (
    <div className="col-span-2 md:col-span-5">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={findOnMap}
          disabled={geocoding}
          className="rounded-full border border-forestDeep/30 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-forestDeep hover:bg-forestDeep hover:text-cream disabled:opacity-50"
        >
          {geocoding ? 'Finding…' : 'Find on map from address'}
        </button>
        <p className="text-[0.7rem] text-[#6a6656]">…or click/drag the pin directly.</p>
      </div>
      {geocodeError && <p className="mb-2 text-xs text-[#a35a3a]">{geocodeError}</p>}
      <div ref={mapContainerRef} className="h-80 w-full overflow-hidden rounded-sm border border-gold/30 md:h-[28rem]" />
    </div>
  )
}
