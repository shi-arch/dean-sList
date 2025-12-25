const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withGoogleMapsApiKey(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const { manifest } = androidManifest;

    if (!manifest.application) {
      return config;
    }

    const application = manifest.application[0];
    
    // Get API key from config - check multiple possible locations
    // Priority: GOOGLE_MAPS_API_KEY (from app.config.ts) > EAS_GOOGLE_MAPS_API_KEY (from app.json) > process.env
    const apiKey = 
      config.extra?.GOOGLE_MAPS_API_KEY || 
      config.extra?.EAS_GOOGLE_MAPS_API_KEY || 
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.EAS_GOOGLE_MAPS_API_KEY ||
      '';

    // Debug logging
    console.log('[Config Plugin] Google Maps API Key Debug:');
    console.log('  - config.extra?.GOOGLE_MAPS_API_KEY:', config.extra?.GOOGLE_MAPS_API_KEY ? 'SET' : 'NOT SET');
    console.log('  - config.extra?.EAS_GOOGLE_MAPS_API_KEY:', config.extra?.EAS_GOOGLE_MAPS_API_KEY ? 'SET' : 'NOT SET');
    console.log('  - process.env.GOOGLE_MAPS_API_KEY:', process.env.GOOGLE_MAPS_API_KEY ? 'SET' : 'NOT SET');
    console.log('  - Final apiKey:', apiKey ? `${apiKey.substring(0, 10)}...` : 'EMPTY');

    // Remove existing Google Maps API key meta-data if any
    if (application['meta-data']) {
      application['meta-data'] = application['meta-data'].filter(
        (meta) => meta.$['android:name'] !== 'com.google.android.geo.API_KEY'
      );
    } else {
      application['meta-data'] = [];
    }

    // Add Google Maps API key meta-data
    if (apiKey && apiKey !== 'your-google-maps-api-key' && apiKey.length > 20) {
      application['meta-data'].push({
        $: {
          'android:name': 'com.google.android.geo.API_KEY',
          'android:value': apiKey,
        },
      });
      console.log('[Config Plugin] ✅ Successfully added Google Maps API key to AndroidManifest.xml');
    } else {
      console.error('[Config Plugin] ❌ ERROR: Google Maps API key not found or invalid!');
      console.error('[Config Plugin] API key value:', apiKey || 'EMPTY');
      console.error('[Config Plugin] This will cause the app to crash when accessing maps.');
      // Still add a placeholder to prevent immediate crash, but it won't work
      application['meta-data'].push({
        $: {
          'android:name': 'com.google.android.geo.API_KEY',
          'android:value': 'AIzaSyDummyKeyToPreventCrash',
        },
      });
      console.warn('[Config Plugin] ⚠️  Added dummy key - maps will NOT work!');
    }

    return config;
  });
};

