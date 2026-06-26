// js/h3utils.js
// ============================================================
//  H3 SPATIAL UTILITIES  —  Macro Rides
// ============================================================

const H3Utils = (() => {

  /**
   * Convert a route (array of [lat,lng]) into a set of H3 cells
   * at the given resolution. Each segment is expanded by sampling
   * every ~50 m, then we disk-expand each cell by k-rings to cover
   * the buffer radius.
   */
  function routeToCells(routeCoords, bufferMetres, resolution) {
    const cellSet = new Set();
    const kRings   = metresToKRings(bufferMetres, resolution);

    for (let i = 0; i < routeCoords.length; i++) {
      const [lat, lng] = routeCoords[i];
      const centerCell = h3.latLngToCell(lat, lng, resolution);
      const neighbors  = h3.gridDisk(centerCell, kRings);
      neighbors.forEach(c => cellSet.add(c));
    }

    return [...cellSet];
  }

  /**
   * Estimate how many k-rings cover bufferMetres at a given resolution.
   * h3.getHexagonEdgeLengthAvg gives edge length in m.
   */
  function metresToKRings(bufferMetres, resolution) {
    const edgeLen = h3.getHexagonEdgeLengthAvg(resolution, 'm');
    // Approx cell width ≈ 2 × edge length
    return Math.max(1, Math.ceil(bufferMetres / (edgeLen * 2)));
  }

  /**
   * Returns true if the point [lat, lng] falls inside any of the given H3 cells.
   */
  function pointInCells(lat, lng, cells, resolution) {
    const cell = h3.latLngToCell(lat, lng, resolution);
    return cells.includes(cell);
  }

  /**
   * Convert H3 cell boundaries to Leaflet polygon arrays.
   * Returns array of [[lat,lng], ...] per cell.
   */
  function cellsToPolygons(cells) {
    return cells.map(cell => {
      const boundary = h3.cellToBoundary(cell);
      return boundary.map(([lat, lng]) => [lat, lng]);
    });
  }

  /**
   * Haversine distance in metres between two [lat,lng] points.
   */
  function haversine([lat1, lon1], [lat2, lon2]) {
    const R  = 6371000;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a  = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  /**
   * Total route length in km.
   */
  function routeLength(coords) {
    let total = 0;
    for (let i = 1; i < coords.length; i++) {
      total += haversine(coords[i-1], coords[i]);
    }
    return (total / 1000).toFixed(2);
  }

  /**
   * Minimum distance from a point to any segment of the route (metres).
   */
  function minDistToRoute(lat, lng, route) {
    let minDist = Infinity;
    for (let i = 1; i < route.length; i++) {
      const d = pointToSegmentDist([lat, lng], route[i-1], route[i]);
      if (d < minDist) minDist = d;
    }
    return minDist;
  }

  /**
   * Distance from point P to segment AB (all [lat,lng]), in metres.
   * Uses a simplified planar approximation — accurate for small distances.
   */
  function pointToSegmentDist(P, A, B) {
    const [py, px] = P;
    const [ay, ax] = A;
    const [by, bx] = B;
    const dx = bx - ax, dy = by - ay;
    const lenSq = dx*dx + dy*dy;
    if (lenSq === 0) return haversine(P, A);
    const t = Math.max(0, Math.min(1, ((px-ax)*dx + (py-ay)*dy) / lenSq));
    return haversine(P, [ay + t*dy, ax + t*dx]);
  }

  return { routeToCells, cellsToPolygons, pointInCells, haversine, routeLength, minDistToRoute };
})();
