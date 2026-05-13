/**
 * Este archivo o pantalla de detalle de un pedido especificamente para el administrador 
 * recibe el parametro dinamico id desde la url 
 * consulta el backend para traer los datos del pedido 
 * muestra los daotos del cliente estado actual total fecha y lista productos 
 * permite cambiar el estado del pedido pendiente -> enviado -> entregado o cancelar si esta pendiente 
 */


//manejo de variables de estado local 
import { useState, useEffect } from 'react';
// Dimensios optiene al ancho y alto de la pantalla para hacer diseños responsivos
//Flatlist lista optimiza con virtializacion para mostrar grandes cantidades de datos 
//modal mostrar detalles de contenido en ventana emergente
import { ActivityIndicator,  Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
//importar componentes 
// lee los parametros para obtener el id del pedido
import { useLocalSearchParams } from "expo-router";
// themedText: texto que aplica colores del tema del dispositivos de manera automatica claro a oscuro
import { ThemedText } from '@/components/ui/themed-text';
// cliente http axios con JWT 
import  apiClient from '../../../src/api/apiClient';

/**
 * TIPOS 
 * representa UN ITEM de la lista de productos del pedido
 * todos los campos son opcionales ? por que en el backend puede enviarlos todos 
 */
type Detalle = {
    producto?: { nombre?: string }; //solo de los productos comprados 
    cantidad ?: number;
    precio?: number; // precio unitario del producto
};

// representa el pedido completo ctal como lo devuelve el backend
type Pedido = {
    id: number;
    estado?: string;
    total?: number;
    createdAt?: string;
    usuario?: {
        nombre?: string;
        apellido?: string;
        email?: string;
    };
    detalles?: Detalle[]; // arreglo de productos incluidos en el pedido
};

/**
 * componente principal 
 * 
 */
export default function AdminPedidoDetalleScreen() {
    /**
     * parametros de ruta
     * useLocalSearchParams lee los segmentos dinamicos de la url como
     * el archivo se llama [is].tsx el parametro se llama id es decir si un pedido se 
     * llama 38 el id es 38
     */

    const { id } = useLocalSearchParams<{ id: string }>();

    //estado local 
    const [ pedido, setPedido ] = useState<Pedido | null>(null); //datos del pedido. null = aun no cargados
    const [ loading, setLoading ] = useState(true); //activo mientras se hace una peticion api
    const [ errorMessage, setErrorMessage ] = useState(''); //mensaje de error si falla la carga
    const [ cambiando, setCambiando] = useState(false); // true mientras se esta cambiando el estado evita el doble click

    /**
     * funcion fetchPedido
     * llama el endpoint get /admin/pedidos/:id y guarda el resultado en estado 
     * se usa tanto en el montaje inicial useEffect como despues cambiar estado 
     */

    const fetchPedido = async () => {
        setLoading(true) //muestra el spinner
        setErrorMessage(''); 
        try {
            //peticion get autenticado el token JWT lo agrega el apiClient automaticamente
            const res = await apiClient.get(`/admin/pedidos/${id}`); 
            // la respuesta tiene estructura { data: data: { pedido... }}
            // el operador ? evita errores si algun nivel es undefined 
            setPedido(res.data?.data?.pedido || null);
        } catch (error: unknown) {
            // si la peticion falla guarda el mensaje de error para que se pueda mostrar en pantalla
            setErrorMessage(( error as { message?: string })?.message || 'No fue posible cargar el pedido')
        } finally {
            setLoading(false); //oculta el spinner siempre que haya un error o no 
        }
    };

    /**
     * efecto  carga inicial
     * se ejecuta cada vez que cambie el parametro id de la url 
     * en la practica solo se ejecuta el montar porque no se navega entre ids diferentes
     */
    useEffect(() => {
        fetchPedido();
        /**
         * eslint-disable-next-line react-hooks/exhaustive-deps
         * fetchPedido no se incluye en la array de dependencias para evitar bucles infinitos 
         * es lint warnign se suprime con el comentario de arriba  
         */
    }, [id]);
    
    /**
     * funcion cambiar estado 
     * envia un PATCH al backend para actualizar el estado del pedido
     * parametro: nuevoEstado el estado al que se requiere transicionar 
     * enviando, entregado, cancelado
     */
    const cambiarEstado = async (nuevoEstado: string ) => {
        setCambiando(true); //bloquea los botones para evitar cicks multiples
        try {
            // PATCH/ admin/pedidos/:id/estado con el nuevo estado en el body 
            await apiClient.patch(`admin/pedidos/${id}/estado`, { estado: nuevoEstado});
        } catch {
            // si falla muestra un alet nativo con el mensaje de error
            Alert.alert('Error', 'no se pudo cambiar el estado del pedido')
        } finally {
            setCambiando(false); // desbloque los botones
        }
    };
}

