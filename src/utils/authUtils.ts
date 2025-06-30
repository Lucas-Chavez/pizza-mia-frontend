import { useAuthStore } from '../store/useAuthStore';

/**
 * Obtiene el token actual del store de autenticación
 * @returns Token de autenticación o null si no existe
 */
export const getCurrentToken = (): string | null => {
    return useAuthStore.getState().token;
};

/**
 * Obtiene el rol actual del store de autenticación
 * @returns Rol del usuario o null si no existe
 */
export const getCurrentRole = (): string | null => {
    return useAuthStore.getState().rol;
};

/**
 * Limpia los datos de autenticación del store
 */
export const clearAuthData = (): void => {
    const { setToken, setRol } = useAuthStore.getState();
    setToken(null);
    setRol(null);
};