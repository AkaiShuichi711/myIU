import { reportSessionLocation } from '@/lib/appwrite/api';

/**
 * Requests the browser's location permission once (right after login — see
 * AuthCallback.tsx) and, if granted, reports the coordinates so the backend
 * can resolve them down to province/district/ward via reverse geocoding.
 *
 * Fire-and-forget: does not return a promise the caller needs to await, does
 * not throw, and never blocks navigation. If the user denies the permission
 * prompt (or the browser has no geolocation support), this simply does
 * nothing — the session already has IP-based country/city from login.
 */
export function requestAndReportGeoLocation() {
  if (!('geolocation' in navigator)) return;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      reportSessionLocation(position.coords.latitude, position.coords.longitude);
    },
    () => {
      // Denied, timed out, or position unavailable — fine, IP fallback stands.
    },
    { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 }
  );
}
