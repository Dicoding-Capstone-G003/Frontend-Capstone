import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

import { fetchCsv, fetchCities } from "./lib/csv";
import { DEFAULT_PR, pvKwhDayFromGhiWhM2, round2 } from "./lib/pv";

// Fix default marker icon (Vite sering bikin icon hilang)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function App() {
  const [cities, setCities] = useState([]);
  const [statsByCity, setStatsByCity] = useState({});
  const [selectedCity, setSelectedCity] = useState(null);
  const [kWp, setKWp] = useState(1);

  // Load CSV from public/
  useEffect(() => {
    (async () => {
      const cityRows = await fetchCsv("/cities.csv");
      const statRows = await fetchCsv("/city_summary.csv");

      console.log(cityRows)

      // normalize cities
      const cityData = cityRows.map((r) => ({
        city: r.city,
        lat: parseFloat(r.Latitude),
        lon: parseFloat(r.Longitude),
      }));

      // stats map
      const map = {};
      for (const r of statRows) {
        if (!r.city) continue;
        map[String(r.city)] = {
          ghi_peak: Number(r.ghi_day_wh_m2_peak),
          ghi_avg: Number(r.ghi_day_wh_m2_avg),
          ghi_low: Number(r.ghi_day_wh_m2_low),
          reliability: Number(r.reliability_index),
        };
      }

      setCities(cityData);
      setStatsByCity(map);

      // default select first city
      if (cityData.length) setSelectedCity(cityData[0].city);
    })().catch((err) => {
      console.error(err);
      alert("Gagal load CSV. Cek console & pastikan file ada di public/.");
    });
  }, []);

  const selected = useMemo(() => {
    if (!selectedCity) return null;
    const city = cities.find((c) => c.city === selectedCity);
    const stats = statsByCity[selectedCity];
    if (!city) return null;
    return { ...city, stats };
  }, [selectedCity, cities, statsByCity]);

  const pv = useMemo(() => {
    if (!selected?.stats) return null;
    const { ghi_peak, ghi_avg, ghi_low } = selected.stats;
    return {
      peak: pvKwhDayFromGhiWhM2(ghi_peak, kWp, DEFAULT_PR),
      avg: pvKwhDayFromGhiWhM2(ghi_avg, kWp, DEFAULT_PR),
      low: pvKwhDayFromGhiWhM2(ghi_low, kWp, DEFAULT_PR),
    };
  }, [selected, kWp]);

  // Center map Jawa + Bali
  const defaultCenter = [-7.2, 110.3];

  return (
    <div className="app">
      <aside className="sidebar">
        <h1 className="h1">Solar PV Indonesia — MVP</h1>
        <div className="muted">
          PR default = <b>{DEFAULT_PR}</b> • Data source: NASA POWER (historical)
        </div>

        <div className="label">Pilih kota</div>
        <select
          className="select"
          value={selectedCity || ""}
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          {cities.map((c) => (
            <option key={c.city} value={c.city}>
              {c.city}
            </option>
          ))}
        </select>

        <div className="label">Pilih ukuran sistem (kWp)</div>
        <select
          className="select"
          value={kWp}
          onChange={(e) => setKWp(Number(e.target.value))}
        >
          <option value={1}>1 kWp</option>
          <option value={3}>3 kWp</option>
          <option value={5}>5 kWp</option>
        </select>

        <div className="card">
          <div className="muted">Kota terpilih</div>
          <div className="big">{selected?.city || "-"}</div>
          <div className="muted">
            {selected ? `${selected.lat.toFixed(4)}, ${selected.lon.toFixed(4)}` : ""}
          </div>
        </div>

        <div className="card">
          <div className="muted">Estimasi PV (kWh/day)</div>

          <div className="row">
            <div>Peak</div>
            <div>
              <b>{pv ? round2(pv.peak) : "-"}</b>
            </div>
          </div>
          <div className="row">
            <div>Average</div>
            <div>
              <b>{pv ? round2(pv.avg) : "-"}</b>
            </div>
          </div>
          <div className="row">
            <div>Low</div>
            <div>
              <b>{pv ? round2(pv.low) : "-"}</b>
            </div>
          </div>

          <div className="muted" style={{ marginTop: 10 }}>
            Rumus: (GHI_day_Wh/m² ÷ 1000) × kWp × PR
          </div>
        </div>

        <div className="card">
          <div className="muted">Reliability Index (low/peak)</div>
          <div className="big">
            {selected?.stats?.reliability != null ? round2(selected.stats.reliability) : "-"}
          </div>
        </div>

        <div className="muted" style={{ marginTop: 12 }}>
          Tip: klik marker di map buat lihat popup cepat.
        </div>
      </aside>

      <main className="map">
        <MapContainer center={defaultCenter} zoom={7} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {cities.map((c) => {
            const s = statsByCity[c.city];
            const popupText = s ? `Reliability: ${round2(s.reliability)}` : "No stats";
            return (
              <Marker
                key={c.city}
                position={[c.lat, c.lon]}
                eventHandlers={{
                  click: () => setSelectedCity(c.city),
                }}
              >
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <b>{c.city}</b>
                    <div className="muted">{popupText}</div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </main>
    </div>
  );
}