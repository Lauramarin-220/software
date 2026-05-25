import { useState, useEffect } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { crearCategoria, getCategorias, toggleCategoria } from '../../src/services/adminService';
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
  const [activo, setActivo] = useState(true);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
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
      await crearCategoria({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        activo
      });
      setNombre('');
      setDescripcion('');
      setActivo(true);
      setSuccessMessage('Categoría creada con éxito.');
      fetchCategorias();
    } catch (error: unknown) {
      const err = error as any;
      setErrorMessage(err?.response?.data?.message || err?.message || 'No se pudo crear la categoría.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCategoria = async (id?: number) => {
    if (id === undefined) return;

    setTogglingId(id);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await toggleCategoria(id);
      setSuccessMessage(response?.message || 'Estado de categoría actualizado.');
      fetchCategorias();
    } catch (error: unknown) {
      const err = error as any;
      setErrorMessage(err?.message || 'No se pudo actualizar el estado de la categoría.');
    } finally {
      setTogglingId(null);
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
    <FlatList
      data={categorias}
      keyExtractor={(item, index) => String(item.id ?? index)}
      nestedScrollEnabled
      style={styles.container}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <>
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

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Estado</Text>
              <Pressable
                style={[
                  styles.statusToggle,
                  { backgroundColor: activo ? '#10b981' : '#ef4444' }
                ]}
                onPress={() => setActivo(!activo)}
              >
                <Text style={styles.statusToggleText}>{activo ? 'Activo' : 'Inactivo'}</Text>
              </Pressable>
            </View>

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
          </View>
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.categoryCard}>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{item.nombre}</Text>
            <Text style={styles.categoryDescription}>{item.descripcion || 'Sin descripción'}</Text>
          </View>
          <View style={styles.categoryActions}>
            <Text style={[styles.categoryStatus, { color: item.activo ? '#10b981' : '#ef4444' }]}>
              {item.activo ? 'Activo' : 'Inactivo'}
            </Text>
            <Pressable
              style={[
                styles.toggleBtn,
                { backgroundColor: item.activo ? '#ef4444' : '#10b981' }
              ]}
              onPress={() => handleToggleCategoria(item.id)}
              disabled={togglingId === item.id}
            >
              <Text style={styles.toggleBtnText}>
                {togglingId === item.id ? 'Espere...' : item.activo ? 'Desactivar' : 'Activar'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
      ListEmptyComponent={!loading ? <Text style={styles.emptyText}>No hay categorías todavía.</Text> : null}
      ListFooterComponent={
        loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Cargando categorías...</Text>
          </View>
        ) : null
      }
    />
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
  categoryInfo: { flex: 1, paddingRight: 12 },
  categoryActions: { alignItems: 'flex-end', gap: 8 },
  categoryName: { fontSize: 16, fontWeight: '700' },
  categoryDescription: { color: '#6b7280', marginTop: 4 },
  categoryStatus: { fontSize: 12, fontWeight: '700' },
  toggleBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999 },
  toggleBtnText: { color: '#fff', fontWeight: '700' },
  emptyText: { color: '#6b7280', textAlign: 'center', marginTop: 16 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  toggleLabel: { fontSize: 14, fontWeight: '700', color: '#374151' },
  statusToggle: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999 },
  statusToggleText: { color: '#fff', fontWeight: '700' },
  restrictedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  restrictedTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  restrictedSubtitle: { color: '#6b7280', textAlign: 'center' },
});

