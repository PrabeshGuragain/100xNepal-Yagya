import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface ArLocation {
  id: number;
  name: string;
  description: string;
  type: string;
  modelUrl?: string | null;
  modelScale?: string | null;
  lat: number;
  lng: number;
}

const fallbackLocations: ArLocation[] = [
  {
    id: 1,
    name: "Location 1",
    description: "AR Experience Point 1",
    type: "AR Marker",
    lat: 27.7263058,
    lng: 85.3560134
  },
  {
    id: 2,
    name: "Location 2",
    description: "AR Experience Point 2",
    type: "AR Marker",
    lat: 27.7263058,
    lng: 85.3559119
  },
  {
    id: 3,
    name: "Location 3",
    description: "AR Experience Point 3",
    type: "AR Marker",
    lat: 27.7263957,
    lng: 85.3559119
  }
];

const ArLocationMap: React.FC = () => {
  const [locations, setLocations] = useState<ArLocation[]>(fallbackLocations);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/ar-locations/locations")
      .then((res) => res.json())
      .then((data: ArLocation[]) => {
        if (data && data.length > 0) {
          setLocations(data);
        }
      })
      .catch((err) => {
        console.error("Error fetching locations:", err);
        setError("Using fallback locations");
      });
  }, []);

  const defaultCenter: [number, number] = [27.7263058, 85.3559119];

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {error && (
        <div style={{ padding: "10px", background: "#fff3cd", color: "#856404" }}>
          {error}
        </div>
      )}
      <MapContainer
        center={defaultCenter}
        zoom={16}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        />

        {locations.map((loc) => (
          <Marker key={loc.id} position={[loc.lat, loc.lng]}>
            <Popup>
              <strong>{loc.name}</strong>
              <br />
              {loc.description}
              <br />
              Type: {loc.type}
              <br />
              <button
                onClick={() => window.location.href = `https://qqp5w08x-5501.inc1.devtunnels.ms/`}
                style={{
                  marginTop: "8px",
                  padding: "8px 16px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                View in AR
              </button>
              {loc.modelUrl && (
                <>
                  <br />
                  <a href={loc.modelUrl} target="_blank" rel="noreferrer">
                    View Model
                  </a>
                </>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ArLocationMap;