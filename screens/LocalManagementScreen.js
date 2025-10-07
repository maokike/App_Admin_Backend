import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Alert,
    RefreshControl
} from 'react-native';
import { globalStyles, colors } from '../styles/globalStyles';
import { localManagementStyles } from '../styles/LocalManagementStyles';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, doc, runTransaction, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase-init';
import { useToast } from '../hooks/useToast';
import { getLocalUsers, getLocales } from '../services/firestoreService';

const LocalManagementScreen = ({ navigation }) => {
    const [locals, setLocals] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Obtener locales usando la función del servicio
            const localesData = await getLocales();
            console.log('📍 Locales obtenidos:', localesData);
            
            // Obtener usuarios locales
            const localUsers = await getLocalUsers();
            console.log('👥 Usuarios locales:', localUsers);
            
            setLocals(localesData);
            setUsers(localUsers);
        } catch (error) {
            console.error("Error fetching data: ", error);
            showToast('error', 'Error', 'No se pudieron cargar los datos');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Función para debuggear - muestra qué colecciones existen
    const debugCollections = async () => {
        try {
            console.log('🔍 Buscando colección "locals"...');
            const localsSnapshot = await getDocs(collection(db, "locals"));
            console.log('📁 "locals" encontrados:', localsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            
            console.log('🔍 Buscando colección "Locales"...');
            const LocalesSnapshot = await getDocs(collection(db, "Locales"));
            console.log('📁 "Locales" encontrados:', LocalesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error('Error en debug:', error);
        }
    };

    const handleAddLocal = async (localData) => {
        try {
            await runTransaction(db, async (transaction) => {
                const newLocalRef = doc(collection(db, "Locales")); // ✅ Usar "Locales" si esa es la colección correcta
                transaction.set(newLocalRef, { 
                    ...localData, 
                    id: newLocalRef.id 
                });

                const userRef = doc(db, "Usuarios", localData.userId);
                const localAssignment = {
                    localId: newLocalRef.id,
                    name: localData.name
                };
                transaction.update(userRef, {
                    locales_asignados: arrayUnion(localAssignment)
                });
            });

            showToast('success', 'Local Creado', `El local ${localData.name} ha sido añadido.`);
            fetchData(); // Recargar datos
        } catch (error) {
            console.error("Error creating local: ", error);
            showToast('error', 'Error', 'No se pudo crear el local');
        }
    };

    const handleUpdateLocal = async (updatedLocal) => {
        try {
            await runTransaction(db, async (transaction) => {
                const localRef = doc(db, "Locales", updatedLocal.id); // ✅ Usar "Locales"
                const originalLocalDoc = await transaction.get(localRef);
                if (!originalLocalDoc.exists()) {
                    throw new Error("Local no encontrado");
                }
                const originalLocalData = originalLocalDoc.data();

                // If user assignment has changed
                if (originalLocalData.userId !== updatedLocal.userId) {
                    // Remove assignment from old user
                    if (originalLocalData.userId) {
                        const oldUserRef = doc(db, "Usuarios", originalLocalData.userId);
                        const oldAssignment = { 
                            localId: originalLocalData.id, 
                            name: originalLocalData.name 
                        };
                        transaction.update(oldUserRef, { 
                            locales_asignados: arrayRemove(oldAssignment) 
                        });
                    }

                    // Add assignment to new user
                    const newUserRef = doc(db, "Usuarios", updatedLocal.userId);
                    const newAssignment = { 
                        localId: updatedLocal.id, 
                        name: updatedLocal.name 
                    };
                    transaction.update(newUserRef, { 
                        locales_asignados: arrayUnion(newAssignment) 
                    });
                }

                transaction.update(localRef, { ...updatedLocal });
            });

            showToast('success', 'Local Actualizado', `El local ${updatedLocal.name} ha sido actualizado.`);
            fetchData(); // Recargar datos
        } catch (error) {
            console.error("Error updating local: ", error);
            showToast('error', 'Error', 'No se pudo actualizar el local');
        }
    };

    const handleDeleteLocal = async (localId, localName) => {
        Alert.alert(
            "Eliminar Local",
            `¿Está seguro que desea eliminar el local "${localName}"? Esta acción no se puede deshacer.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await runTransaction(db, async (transaction) => {
                                const localRef = doc(db, "Locales", localId); // ✅ Usar "Locales"
                                const localDoc = await transaction.get(localRef);
                                if (!localDoc.exists()) return;
                                const localData = localDoc.data();

                                transaction.delete(localRef);

                                if (localData.userId) {
                                    const userRef = doc(db, "Usuarios", localData.userId);
                                    const assignmentToRemove = { 
                                        localId: localId, 
                                        name: localData.name 
                                    };
                                    transaction.update(userRef, { 
                                        locales_asignados: arrayRemove(assignmentToRemove) 
                                    });
                                }
                            });

                            showToast('success', 'Local Eliminado', 'El local ha sido eliminado correctamente.');
                            fetchData(); // Recargar datos
                        } catch (error) {
                            console.error("Error deleting local: ", error);
                            showToast('error', 'Error', 'No se pudo eliminar el local');
                        }
                    }
                }
            ]
        );
    };

    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user?.name || user?.email || 'No asignado';
    };

    const renderLocalItem = ({ item }) => (
        <View style={localManagementStyles.localCard}>
            <View style={localManagementStyles.localHeader}>
                <View style={localManagementStyles.localInfo}>
                    <Ionicons name="business" size={24} color={colors.primaryPink} />
                    <View style={localManagementStyles.localDetails}>
                        <Text style={localManagementStyles.localName}>
                            {item.name || item.Nombre || 'Sin nombre'}
                        </Text>
                        <Text style={localManagementStyles.localAddress}>
                            {item.address || item.Dirección || 'Sin dirección'}
                        </Text>
                        {item.phone && (
                            <Text style={localManagementStyles.localPhone}>{item.phone}</Text>
                        )}
                        <Text style={localManagementStyles.localUser}>
                            Usuario: {getUserName(item.userId)}
                        </Text>
                        <Text style={localManagementStyles.localId}>
                            ID: {item.id}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={localManagementStyles.localActions}>
                <TouchableOpacity
                    style={[localManagementStyles.actionButton, localManagementStyles.editButton]}
                    onPress={() => navigation.navigate('EditLocal', { 
                        local: item, 
                        users, 
                        onLocalUpdated: handleUpdateLocal,
                        onLocalDeleted: handleDeleteLocal
                    })}
                >
                    <Ionicons name="pencil" size={16} color={colors.white} />
                    <Text style={localManagementStyles.actionButtonText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[localManagementStyles.actionButton, localManagementStyles.inventoryButton]}
                    onPress={() => navigation.navigate('InventoryScreen', { localId: item.id })}
                >
                    <Ionicons name="cube" size={16} color={colors.white} />
                    <Text style={localManagementStyles.actionButtonText}>Inventario</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[localManagementStyles.actionButton, localManagementStyles.deleteButton]}
                    onPress={() => handleDeleteLocal(item.id, item.name || item.Nombre)}
                >
                    <Ionicons name="trash" size={16} color={colors.white} />
                    <Text style={localManagementStyles.actionButtonText}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={globalStyles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.primaryPink} />
                <Text style={localManagementStyles.loadingText}>Cargando locales...</Text>
                <TouchableOpacity 
                    style={localManagementStyles.debugButton}
                    onPress={debugCollections}
                >
                    <Text style={localManagementStyles.debugButtonText}>Debug Colecciones</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={globalStyles.container}>
            <View style={globalStyles.header}>
                <View>
                    <Text style={globalStyles.title}>Gestión de Locales</Text>
                    <Text style={localManagementStyles.subtitle}>
                        {locals.length} locales registrados
                    </Text>
                </View>
                <TouchableOpacity
                    style={localManagementStyles.addButton}
                    onPress={() => navigation.navigate('AddLocal', { 
                        users, 
                        onLocalAdded: handleAddLocal 
                    })}
                >
                    <Ionicons name="add" size={20} color={colors.white} />
                    <Text style={localManagementStyles.addButtonText}>Nuevo Local</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={fetchData}
                        colors={[colors.primaryPink]}
                    />
                }
            >
                {locals.length === 0 ? (
                    <View style={localManagementStyles.emptyState}>
                        <Ionicons name="business-outline" size={64} color={colors.textLight} />
                        <Text style={localManagementStyles.emptyText}>No hay locales registrados</Text>
                        <Text style={localManagementStyles.emptySubtext}>
                            Presiona "Nuevo Local" para agregar el primero
                        </Text>
                        <TouchableOpacity 
                            style={localManagementStyles.debugButton}
                            onPress={debugCollections}
                        >
                            <Text style={localManagementStyles.debugButtonText}>Verificar Colecciones</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={locals}
                        renderItem={renderLocalItem}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                        contentContainerStyle={localManagementStyles.listContainer}
                    />
                )}
            </ScrollView>
        </View>
    );
};

export default LocalManagementScreen;