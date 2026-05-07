/**
 * Pantalla del carrito de compras y sus respectivas gestiones no
 * requieren que este autenticado solo para hacer compras 
 */

/**importar componentes de React native para construir la pantalla
 * ActivityIndicator: Spiner de carga circular
 * Alert: Doalogos emergentes nativos del sistema
 * Image: Muestra imagenes
 * Pressable: Area Tactil
 * ScrollView: Contenedor del scroll vertical
 * StyleSheet:  crea estilos de forma optimizada
 * Text: muestra texto plano en la pantalla
 * View:  contenido generico equivale a un div en html y css
 * 
 */

import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { router } from "expo-router";
// Ionicons libreria de iconos vectoriales para react native 
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from '../../src/context/AuthContext';
import { useCarrito } from '../../src/context/CarritoContext';

// carritoctx. define la forma de los datos que devuelven usecarrito
// TypeScript necesita esto porque CarritoContext.js esta es JavaScript
type CarritoCtx = {
    //items lista de productos en el carrito 
    items: {
        id: string, nombre?: string, precio?: number, cantidad: number, imagen?: string
    }[];
    // total suma en pesos colombianos de todos loa items 
    total: number;
    // Total items numero total de items del carrito
    totalItems: number;
    //loading true mientras el contexto carga los datos iniciales 
    loading: boolean;
    //cambiar cantidad actualiza la cantidad de un producto
    cambiarCantidad: ( id: string, cantidad: number ) => Promise<void>;
    //Eliminar item elimina un producto del carrito
    eliminarItem: (id: string) => Promise<void>;
    //Vaciar carrito elimina todos los productos del carrito
    vaciarCarrito: () => Promise<void>; 
};

// HELPERS de navegacion 
// Expo Router especifica router de forma estricta y expone .push/replace
// Directamente en typescript, se usa as .... para forzar el tipo
// y poder llamar a las funciones de navegacion sin errores de complilador

//routerPush navega a una nueva pantalla apilandola es decir se puede volver atras
const routerPush = (path: string) => (router as unknown as { push: (p:string) => void}).push(path);
//routerReplace navega a una pantalla remplazando la actual recuerda que se puede volver atras 
const routerReplace = (path: string) => (router as unknown as { replace: (p: string) => void}).replace(path);

//fmt: formatea un numero como precio en pesos colombianos eje fmt (15000) -> $15.000
const fmt = (n: number) => `$${Number(n).toLocaleString('es-CO')}`

//componente principal carrito Screen
export default function CarritoScreen() {
    //obteniendo el contexto de auth solo si el usuario esta autenticado
    const { isAuthenticated } = useAuth() as { isAuthenticated: boolean };

    //obtiene del cotexto del carrito los datos y funciones necesarias 
    //se usa as CarritoCtx porque el contexto de JS y typescript no infiere en tipos 
    const { items, total, loading, cambiarCantidad, eliminarItem, vaciarCarrito } =useCarrito() as CarritoCtx

    //pantalla de carga
    //si el carrito aun esta cargando por ejemplo recuperando datos guardados
    //se muestra un spiner centrado en lugar del contenido normal

    if (loading) {
        return (
            <View style={styles.centered}>
                {/** spiner circular color indigo */}
                <ActivityIndicator size="large" color="#6366f1"/>
                <text style={styles.loadingText}> Cargando Carrito... </text>
            </View>
        );
    }

    // Funcion handlerIrACheckout o sea cargar 
    // si el usuario no esta autenticado muestra el dialogo de inicio de sesion
    // si esta autenticado navega directamente a la pantalla de pagos 
    const handlerIrACheckout = () => {
        if (!isAuthenticated) {
            Alert.alert(
                'Inicio de Sesion',
                'Debes Iniciar Sesion para proceder al pago',
                [
                    //Boton cancelar cierra el dialogo sin hacer nada 
                    { text: 'Cancela', style: 'cancel' },
                    // boton iniciar sesion lleva a pestañas cuenta explore.tsx
                    { text: 'Iniciar Sesion', onPress: () => routerReplace('/tabs/explore')},
                ]
            );
            return; //sale de la funcion
        }
        // usuario autenticado navega a la pantalla de pagos
        routerPush('/checkout');
    };
}