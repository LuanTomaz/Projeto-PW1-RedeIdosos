import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type LocationPickerMapProps = {
  latitude?: number | null;
  longitude?: number | null;
  onChange: (latitude: number, longitude: number) => void;
  height?: number;
};

const DEFAULT_CENTER: [number, number] = [-23.555771, -46.639557];
const DEFAULT_ZOOM = 13;

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

function SetViewOnChange({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom() || DEFAULT_ZOOM);
  }, [center, map]);
  return null;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  onChange,
  height = 260,
}: LocationPickerMapProps) {
  const hasCoords = Number.isFinite(latitude) && Number.isFinite(longitude);
  const center: [number, number] = hasCoords
    ? [latitude as number, longitude as number]
    : DEFAULT_CENTER;

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <MapContainer center={center} zoom={DEFAULT_ZOOM} style={{ height, width: '100%' }} className="z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SetViewOnChange center={center} />
        <MapClickHandler onPick={onChange} />
        {hasCoords && <Marker position={center} />}
      </MapContainer>
    </div>
  );
}
