import { useState, useEffect } from 'react';

interface UsePermissionsReturn {
  microphonePermission: PermissionState | null;
  locationPermission: PermissionState | null;
  requestMicrophonePermission: () => Promise<void>;
  requestLocationPermission: () => Promise<void>;
  checkPermissions: () => Promise<void>;
}

export const usePermissions = (): UsePermissionsReturn => {
  const [microphonePermission, setMicrophonePermission] = useState<PermissionState | null>(null);
  const [locationPermission, setLocationPermission] = useState<PermissionState | null>(null);

  const checkPermissions = async () => {
    try {
      // Check microphone permission
      if ('permissions' in navigator) {
        const micResult = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setMicrophonePermission(micResult.state);
        
        micResult.addEventListener('change', () => {
          setMicrophonePermission(micResult.state);
        });
      }

      // Check geolocation permission
      if ('permissions' in navigator) {
        const geoResult = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        setLocationPermission(geoResult.state);
        
        geoResult.addEventListener('change', () => {
          setLocationPermission(geoResult.state);
        });
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately as we only needed permission
      stream.getTracks().forEach(track => track.stop());
      setMicrophonePermission('granted');
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setMicrophonePermission('denied');
      throw new Error('Microphone access is required for voice features. Please enable it in your browser settings.');
    }
  };

  const requestLocationPermission = async () => {
    return new Promise<void>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationPermission('granted');
          resolve();
        },
        (error) => {
          console.warn('Location permission denied:', error);
          setLocationPermission('denied');
          reject(new Error('Location access helps provide better emergency services. You can enable it later in settings.'));
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  return {
    microphonePermission,
    locationPermission,
    requestMicrophonePermission,
    requestLocationPermission,
    checkPermissions
  };
};