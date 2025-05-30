import axios from 'axios';
import { BACKEND_URL } from './config.js';

axios.defaults.baseURL = BACKEND_URL;
let isRedirecting = false;
let cancelTokenSource = axios.CancelToken.source();

axios.interceptors.request.use(
    (config) => {
        if (isRedirecting) {
            cancelTokenSource.cancel('Session expired. Cancelling pending requests.');
        }
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers['Accept'] = 'application/json';
        config.cancelToken = cancelTokenSource.token;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (axios.isCancel(error)) {
            console.warn('Request canceled:', error.message);
            return Promise.reject(error);
        }
        if (error.response) {
            const { status, data } = error.response;
            console.error('API Error:', data);
            const message = data?.message;
            const isTokenError = status === 401 && (message.includes('Token expired') || message.includes('JWT signature does not match'));
            if (isTokenError && !isRedirecting) {
                isRedirecting = true;
                alert('Your session has expired or is invalid. Please log in again.');
                cancelTokenSource.cancel('Session expired. Cancelling pending requests.');
                window.location.href = '/logout';
            }
        }
        return Promise.reject(error);
    }
);