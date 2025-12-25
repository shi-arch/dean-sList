import Constants from 'expo-constants';

export interface EnvConfig {
  APP_API_URL: string;
  APP_SECRET: string;
}

const env = Constants.expoConfig?.extra as EnvConfig;

export default env;
