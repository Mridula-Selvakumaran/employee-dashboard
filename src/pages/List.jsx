import { useState, useEffect } from 'react'
import VirtualGrid from '../components/VirtualGrid'
import { useNavigate } from 'react-router-dom'

function List() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://backend.jotish.in/backend_dev/gettabledata.php',{
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({username:"test", password:"123456"})
        })
        const json = await res.json()
        if(json && json.TABLE_DATA && json.TABLE_DATA.data) {
          const parsed = json.TABLE_DATA.data.map((r, i) => ({
            id: i,
            name: r[0],
            city: r[2],
            salary: r[5].replace(/[^0-9.-]+/g, "")
          }))
          setData(parsed)
        }
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const renderRow = (item, index) => {
    return (
      <div 
        key={item.id || index} 
        onClick={() => navigate(`/details/${item.id || index}`)}
        className="list-row"
      >
        <span>{item.name || `Employee ${index}`}</span>
        <span>{item.city}</span>
        <span>${parseFloat(item.salary).toLocaleString()}</span>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <span className="header-title">Employee Database</span>
      </div>
      <h2>Employee List</h2>
      <p>Click on any employee row to proceed with Identity Verification.</p>

      {loading ? (
        <div className="panel" style={{ textAlign: 'center' }}>
           <p>Loading records...</p>
        </div>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          <div className="list-header">
            <span>Name</span>
            <span style={{textAlign: 'center'}}>City</span>
            <span style={{textAlign: 'right'}}>Salary</span>
          </div>
          <VirtualGrid 
            data={data} 
            itemHeight={50} 
            containerHeight={500} 
            renderItem={renderRow} 
          />
        </div>
      )}
    </div>
  )
}

export default List
