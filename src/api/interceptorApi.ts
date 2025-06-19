import axios, { AxiosResponse, AxiosError } from 'axios';

// Crear instancia de axios
const interceptorApi = axios.create({
    baseURL: '/api', // URL base para todas las peticiones
    timeout: 10000, // Timeout de 10 segundos
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor de solicitudes (request)
interceptorApi.interceptors.request.use(
    (config) => {
        // Agregar token de autenticación si existe
        const userString = localStorage.getItem('user');
        if (userString) {
            try {
                const user = JSON.parse(userString);
                if (user.token) {
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
            } catch (error) {
                console.error('Error parsing user token:', error);
            }
        }

        // Log de la petición (solo en desarrollo)
        if (process.env.NODE_ENV === 'development') {
            console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data);
        }

        return config;
    },
    (error: AxiosError) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Interceptor de respuestas (response)
interceptorApi.interceptors.response.use(
    (response: AxiosResponse) => {
        // Log de la respuesta exitosa (solo en desarrollo)
        if (process.env.NODE_ENV === 'development') {
            console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        }

        return response;
    },
    (error: AxiosError) => {
        // Manejo centralizado de errores
        if (error.response) {
            // El servidor respondió con un código de estado de error
            const status = error.response.status;
            const data = error.response.data as any;

            switch (status) {
                case 400:
                    console.error('❌ Bad Request:', data);
                    console.error('❌ Response details:', error.response);
                    throw new Error(`Error 400: ${data?.message || data?.error || 'Error en la solicitud'}`);
                case 401:
                    console.error('❌ Unauthorized: Token inválido o expirado');
                    // Opcional: Redirigir al login
                    localStorage.removeItem('user');
                    window.location.href = '/admin/login';
                    throw new Error('Error 401: No autorizado');
                case 403:
                    console.error('❌ Forbidden: No tienes permisos para esta acción');
                    throw new Error('Error 403: No tienes permisos para esta acción');
                case 404:
                    console.error('❌ Not Found: Recurso no encontrado');
                    throw new Error('Error 404: Recurso no encontrado');
                case 409:
                    console.error('❌ Conflict:', data.message || 'Conflicto en los datos');
                    throw new Error(`Error 409: ${data?.message || 'Conflicto en los datos'}`);
                case 500:
                    console.error('❌ Internal Server Error: Error del servidor');
                    throw new Error('Error 500: Error interno del servidor');
                default:
                    console.error(`❌ Error ${status}:`, data.message || 'Error desconocido');
                    throw new Error(`Error ${status}: ${data?.message || 'Error desconocido'}`);
            }
        } else if (error.request) {
            // La petición se realizó pero no se recibió respuesta
            console.error('❌ Network Error: No se pudo conectar con el servidor');
            throw new Error('Error de conexión: No se pudo conectar con el servidor');
        } else {
            // Algo más causó el error
            console.error('❌ Request Setup Error:', error.message);
            throw new Error(`Error en la configuración: ${error.message}`);
        }
    }
);

export default interceptorApi;