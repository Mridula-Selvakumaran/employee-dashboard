# Employee Insights Dashboard

This is a 4-screen employee dashboard built with React and Vite. The idea was to keep things close to the metal, no UI libraries, no chart libraries, no virtualization helpers. Just React, raw CSS, and browser APIs.

The app starts with a login screen. Credentials are hardcoded (`testuser` / `Test123`) and validated through a Context API auth provider. The session is saved in `localStorage` so refreshing doesn't kick you out. If you try typing `/list` directly without being logged in, you get redirected back automatically.

Once in, you see a list of employees fetched from the backend via a POST request. The response comes back as a nested array and I parse out the name, city, and salary from specific indexes. The list is rendered through a custom virtual grid I wrote from scratch — the math works by dividing `scrollTop` by `itemHeight` to figure out which rows are visible, then rendering only that slice with a `translateY` offset so they appear at the right position. A spacer div holds the full computed height to keep the scrollbar looking natural.

Clicking on an employee takes you to the verification page. The webcam is pulled in through `navigator.mediaDevices.getUserMedia`. There are two canvas elements stacked on top of each other — one captures a still from the video stream, and the other sits transparently on top and tracks mouse movement to let you draw a signature. When you submit, I create a third canvas off-screen, draw the photo first and then the signature on top, and export the whole thing as a Base64 PNG using `toDataURL`. That gets saved to `localStorage`.

The results page pulls that image back out and shows it alongside an SVG bar chart and a Leaflet map. The chart is built entirely from `<rect>` and `<text>` SVG elements — no Chart.js, no D3. The map uses a hardcoded dictionary to look up city coordinates since all the cities in the dataset are known. The verified employee's city gets highlighted in red on both the chart and the map, and their location marker opens automatically.

---

## Intentional Bug: Stale Closure in Scroll Listener

This is in `src/components/VirtualGrid.jsx`, inside the `useEffect` that attaches the scroll listener.

The dependency array is intentionally left empty `[]`. This means the `handleScroll` function is created once at mount time and permanently captures `lastScroll` at its initial value of `0`. So when scrolling happens and the code runs `scrollDiff = currentScroll - lastScroll`, `lastScroll` never updates inside that closure — it's always `0`. The throttle check `if (Math.abs(scrollDiff) > 10)` ends up being true on nearly every scroll event, so `setScrollTop` fires way more often than it should, causing excessive re-renders and completely defeating the optimization.

I added a visible render counter above the grid so you can watch the number climb while scrolling and see the bug in action.