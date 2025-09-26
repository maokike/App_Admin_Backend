import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { auth, db } from '../firebase-init';
import { signOut } from 'firebase/auth';
import { globalStyles, colors } from '../styles/globalStyles';
import { adminDashboardStyles } from '../styles/AdminDashboardStyles';
import { Ionicons } from '@expo/vector-icons';
import { getLocales, getUser, getAllUsers } from '../services/firestoreService';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

const AdminDashboard = ({ navigation }) => {
    const [locales, setLocales] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const userData = await getUser(user.uid);
                    setUserName(userData?.nombre || user.email || 'Administrador');
                }

                const localesList = await getLocales();
                setLocales(localesList);

                const usersList = await getAllUsers();
                setUsers(usersList);
            } catch (error) {
                console.error("Error al obtener datos: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleLogout = () => {
        signOut(auth).catch(error => console.error('Error al cerrar sesión:', error));
    };

    const handleAssignLocal = async (local, usuarioId, usuarioNombre) => {
        try {
            const userRef = doc(db, "Usuarios", usuarioId);
            await updateDoc(userRef, {
                locales_asignados: arrayUnion({
                    localId: local.id,
                    nombre: local.Nombre || local.nombre
                })
            });
            Alert.alert("✅ Asignado", `El local ${local.Nombre || local.nombre} fue asignado a ${usuarioNombre}`);
        } catch (error) {
            console.error("Error asignando local: ", error);
            Alert.alert("❌ Error", "No se pudo asignar el local");
        }
    };

    const renderLocal = ({ item }) => (
        <View style={adminDashboardStyles.localCard}>
            <View style={adminDashboardStyles.cardContent}>
                <Ionicons name="business" size={24} color={colors.primaryPink} />
                <View style={adminDashboardStyles.localInfo}>
                    <Text style={adminDashboardStyles.localName}>{item.Nombre || item.nombre}</Text>
                    <Text style={adminDashboardStyles.localAddress}>{item.Dirección || item.direccion}</Text>
                </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                {users.map(u => (
                    <TouchableOpacity
                        key={u.id}
                        style={adminDashboardStyles.assignButton}
                        onPress={() => handleAssignLocal(item, u.id, u.nombre || u.email)}
                    >
                        <Text style={adminDashboardStyles.assignText}>Asignar a {u.nombre || u.email}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    if (loading) {
        return (
            <View style={globalStyles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.primaryPink} />
                <Text style={adminDashboardStyles.loadingText}>Cargando datos...</Text>
            </View>
        );
    }

    return (
        <View style={globalStyles.container}>
            <View style={globalStyles.header}>
                <View>
                    <Text style={globalStyles.title}>Panel de Administrador</Text>
                    <Text style={adminDashboardStyles.userName}>Bienvenido, {userName}</Text>
                </View>
                <TouchableOpacity style={adminDashboardStyles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={colors.white} />
                    <Text style={adminDashboardStyles.logoutText}>Salir</Text>
                </TouchableOpacity>
            </View>

            <ScrollView>
                <View style={adminDashboardStyles.sectionHeader}>
                    <Text style={globalStyles.subtitle}>Locales disponibles</Text>
                </View>

                <FlatList
                    data={locales}
                    renderItem={renderLocal}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                    ListEmptyComponent={<Text>No hay locales</Text>}
                />
            </ScrollView>
        </View>
    );
};

export default AdminDashboard;
