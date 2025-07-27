# Location and Pincode Functionality

This directory contains utilities for handling user location and delivery pincode functionality.

## Files

### `locationUtils.js`

Contains utility functions for:

- Getting user's current location pincode
- Getting user's current location address
- Requesting location permissions
- Clearing saved location data

### `useLocationPincode.js` (in `../hooks/`)

A custom React hook that:

- Manages the current delivery pincode state
- Listens for location changes from localStorage
- Provides loading states
- Automatically updates when user changes location

## Features

### Dynamic Pincode Display

The "Delivering to [pincode]" text in product and medicine detail pages now:

- Shows the user's actual current location pincode
- Updates automatically when location changes
- Shows loading state while fetching location
- Is clickable to open location dialog
- Falls back to default pincode (110002) if location unavailable

### Location Sources

The pincode is retrieved from (in order of priority):

1. Saved pincode in localStorage (from Header location dialog)
2. Current device location via geolocation API
3. Reverse geocoding from coordinates to get pincode
4. Default fallback pincode (110002)

### Interactive Features

- Click on "Delivering to [pincode]" to open location dialog
- Location dialog supports:
  - Manual address entry
  - Pincode entry
  - Coordinate entry (lat, lng)
  - Automatic address resolution

### Real-time Updates

- Pincode updates automatically when user changes location in Header
- Works across browser tabs via localStorage events
- Same-tab updates via custom events

## Usage

### In Components

```javascript
import { useLocationPincode } from "../hooks/useLocationPincode";

const MyComponent = () => {
  const { pincode, loading } = useLocationPincode();

  return <div>Delivering to {loading ? "..." : pincode}</div>;
};
```

### Direct Utility Usage

```javascript
import { getCurrentLocationPincode } from "../utils/locationUtils";

const pincode = await getCurrentLocationPincode();
```

## Browser Compatibility

- Requires HTTPS for geolocation API
- Falls back gracefully if geolocation not supported
- Works with all modern browsers

## Error Handling

- Graceful fallbacks for all error scenarios
- Console logging for debugging
- User-friendly default values
- No breaking errors if location services fail
