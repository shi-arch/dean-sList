// import axios from 'axios';
// import { router } from 'expo-router';
// import * as SecureStore from 'expo-secure-store';

// const api = axios.create({
//   baseURL: 'http://192.168.29.179:5000',
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// api.interceptors.request.use(
//   async (config) => {
//     const token = await SecureStore.getItemAsync('accessToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response?.status === 401) {
//       await SecureStore.deleteItemAsync('accessToken');
//       router.replace('/(auth)/Signin');
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;
// 88888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
import axios from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';  // Use this for runtime access to resolved config

const apiUrl = Constants.expoConfig?.extra?.APP_API_URL || 'http://192.168.29.179:5000';  // Fixed: Access via Constants.expoConfig.extra
console.log('=== API RUNTIME DEBUG ===');  // Debug: Runtime env detection
console.log('Detected ENV from URL:', apiUrl.includes('5000') ? 'development' : apiUrl.includes('5001') ? 'staging' : 'production/other');  // Simple detection based on port
console.log('Final API URL:', apiUrl);  // Debug: Confirms port (5000 for dev, 5001 for staging)

const api = axios.create({
  baseURL: apiUrl,  // Use the dynamic URL
  timeout: 60000,  // Increased timeout to 60 seconds for file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const url = config.url || '';
    const baseURL = config.baseURL || apiUrl;
    console.log('API Request to:', baseURL + url);  // Now TypeScript safe
    
    // For FormData, handle Content-Type header
    // If explicitly set to 'multipart/form-data', keep it (Axios will add boundary)
    // Otherwise, remove the default 'application/json' to let Axios handle it
    if (config.data instanceof FormData) {
      if (config.headers['Content-Type'] !== 'multipart/form-data') {
        delete config.headers['Content-Type'];
      }
    }
    
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      console.log('Retrieved token:', token ? '[TOKEN EXISTS]' : 'no token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving token from SecureStore:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized request, redirecting to Signin:', error.response.data);
      try {
        await SecureStore.deleteItemAsync('accessToken');
      } catch (err) {
        console.error('Error clearing token:', err);
      }
      // Don't redirect if this is a signin request (let the signin page handle the error)
      const requestUrl = error.config?.url || '';
      if (!requestUrl.includes('/auth/signin') && !requestUrl.includes('/auth/signup')) {
        router.replace('/(auth)/Signin');
      }
    }
    return Promise.reject(error);
  }
);

export default api;



// import axios from 'axios';
// import { router } from 'expo-router';
// import * as SecureStore from 'expo-secure-store';
// import Constants from 'expo-constants';  // ADD: For dynamic env loading

// const apiUrl = Constants.expoConfig?.extra?.APP_API_URL || 'http://localhost:5000';  // ADD: Dynamic URL extraction
// console.log('Loaded API URL:', apiUrl);  // ADD: Debug log (remove after testing)

// const api = axios.create({
//   baseURL: apiUrl,  // CHANGE: Use the new dynamic var
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// api.interceptors.request.use(
//   async (config) => {
//     try {
//       const token = await SecureStore.getItemAsync('accessToken');
//       console.log('Retrieved token:', token);
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//     } catch (error) {
//       console.error('Error retrieving token from SecureStore:', error);
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response?.status === 401) {
//       console.warn('Unauthorized request, redirecting to Signin:', error.response.data);
//       try {
//         await SecureStore.deleteItemAsync('accessToken');
//       } catch (err) {
//         console.error('Error clearing token:', err);
//       }
//       router.replace('/(auth)/Signin');
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;