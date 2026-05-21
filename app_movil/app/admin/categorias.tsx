import { useState, useEffect } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { crearCategoria, getCategorias } from '../../src/services/adminService';
import { ThemedText } from '../../components/themed-text';

type Categoria = {
  id?: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
};

type AuthUser = { rol?: string; nombre?: string };

export default function AdminCategoriasScreen() {
  const { user, isAuthenticated } = useAuth() as { user: AuthUser | null; isAuthenticated: boolean };
  const isAdmin = user?.rol === 'administrador';

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchCategorias = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await getCategorias();
      setCategorias(res?.categorias || []);
    } catch (error: unknown) {
      const err = error as any;
      setErrorMessage(err?.response?.data?.message || err?.message || 'Error al cargar categorías.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchCategorias();
    }
  }, [isAuthenticated, isAdmin]);

  const handleCrearCategoria = async () => {
    if (!nombre.trim()) {
      setErrorMessage('El nombre de la categoría es requerido.');
      setSuccessMessage('');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await crearCategoria({ nombre: nombre.trim(), descripcion: descripcion.trim() || undefined });
      setNombre('');
      setDescripcion('');
      setSuccessMessage('Categoría creada con éxito.');
      fetchCategorias();
    } catch (error: unknown) {
      const err = error as any;
      setErrorMessage(err?.response?.data?.message || err?.message || 'No se pudo crear la categoría.');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <View style={styles.restrictedContainer}>
        <Text style={styles.restrictedTitle}>Acceso restringido</Text>
        <Text style={styles.restrictedSubtitle}>Solo los administradores pueden crear categorías.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedText type="title">Categorías</ThemedText>

      <View style={styles.section}>
        <ThemedText type="subtitle">Crear nueva categoría</ThemedText>

        <TextInput
          value={nombre}
          onChangeText={setNombre}
          placeholder="Nombre de la categoría"
          style={styles.input}
        />
        <TextInput
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Descripción (opcional)"
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={3}
        />

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

        <Pressable style={styles.saveBtn} onPress={handleCrearCategoria} disabled={saving}>
          <ThemedText style={styles.saveBtnText}>{saving ? 'Guardando...' : 'Guardar categoría'}</ThemedText>
        </Pressable>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Categorías existentes</ThemedText>
          <ThemedText>{categorias.length} total</ThemedText>
        </View>

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Cargando categorías...</Text>
          </View>
        ) : (
          <FlatList
            data={categorias}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <View style={styles.categoryCard}>
                <View>
                  <Text style={styles.categoryName}>{item.nombre}</Text>
                  <Text style={styles.categoryDescription}>{item.descripcion || 'Sin descripción'}</Text>
                </View>
                <Text style={[styles.categoryStatus, { color: item.activo ? '#10b981' : '#ef4444' }]}> {item.activo ? 'Activo' : 'Inactivo'}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No hay categorías todavía.</Text>}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  content: { gap: 16, paddingBottom: 24 },
  section: { backgroundColor: '#f8fafc', borderRadius: 14, padding: 16, gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, backgroundColor: '#fff' },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: '#10b981', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  error: { color: '#b91c1c' },
  success: { color: '#15803d' },
  loadingRow: { alignItems: 'center', gap: 10, marginTop: 16 },
  loadingText: { color: '#374151' },
  categoryCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 10 },
  categoryName: { fontSize: 16, fontWeight: '700' },
  categoryDescription: { color: '#6b7280', marginTop: 4 },
  categoryStatus: { fontSize: 12, fontWeight: '700' },
  emptyText: { color: '#6b7280', textAlign: 'center', marginTop: 16 },
  restrictedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  restrictedTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  restrictedSubtitle: { color: '#6b7280', textAlign: 'center' },
});
