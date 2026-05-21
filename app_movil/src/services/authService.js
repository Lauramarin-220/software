/**
 * Centraliza todas las operaciones relacionadas con autenticacion 
 * inicialmente sesion guarda el token/usuario en almacenamiento local
 * cierra sesion  eliminando los datos 
 * reataura la sesion guardada 
 * actualiza el perfil del usuario autenticado
 */

import apiClient from '../api/apiClient';
import { STORAGE_KEYS } from '../utils/constants';
import { storageGetItem, storageSetItem, storageRemoveItem } from '../utils/storage';

const authService = {
    //Envia crendenciales al backend y persisten el token + usuario si son validos
    login: async (email, password) => {
        const response = await apiClient.post('auth/login', { email, password });
        const payload = response.data?.data || response.data; // maneja ambos formatos de respuesta 

        if (payload?.token) {
            await storageSetItem(STORAGE_KEYS.token, payload.token);
        }

        if (payload?.usuario) {
            await storageSetItem(STORAGE_KEYS.user, payload.usuario);
        }

        return payload;
    },
    
    register: async (data) => {
        const response = await apiClient.post('auth/register', data);
        return response.data;
    },
    
    logout: async () => {
        await storageRemoveItem([STORAGE_KEYS.token, STORAGE_KEYS.user]);
    },

    //Lee el almacenamiento local la sesion previamente guardada 
    getSession: async () => {
        const token = await storageGetItem(STORAGE_KEYS.token);
        const userRaw = await storageGetItem(STORAGE_KEYS.user);
        const user = userRaw ? JSON.parse(userRaw) : null;
        return { token, user };
    },

    // Actualiza el perfil del usuario autenticado
    updatePerfil: async (data) => {
        const response = await apiClient.put('auth/me', data); //profile
        const usuario = response.data?.data?.usuario || response.data.usuario; // maneja ambos formatos de respuesta

        if (usuario) {
            await storageSetItem(STORAGE_KEYS.user, JSON.stringify(usuario));
        }
        return usuario;
    },


};
export default authService;