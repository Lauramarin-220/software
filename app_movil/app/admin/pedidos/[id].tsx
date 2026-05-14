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
    // ── RENDERIZADO CONDICIONAL: cargando ─────────────────────────────────────
  // Mientras la petición está en curso, muestra un spinner y un texto.
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <ThemedText>Cargando pedido...</ThemedText>
      </View>
    );
  }

  // ── RENDERIZADO CONDICIONAL: error ────────────────────────────────────────
  // Si la petición falló, muestra el mensaje de error en rojo.
  if (errorMessage) {
    return (
      <View style={styles.centered}>
        <ThemedText style={styles.error}>{errorMessage}</ThemedText>
      </View>
    );
  }

  // ── RENDERIZADO CONDICIONAL: pedido no encontrado ─────────────────────────
  // Si la petición tuvo éxito pero el servidor no devolvió datos del pedido.
  if (!pedido) {
    return (
      <View style={styles.centered}>
        <ThemedText>No se encontró el pedido.</ThemedText>
      </View>
    );
  }

  // ── RENDERIZADO PRINCIPAL ─────────────────────────────────────────────────
  // Se muestra solo cuando el pedido se cargó correctamente.
  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* Título: número de pedido. Se usa _id (MongoDB) o id como fallback. */}
      <ThemedText type="title">Pedido #{pedido.id || pedido.id}</ThemedText>

      {/* Datos del cliente que realizó el pedido */}
      <ThemedText>Cliente: {pedido.usuario?.nombre} {pedido.usuario?.apellido}</ThemedText>
      <ThemedText>Email: {pedido.usuario?.email}</ThemedText>

      {/* Estado actual del pedido (pendiente / enviado / entregado / cancelado) */}
      <ThemedText>Estado: {pedido.estado}</ThemedText>

      {/* Total formateado como moneda colombiana: ej. "$ 45.000" */}
      <ThemedText>Total: ${Number(pedido.total || 0).toLocaleString('es-CO')}</ThemedText>

      {/* Fecha de creación. Si no existe, muestra '-' como valor por defecto. */}
      <ThemedText>Fecha: {pedido.createdAt ? new Date(pedido.createdAt).toLocaleString('es-CO') : '-'}</ThemedText>

      {/* Encabezado de la sección de productos */}
      <ThemedText style={styles.sectionTitle}>Productos:</ThemedText>

      {/* Lista de ítems del pedido. Cada ítem muestra nombre, cantidad y precio. */}
      {pedido.detalles?.map((det: Detalle, idx: number) => (
        // key={idx} usa el índice porque los detalles no siempre tienen ID propio.
        <View key={idx} style={styles.detalleRow}>
          {/* Nombre del producto y cantidad comprada */}
          <ThemedText>{det.producto?.nombre} x{det.cantidad}</ThemedText>
          {/* Precio del ítem formateado en COP */}
          <ThemedText>${Number(det.precio || 0).toLocaleString('es-CO')}</ThemedText>
        </View>
      ))}

      {/* ── BOTONES DE ACCIÓN ─────────────────────────────────────────────── */}
      {/* Los botones se muestran condicionalmente según el estado actual del pedido. */}
      <View style={styles.actionsRow}>

        {/* Si el pedido está 'pendiente', se puede marcar como 'enviado' */}
        {pedido.estado === 'pendiente' && (
          <Pressable
            style={styles.actionBtn}
            onPress={() => cambiarEstado('enviado')}
            disabled={cambiando} // Deshabilitado mientras se procesa el cambio.
          >
            <ThemedText style={styles.actionBtnText}>Marcar como Enviado</ThemedText>
          </Pressable>
        )}

        {/* Si el pedido está 'enviado', se puede marcar como 'entregado' */}
        {pedido.estado === 'enviado' && (
          <Pressable
            style={styles.actionBtn}
            onPress={() => cambiarEstado('entregado')}
            disabled={cambiando}
          >
            <ThemedText style={styles.actionBtnText}>Marcar como Entregado</ThemedText>
          </Pressable>
        )}

        {/* Si el pedido está 'pendiente', también se puede cancelar (botón rojo) */}
        {pedido.estado === 'pendiente' && (
          <Pressable
            style={[styles.actionBtn, styles.btnDanger]} // Combina el estilo base + el rojo de peligro.
            onPress={() => cambiarEstado('cancelado')}
            disabled={cambiando}
          >
            <ThemedText style={styles.actionBtnText}>Cancelar pedido</ThemedText>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

// ── ESTILOS ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Contenedor principal del ScrollView: padding interior y fondo blanco.
  // flexGrow: 1 permite que el contenido ocupe toda la pantalla aunque sea corto.
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },

  // Centrado vertical y horizontal para las pantallas de carga, error y "no encontrado".
  centered: { alignItems: 'center', gap: 10, marginVertical: 20 },

  // Color rojo oscuro para mensajes de error.
  error: { color: '#b93a32' },

  // Encabezado "Productos:" con margen superior y negrita.
  sectionTitle: { marginTop: 10, fontWeight: 'bold' },

  // Fila de un ítem de detalle: nombre a la izquierda, precio a la derecha.
  detalleRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2 },

  // Columna de botones de acción con separación entre ellos.
  actionsRow: { flexDirection: 'column', gap: 10, marginTop: 20 },

  // Botón de acción principal: azul (#0a7ea4), bordes redondeados, texto centrado.
  actionBtn: {
    backgroundColor: '#0a7ea4', // Azul petróleo.
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },

  // Sobreescribe el color del botón a rojo cuando la acción es peligrosa (cancelar).
  btnDanger: { backgroundColor: '#b93a32' },

  // Texto de los botones: blanco y negrita.
  actionBtnText: { color: '#fff', fontWeight: '700' },
});


