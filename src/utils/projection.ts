/**
 * High-Performance Mathematical Equirectangular (Plate Carrée) Projection Engine
 * Includes Antimeridian wrapping mitigation, precision rounding, and coordinate interpolation.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

/**
 * Normalizes longitude strictly within [-180, 180] degrees
 */
export function normalizeLongitude(lonDeg: number): number {
  let lon = lonDeg % 360;
  if (lon > 180) {
    lon -= 360;
  } else if (lon < -180) {
    lon += 360;
  }
  return Number(lon.toFixed(6));
}

/**
 * Normalizes latitude strictly within [-90, 90] degrees
 */
export function normalizeLatitude(latDeg: number): number {
  const clamped = Math.max(-90, Math.min(90, latDeg));
  return Number(clamped.toFixed(6));
}

/**
 * Converts Geographic Coordinates (degrees) to Equirectangular Screen Coordinates (pixels).
 *
 * Mathematical formulas:
 * x = ((lambda - lambda_0) / PI) * (W / 2) + W / 2
 * y = H / 2 - (phi / PI) * (H / 2)
 *
 * where:
 * lambda = longitude in radians
 * phi = latitude in radians
 * lambda_0 = central meridian in radians (default 0)
 * W = canvas width, H = canvas height
 */
export function geoToEquirectangular(
  latDeg: number,
  lngDeg: number,
  width: number,
  height: number,
  centralMeridianDeg = 0
): Point2D {
  const normLat = normalizeLatitude(latDeg);
  const normLng = normalizeLongitude(lngDeg);
  const normCentralMeridian = normalizeLongitude(centralMeridianDeg);

  const phi = (normLat * Math.PI) / 180;
  const lambda = (normLng * Math.PI) / 180;
  const lambda0 = (normCentralMeridian * Math.PI) / 180;

  // Exact Plate Carrée formulation
  let deltaLambda = lambda - lambda0;
  // Handle wrapping around [-PI, PI]
  if (deltaLambda > Math.PI) deltaLambda -= 2 * Math.PI;
  if (deltaLambda < -Math.PI) deltaLambda += 2 * Math.PI;

  const x = (deltaLambda / Math.PI) * (width / 2) + width / 2;
  const y = height / 2 - (phi / (Math.PI / 2)) * (height / 2);

  return {
    x: Number(x.toFixed(3)),
    y: Number(y.toFixed(3)),
  };
}

/**
 * Inverse Equirectangular projection: Converts canvas (x, y) to (lat, lng) in degrees
 */
export function equirectangularToGeo(
  x: number,
  y: number,
  width: number,
  height: number,
  centralMeridianDeg = 0
): GeoCoordinate {
  const lambda0 = (normalizeLongitude(centralMeridianDeg) * Math.PI) / 180;
  const deltaLambda = ((x - width / 2) / (width / 2)) * Math.PI;
  const lambda = lambda0 + deltaLambda;
  const phi = ((height / 2 - y) / (height / 2)) * (Math.PI / 2);

  const lat = (phi * 180) / Math.PI;
  const lng = (lambda * 180) / Math.PI;

  return {
    lat: normalizeLatitude(lat),
    lng: normalizeLongitude(lng),
  };
}

/**
 * Splits a list of geographic coordinates into continuous segments to prevent
 * erroneous streak lines across the map when crossing the 180th meridian (Antimeridian).
 */
export function splitAntimeridianSegments(
  coords: GeoCoordinate[],
  thresholdDeg = 170
): GeoCoordinate[][] {
  if (!coords || coords.length === 0) return [];
  const segments: GeoCoordinate[][] = [];
  let currentSegment: GeoCoordinate[] = [coords[0]];

  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const deltaLon = Math.abs(curr.lng - prev.lng);

    // If step crosses the antimeridian threshold (e.g. from +179 to -179)
    if (deltaLon > thresholdDeg) {
      if (currentSegment.length > 0) {
        segments.push(currentSegment);
      }
      currentSegment = [curr];
    } else {
      currentSegment.push(curr);
    }
  }

  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }

  return segments;
}

/**
 * High-precision Linear Interpolation (LERP) between two numbers
 */
export function lerp(start: number, end: number, t: number): number {
  return Number((start + (end - start) * Math.max(0, Math.min(1, t))).toFixed(6));
}

/**
 * Interpolates two geographic coordinates along the shortest longitude path
 */
export function lerpGeo(
  start: GeoCoordinate,
  end: GeoCoordinate,
  t: number
): GeoCoordinate {
  const lat = lerp(start.lat, end.lat, t);

  let startLng = start.lng;
  let endLng = end.lng;

  // Shortest path around antimeridian
  const diff = endLng - startLng;
  if (diff > 180) {
    endLng -= 360;
  } else if (diff < -180) {
    endLng += 360;
  }

  const interpolatedLng = normalizeLongitude(lerp(startLng, endLng, t));

  return {
    lat: normalizeLatitude(lat),
    lng: interpolatedLng,
  };
}
