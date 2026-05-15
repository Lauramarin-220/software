/**
 *Este archivo gestion de productos panel de administracion 
 * lista de todos los productos del sistema con imagen, descripcion, precio y estado
 * permite buscar en tiempo real y navega entre paginas 10 por pagina 
 * product-form con los datos de editar 
 * al presionar el producto navega a sus caracteristicas y edicion
 * solo administradores Isadmin pueden activar, desactivar y eliminar  productos
 * el auxiliar isAux solo puede ver y navegar  
 */


//manejo de variables de estado local 
import { useState, useEffect } from 'react';
//importar componentes 
import {  ActivityIndicator, FlatList, Image, Pressable, Alert, ScrollView, StyleSheet, TextInput, View } from "react-native";
// lee los parametros para obtener el id del pedido
import { router } from "expo-router"; 
import { ThemedText } from '@/components/themed-text';
import apiClient from '../../src/api/apiClient';
import { activarProducto, desactivarProducto, deleteProduct } from '../../src/services/adminService';
import { useAuth } from '../../src/context/AuthContext';
/**
 *  tipo de producto 
 *  estrucutra del producto recibido tal como viene del backend
 */

type Producto = {
    id?: string;
    nombre: string;
    descripcion?: string;
    precio?: number;
    stock?: number;
    imagen?: string;
    activo?: boolean;
};

type AuthUser = { rol?: string };

/**
 * helpers de navegacion 
 * cats de router para navegar con string simple sin parametros
 */

const push = (path: string) => (router as unknown as { push: ( p: string ) => void}).push(path);

// cats de router para navegar con pathname + params (para pasar el objeto a producto)
const pushParams = (pathname : string, params : Record<string, string>) => (router as unknown as { push: ( p: { pathname: string; params: Record<string, string>}) => void})
.push({pathname, params})

export default function AdminProductosScreen() {
    /**
     *  contexto de auntenticacion 
     */
    const { user } = useAuth() as { user: AuthUser | null };
    /** 
     * estado local 
     */
    const [ productos, setProductos ] = useState<Producto[]>([]); //productos en la pagina actual
    const [ loading, setLoading ] = useState(true);
    const [ errorMessage, setErrorMessage ] = useState('');
    const [ busqueda, setBusqueda ] = useState('');
    const [ pagina, setPagina ] = useState(1);
    const [ totalPaginas, setTotalPaginas ] = useState(1);

    /**
     * funcion fetchProductos
     * consulta get / admin/productos con filtro de busqueda y paginacion
     */

    const fetchProductos = async (page = 1, search = '') => {
        setLoading(true);
        setErrorMessage('');
        try {
            const params: string[] =[];
            if (search.trim()) params.push(`buscar=${encodeURIComponent(search.trim())}`);
            params.push(`pagina=${page}`);
            params.push(`limite = 10 `)
            const url = `/admin/productos?${params.join('&')}`;
            const res = await apiClient.get(url);
            const productosData: Producto[] = res.data?.data?.productos || [];
            setProductos(productosData);
            setPagina(page);
            setTotalPaginas(res.data?.data.paginacion.tottalPaginas || 1)
        } catch (error: unknown ) {
            setErrorMessage((error as { message?: string })?.message || 'error al cargar productos');
        } finally {
            setLoading(false);
        }
    }; 

    useEffect (() => {
        fetchProductos( 1, '');
    }, []);

    // avanza y retrocede paginas 
    const handlePagina = (next: number) => {
        const nueva = Math.max(1, Math.min(totalPaginas, pagina+ next));
        fetchProductos(nueva, busqueda);
    };

    const isAdmin = user?.rol === 'Administrador';

    

}