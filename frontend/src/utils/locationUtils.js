// Utility functions for location and pincode handling

// Get user's current location pincode
export const getCurrentLocationPincode = async () => {
  try {
    // First check if we have a saved pincode in localStorage
    const savedPincode = localStorage.getItem('deliveryPincode');
    if (savedPincode) {
      return savedPincode;
    }

    // If no saved pincode, try to get current location and reverse geocode
    if (!navigator.geolocation) {
      return '110002'; // Default fallback
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Use reverse geocoding to get address from coordinates
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            const data = await response.json();
            
            if (data && data.address) {
              const pincode = data.address.postcode;
              if (pincode) {
                // Save the pincode for future use
                localStorage.setItem('deliveryPincode', pincode);
                resolve(pincode);
                return;
              }
            }
            resolve('110002'); // Default fallback
          } catch (error) {
            console.error('Error getting pincode from coordinates:', error);
            resolve('110002'); // Default fallback
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          resolve('110002'); // Default fallback
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  } catch (error) {
    console.error('Error in getCurrentLocationPincode:', error);
    return '110002'; // Default fallback
  }
};

// Get user's current location address
export const getCurrentLocationAddress = async () => {
  try {
    // First check if we have a saved address in localStorage
    const savedAddress = localStorage.getItem('deliveryAddress');
    if (savedAddress) {
      return savedAddress;
    }

    // If no saved address, try to get current location and reverse geocode
    if (!navigator.geolocation) {
      return 'New Delhi, Delhi'; // Default fallback
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Use reverse geocoding to get address from coordinates
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            const data = await response.json();
            
            if (data && data.display_name) {
              // Create a shorter, more readable address
              const address = data.display_name.split(',').slice(0, 3).join(', ');
              // Save the address for future use
              localStorage.setItem('deliveryAddress', address);
              resolve(address);
              return;
            }
            resolve('New Delhi, Delhi'); // Default fallback
          } catch (error) {
            console.error('Error getting address from coordinates:', error);
            resolve('New Delhi, Delhi'); // Default fallback
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          resolve('New Delhi, Delhi'); // Default fallback
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  } catch (error) {
    console.error('Error in getCurrentLocationAddress:', error);
    return 'New Delhi, Delhi'; // Default fallback
  }
};

// Request location permission and get current location
export const requestLocationPermission = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

// Clear saved location data
export const clearSavedLocation = () => {
  localStorage.removeItem('deliveryPincode');
  localStorage.removeItem('deliveryAddress');
  localStorage.removeItem('deliveryCoords');
}; 