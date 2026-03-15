import { useRef, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function Details() {
  const { id } = useParams()
  const navigate = useNavigate()

  const videoRef = useRef(null)
  const photoCanvasRef = useRef(null)
  const signCanvasRef = useRef(null)
  const [hasPhoto, setHasPhoto] = useState(false)
  const [stream, setStream] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(s => {
        setStream(s)
        if (videoRef.current) {
          videoRef.current.srcObject = s
        }
      })
      .catch(err => console.error('Camera Access Error:', err))

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  const takePhoto = () => {
    const w = 320
    const h = 240
    photoCanvasRef.current.width = w
    photoCanvasRef.current.height = h
    signCanvasRef.current.width = w
    signCanvasRef.current.height = h

    let ctx = photoCanvasRef.current.getContext('2d')
    ctx.drawImage(videoRef.current, 0, 0, w, h)
    setHasPhoto(true)
  }

  const startDraw = (e) => {
    setIsDrawing(true)
    draw(e)
  }

  const endDraw = () => {
    setIsDrawing(false)
    let ctx = signCanvasRef.current.getContext('2d')
    ctx.beginPath()
  }

  const draw = (e) => {
    if (!isDrawing) return
    let ctx = signCanvasRef.current.getContext('2d')
    const rect = signCanvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#d9534f'
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const mergeImages = () => {
    const canvas = document.createElement('canvas')
    const w = 320
    const h = 240
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')

    ctx.drawImage(photoCanvasRef.current, 0, 0, w, h)
    ctx.drawImage(signCanvasRef.current, 0, 0, w, h)

    const finalData = canvas.toDataURL('image/png')
    localStorage.setItem('auditImage', finalData)
    localStorage.setItem('verifiedUserId', id)
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    navigate('/result')
  }

  return (
    <div className="container">
      <div className="header">
        <span className="header-title">Identity Verification</span>
      </div>

      <h2>Verification for ID: #{id}</h2>
      <p>Please capture a photo from your webcam and provide your signature.</p>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
        <div className="panel" style={{ flex: '1', minWidth: '340px' }}>
          <h3>Step 1: Camera</h3>
          <div style={{ border: '1px solid var(--border-color)', marginBottom: '10px', background: '#000', width: '320px', height: '240px' }}>
            <video ref={videoRef} autoPlay playsInline width="320" height="240" />
          </div>
          <button className="btn" onClick={takePhoto}>
            Capture Image
          </button>
        </div>

        <div className="panel" style={{ flex: '1', minWidth: '340px' }}>
          <h3>Step 2: Signature Overlay</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>Draw directly on the captured image.</p>

          <div style={{
            position: 'relative',
            width: '320px',
            height: '240px',
            background: '#eee',
            border: '1px solid var(--border-color)'
          }}>
            <canvas
              ref={photoCanvasRef}
              style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, display: hasPhoto ? 'block' : 'none' }}
            />
            <canvas
              ref={signCanvasRef}
              onMouseDown={startDraw}
              onMouseUp={endDraw}
              onMouseMove={draw}
              style={{
                position: 'absolute',
                top: 0, left: 0,
                zIndex: 2,
                cursor: 'crosshair',
                display: hasPhoto ? 'block' : 'none'
              }}
            />
            {!hasPhoto && (
              <div style={{ padding: '100px 0', textAlign: 'center', color: '#999' }}>
                No Image Captured
              </div>
            )}
          </div>

          {hasPhoto && (
            <button className="btn" style={{ marginTop: '15px', backgroundColor: 'var(--success-color)', borderColor: '#4cae4c' }} onClick={mergeImages}>
              Submit Data
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Details
