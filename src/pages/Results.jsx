import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const cityCoords = {
  "Edinburgh": [55.9533, -3.1883],
  "Tokyo": [35.6762, 139.6503],
  "San Francisco": [37.7749, -122.4194],
  "New York": [40.7128, -74.0060],
  "London": [51.5074, -0.1278],
  "Sidney": [-33.8688, 151.2093],
  "Singapore": [1.3521, 103.8198]
}

function Results() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const auditImg = localStorage.getItem('auditImage')

  useEffect(() => {
    fetch('https://backend.jotish.in/backend_dev/gettabledata.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: "test", password: "123456" })
    })
      .then(r => r.json())
      .then(json => {
        if (json && json.TABLE_DATA && json.TABLE_DATA.data) {
          const parsed = json.TABLE_DATA.data.map((r, i) => ({
            id: i,
            name: r[0],
            city: r[2],
            salary: r[5].replace(/[^0-9.-]+/g, "")
          }))
          setData(parsed)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const cityStats = {}
  let verifiedUserCity = null
  const verifiedUserId = localStorage.getItem('verifiedUserId')

  data.forEach(item => {
    const c = item.city || "Unknown"
    const s = parseFloat(item.salary) || 0
    if (!cityStats[c]) {
      cityStats[c] = { sum: 0, count: 0 }
    }
    cityStats[c].sum += s
    cityStats[c].count += 1

    if (verifiedUserId !== null && item.id.toString() === verifiedUserId) {
      verifiedUserCity = c
    }
  })

  const chartData = Object.keys(cityStats).map(c => ({
    city: c,
    avg: cityStats[c].sum / cityStats[c].count
  }))

  const maxAvg = Math.max(...chartData.map(d => d.avg), 1)

  return (
    <div className="container">
      <div className="header">
        <span className="header-title">Final Audit & Analytics</span>
      </div>

      <div className="panel">
        <h3>1. Merged Signature File</h3>
        {auditImg ? (
          <div style={{ marginTop: '10px' }}>
            <img src={auditImg} alt="Audit Merged" style={{ border: '1px solid #000', display: 'block' }} />
          </div>
        ) : (
          <div className="error">No audit image found in storage.</div>
        )}
      </div>

      {loading && (
        <div className="panel" style={{ textAlign: 'center' }}>
          <p>Retrieving Data...</p>
        </div>
      )}

      {!loading && chartData.length > 0 && (
        <div className="panel">
          <h3>2. Salary Distribution (SVG Chart)</h3>

          <div style={{ overflowX: 'auto', marginTop: '20px' }}>
            <svg width={Math.max(600, chartData.length * 60 + 20)} height="300" style={{ background: '#f4f4f4', border: '1px solid #ccc' }}>
              {chartData.map((d, i) => {
                const barWidth = 40
                const gap = 20
                const xInfo = i * (barWidth + gap) + 20
                const rectHeight = (d.avg / maxAvg) * 250
                const yInfo = 280 - rectHeight
                const isVerifiedCity = d.city === verifiedUserCity

                return (
                  <g key={d.city}>
                    <rect
                      x={xInfo}
                      y={yInfo}
                      width={barWidth}
                      height={rectHeight}
                      fill={isVerifiedCity ? '#d9534f' : 'var(--primary)'}
                      stroke={isVerifiedCity ? '#c9302c' : '#004085'}
                    />
                    <text x={xInfo} y={295} fontSize="12" fill={isVerifiedCity ? '#d9534f' : '#333'} fontFamily="Arial" fontWeight={isVerifiedCity ? 'bold' : 'normal'}>
                      {d.city.substring(0, 6)}
                    </text>
                    <text x={xInfo} y={yInfo - 5} fontSize="11" fill="#666" fontFamily="Arial">
                      ${Math.round(d.avg / 1000)}k
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>
      )}

      {!loading && (
        <div className="panel">
          <h3>3. Geographic Mapping</h3>
          <div style={{ height: '400px', width: '100%', marginTop: '15px' }}>
            <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {chartData.map(d => {
                const coords = cityCoords[d.city]
                if (!coords) return null
                const isVerifiedCity = d.city === verifiedUserCity

                return (
                  <Marker
                    key={d.city}
                    position={coords}
                    eventHandlers={{
                      add: (e) => {
                        if (isVerifiedCity) {
                          e.target.openPopup();
                          // Adjust icon color for verified city manually via CSS filter if needed, 
                          // but the prompt just wants it "red highlighted". 
                          // For a simple fix without custom icons, we'll use a CSS filter on the icon.
                          e.target._icon.style.filter = "hue-rotate(150deg) brightness(0.8) saturate(3)";
                        }
                      }
                    }}
                  >
                    <Popup>
                      <strong style={{ color: isVerifiedCity ? '#d9534f' : '#000' }}>{d.city} {isVerifiedCity ? '(Verified Location)' : ''}</strong><br />
                      Avg Salary: ${Math.round(d.avg).toLocaleString()}
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  )
}

export default Results
