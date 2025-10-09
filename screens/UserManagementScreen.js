// screens/UserManagementScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    TextInput
} from 'react-native';
import { globalStyles, colors } from '../styles/globalStyles';
import { userManagementStyles } from '../styles/UserManagementStyles';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase-init';
import { useToast } from '../hooks/useToast';
import { getLocales } from '../services/firestoreService';

const UserManagementScreen = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [locales, setLocales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { showToast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Obtener usuarios
            const usersRef = collection(db, 'Usuarios');
            const usersSnapshot = await getDocs(usersRef);
            const usersData = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersData);

            // Obtener locales para asignación
            const localesData = await getLocales();
            setLocales(localesData);
        } catch (error) {
            console.error("Error fetching data: ", error);
            showToast('error', 'Error', 'No se pudieron cargar los datos');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleCreateUser = () => {
        navigation.navigate('EditUser', { 
            locales,
            onUserSaved: fetchData 
        });
    };

    const handleEditUser = (user) => {
        navigation.navigate('EditUser', { 
            user,
            locales,
            onUserSaved: fetchData 
        });
    };

    const handleUpdateUserRole = async (userId, newRole) => {
        try {
            const userRef = doc(db, 'Usuarios', userId);
            await updateDoc(userRef, { rol: newRole });
            showToast('success', 'Rol Actualizado', 'El rol del usuario ha sido actualizado');
            fetchData();
        } catch (error) {
            console.error("Error updating user role: ", error);
            showToast('error', 'Error', 'No se pudo actualizar el rol');
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        Alert.alert(
            "Eliminar Usuario",
            `¿Está seguro que desea eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const userRef = doc(db, 'Usuarios', userId);
                            await deleteDoc(userRef);
                            showToast('success', 'Usuario Eliminado', 'El usuario ha sido eliminado');
                            fetchData();
                        } catch (error) {
                            console.error("Error deleting user: ", error);
                            showToast('error', 'Error', 'No se pudo eliminar el usuario');
                        }
                    }
                }
            ]
        );
    };

    const getAssignedLocales = (user) => {
        if (!user.locales_asignados || !Array.isArray(user.locales_asignados)) return [];
        return user.locales_asignados;
    };

    const filteredUsers = users.filter(user => 
        user.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.rol?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderUserItem = ({ item }) => (
        <View style={userManagementStyles.userCard}>
            <View style={userManagementStyles.userInfo}>
                <Ionicons name="person" size={24} color={colors.primaryPink} />
                <View style={userManagementStyles.userDetails}>
                    <Text style={userManagementStyles.userName}>
                        {item.nombre || 'Sin nombre'}
                    </Text>
                    <Text style={userManagementStyles.userEmail}>
                        {item.email}
                    </Text>
                    <Text style={userManagementStyles.userRole}>
                        Rol: <Text style={{ 
                            color: item.rol === 'admin' ? colors.primaryFuchsia : colors.primaryBlue,
                            fontWeight: 'bold'
                        }}>
                            {item.rol || 'Sin asignar'}
                        </Text>
                    </Text>
                    
                    {/* Locales asignados */}
                    {getAssignedLocales(item).length > 0 && (
                        <View style={userManagementStyles.localesContainer}>
                            <Text style={userManagementStyles.localesLabel}>
                                Locales asignados:
                            </Text>
                            {getAssignedLocales(item).map((local, index) => (
                                <View key={index} style={userManagementStyles.localTag}>
                                    <Text style={userManagementStyles.localTagText}>
                                        {local.nombre}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                    
                    <Text style={userManagementStyles.userId}>
                        ID: {item.id}
                    </Text>
                </View>
            </View>
            
            <View style={userManagementStyles.userActions}>
                <TouchableOpacity
                    style={[userManagementStyles.actionButton, userManagementStyles.editButton]}
                    onPress={() => handleEditUser(item)}
                >
                    <Ionicons name="pencil" size={16} color={colors.white} />
                    <Text style={userManagementStyles.actionButtonText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[userManagementStyles.actionButton, userManagementStyles.roleButton]}
                    onPress={() => {
                        const newRole = item.rol === 'admin' ? 'local' : 'admin';
                        handleUpdateUserRole(item.id, newRole);
                    }}
                >
                    <Ionicons name="swap-horizontal" size={16} color={colors.white} />
                    <Text style={userManagementStyles.actionButtonText}>
                        {item.rol === 'admin' ? 'Hacer Local' : 'Hacer Admin'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[userManagementStyles.actionButton, userManagementStyles.deleteButton]}
                    onPress={() => handleDeleteUser(item.id, item.nombre || item.email)}
                >
                    <Ionicons name="trash" size={16} color={colors.white} />
                    <Text style={userManagementStyles.actionButtonText}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={globalStyles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.primaryPink} />
                <Text style={userManagementStyles.loadingText}>Cargando usuarios...</Text>
            </View>
        );
    }

    return (
        <View style={globalStyles.container}>
            <View style={globalStyles.header}>
                <View>
                    <Text style={globalStyles.title}>Gestión de Usuarios</Text>
                    <Text style={userManagementStyles.subtitle}>
                        {users.length} usuarios registrados
                    </Text>
                </View>
                <TouchableOpacity
                    style={userManagementStyles.addButton}
                    onPress={handleCreateUser}
                >
                    <Ionicons name="add" size={20} color={colors.white} />
                    <Text style={userManagementStyles.addButtonText}>Nuevo Usuario</Text>
                </TouchableOpacity>
            </View>

            {/* Barra de búsqueda */}
            <View style={userManagementStyles.searchContainer}>
                <Ionicons name="search" size={20} color={colors.textLight} />
                <TextInput
                    style={userManagementStyles.searchInput}
                    placeholder="Buscar por nombre, email o rol..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={filteredUsers}
                renderItem={renderUserItem}
                keyExtractor={item => item.id}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={fetchData}
                        colors={[colors.primaryPink]}
                    />
                }
                contentContainerStyle={userManagementStyles.listContainer}
                ListEmptyComponent={
                    <View style={userManagementStyles.emptyState}>
                        <Ionicons name="people-outline" size={64} color={colors.textLight} />
                        <Text style={userManagementStyles.emptyText}>
                            {searchQuery ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                        </Text>
                        {!searchQuery && (
                            <TouchableOpacity
                                style={userManagementStyles.addButton}
                                onPress={handleCreateUser}
                            >
                                <Ionicons name="add" size={20} color={colors.white} />
                                <Text style={userManagementStyles.addButtonText}>Crear Primer Usuario</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                }
            />
        </View>
    );
};

export default UserManagementScreen;