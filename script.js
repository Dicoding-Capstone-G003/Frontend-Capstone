const indonesiaBounds = L.latLngBounds([-11.0, 94.0], [6.0, 141.0]);

const map = L.map('map', { 
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    touchZoom: false,
    keyboard: false,
    maxBounds: indonesiaBounds, 
    maxBoundsViscosity: 1.0
}).setView([-8.5, 119], 6);

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

const locations = {
    "Papua": [-4.2, 138], 
    "Maluku": [-3.7, 129], 
    "Nusa Tenggara": [-8.5, 119],
    "Sulawesi": [-1.5, 120], 
    "Kalimantan": [0.5, 114], 
    "Jawa": [-7.5, 110], 
    "Sumatra": [0, 102]
};

let marker = L.marker([-8.5, 119]).addTo(map);

document.getElementById("region").addEventListener("change", function() {
    const coord = locations[this.value];
    map.flyTo(coord, 7, { duration: 1.5 });
    marker.setLatLng(coord);
});

const ctx = document.getElementById('chart').getContext('2d');

const gradient = ctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0, 'rgba(245, 158, 11, 0.5)'); 
gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');

new Chart(ctx, {
    type: 'line',
    data: {
        labels: ["02:00","04:00","06:00","08:00","10:00","12:00","14:00","16:00","18:00"],
        datasets: [{
            label: "Produksi (kWh)",
            data: [0, 0.1, 1.2, 2.5, 2.8, 2.3, 1.0, 0.2, 0],
            borderColor: '#f59e0b',
            borderWidth: 3,
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#f59e0b',
            pointHoverRadius: 7
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0f172a',
                titleFont: { family: 'Inter' },
                padding: 12,
                cornerRadius: 8
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#f1f5f9' },
                ticks: { font: { family: 'Inter' } }
            },
            x: {
                grid: { display: false },
                ticks: { font: { family: 'Inter' } }
            }
        }
    }
});