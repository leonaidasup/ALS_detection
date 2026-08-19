import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
});

// 💡 Interceptor: Inyecta el token JWT en cada petición saliente
api.interceptors.request.use(
  (config) => {
    // Lee el token almacenado al iniciar sesión
    const token = localStorage.getItem('token'); 

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 💡 Interceptor de respuesta: Redirige al login si el token expira o es inválido
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Limpiar token vencido y redirigir al login si es necesario
      localStorage.removeItem('token');
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;