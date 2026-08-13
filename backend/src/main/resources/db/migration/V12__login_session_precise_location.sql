-- ─────────────────────────────────────────────────────────────────
--  Precise location for login sessions — opt-in via browser GPS.
--
--  IP-based lookup (country/city, existing columns) tops out at
--  city-level accuracy — ISPs don't allocate IP blocks fine enough
--  to reach district/ward. These new columns are only populated when
--  the user grants browser location permission after login; reverse
--  geocoding then resolves lat/lng down to province/district/ward.
--  NULL until/unless that happens — falls back to country/city.
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE login_sessions
    ADD COLUMN latitude  DOUBLE PRECISION,
    ADD COLUMN longitude DOUBLE PRECISION,
    ADD COLUMN province  VARCHAR(150),  -- Tỉnh/Thành phố
    ADD COLUMN district  VARCHAR(150),  -- Quận/Huyện
    ADD COLUMN ward      VARCHAR(150);  -- Phường/Xã
