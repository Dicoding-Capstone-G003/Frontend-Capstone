import Papa from "papaparse";

// Generic: CSV dengan header baris pertama
export async function fetchCsv(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  const text = await res.text();

  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  return parsed.data;
}

// Khusus cities.csv (header: city,Latitude,Longitude)
export async function fetchCities(url) {
  const rows = await fetchCsv(url);

  return rows
    .filter((r) => r.city && r.Latitude != null && r.Longitude != null)
    .map((r) => ({
      city: String(r.city).trim(),
      lat: Number(r.Latitude),
      lon: Number(r.Longitude),
    }))
    .filter((r) => r.city && Number.isFinite(r.lat) && Number.isFinite(r.lon));
}