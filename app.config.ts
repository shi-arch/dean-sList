import 'dotenv/config';
import { ExpoConfig, ConfigContext } from '@expo/config';

// Define your environments
type EnvKey = 'development' | 'staging' | 'production';
// Check EAS_BUILD_PROFILE first (set by EAS Build), then APP_ENV, then NODE_ENV, then default to development
const ENV = (process.env.EAS_BUILD_PROFILE || process.env.APP_ENV || process.env.NODE_ENV || 'development') as EnvKey;

// Environment-specific config
const envConfig: Record<EnvKey, { APP_API_URL: string; APP_SECRET: string }> = {
  development: {
    APP_API_URL: process.env.APP_API_URL || 'http://192.168.29.179:5000',
    APP_SECRET: process.env.APP_SECRET || 'your_secret_key',
  },
  staging: {
    APP_API_URL: process.env.APP_API_URL || 'https://d1bebq95i2ghmy.cloudfront.net',
    APP_SECRET: process.env.APP_SECRET || 'your_secret_key',
  },
  production: {
    APP_API_URL: process.env.APP_API_URL || 'https://api.example.com',
    APP_SECRET: process.env.APP_SECRET || 'your_secret_key',
  },
};

// Export config
export default ({ config }: ConfigContext): ExpoConfig => {
  // Debug logging
  console.log('=== CONFIG PLUGIN DEBUG ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('APP_ENV:', process.env.APP_ENV);
  console.log('EAS_BUILD_PROFILE:', process.env.EAS_BUILD_PROFILE);
  console.log('Loaded APP_API_URL from process.env:', process.env.APP_API_URL);
  console.log('Resolved ENV:', ENV);
  console.log('Final extra.APP_API_URL:', envConfig[ENV].APP_API_URL);

  // Google Maps API Key Debug
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || config.extra?.EAS_GOOGLE_MAPS_API_KEY || '';
  console.log('=== GOOGLE MAPS API KEY DEBUG ===');
  console.log('process.env.GOOGLE_MAPS_API_KEY:', process.env.GOOGLE_MAPS_API_KEY ? 'SET' : 'NOT SET');
  console.log('config.extra?.EAS_GOOGLE_MAPS_API_KEY:', config.extra?.EAS_GOOGLE_MAPS_API_KEY ? 'SET' : 'NOT SET');
  console.log('Final GOOGLE_MAPS_API_KEY:', googleMapsApiKey ? `${googleMapsApiKey.substring(0, 10)}...` : 'EMPTY');
  return {
    ...config,
    name: config.name || 'dregali-deans-list',
    slug: config.slug || 'dregali-deans-list',
    version: config.version || '1.0.0',
    orientation: config.orientation || 'portrait',
    icon: config.icon || './assets/images/logo.png',
    scheme: config.scheme || 'dregalideanslist',
    userInterfaceStyle: config.userInterfaceStyle || 'automatic',
    ios: {
      ...config.ios,
      supportsTablet: true,
    },
    android: {
      ...config.android,
      adaptiveIcon: config.android?.adaptiveIcon || {
        foregroundImage: './assets/images/logo.png',
        backgroundColor: '#ffffff',
      },
    },
    extra: {
      ...config.extra,
      ...envConfig[ENV],
      // Google Maps API Key - Priority: env var > app.json EAS_GOOGLE_MAPS_API_KEY
      // This ensures the plugin can access it via config.extra.GOOGLE_MAPS_API_KEY
      GOOGLE_MAPS_API_KEY: 
        process.env.GOOGLE_MAPS_API_KEY || 
        config.extra?.EAS_GOOGLE_MAPS_API_KEY || 
        '',
    },
  };
};
