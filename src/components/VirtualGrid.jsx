import { useState, useEffect, useRef } from 'react'

function VirtualGrid({ data, itemHeight, containerHeight, renderItem }) {
  const [scrollTop, setScrollTop] = useState(0)
  const [lastScroll, setLastScroll] = useState(0)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleScroll = (e) => {
      const currentScroll = e.target.scrollTop
      // INTENTIONAL STALE CLOSURE BUG: lastScroll is always 0 inside this closure
      const scrollDiff = currentScroll - lastScroll

      console.log(`[Stale Closure Bug] currentScroll: ${currentScroll}, lastScroll in closure: ${lastScroll}, diff: ${scrollDiff}`);

      if (Math.abs(scrollDiff) > 10) {
        setScrollTop(currentScroll)
        setLastScroll(currentScroll)
      }
    }

    const el = containerRef.current
    if (el) el.addEventListener('scroll', handleScroll)
    return () => {
      if (el) el.removeEventListener('scroll', handleScroll)
    }
  }, []) // Missing lastScroll, scrollTop, data (Stale closure vulnerability)

  const totalHeight = data.length * itemHeight
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2) // small buffer
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 4
  const endIndex = Math.min(data.length, startIndex + visibleCount)

  const visibleItems = data.slice(startIndex, endIndex)
  const offsetY = startIndex * itemHeight

  // showing the bug on the screen
  const renderCountRef = useRef(0)
  renderCountRef.current += 1

  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffeeba', color: '#856404', marginBottom: '10px', fontSize: '14px', fontFamily: 'monospace' }}>
        <strong>Bug Monitor:</strong> VirtualGrid Render Count: {renderCountRef.current} <br />
        <small>(Notice how fast this spins up during scrolling due to the Stale Closure bug explicitly breaking the throttling math)</small>
      </div>
      <div
        ref={containerRef}
        style={{
          height: `${containerHeight}px`,
          overflowY: 'auto',
          position: 'relative',
          border: '1px solid #ccc',
          backgroundColor: '#fff'
        }}
      >
        <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${offsetY}px)`
          }}>
            {visibleItems.map((item, index) => renderItem(item, startIndex + index))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VirtualGrid
