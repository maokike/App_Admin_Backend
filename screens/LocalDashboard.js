import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { auth } from '../firebase-init';
import { signOut } from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native';
import { globalStyles, colors } from '../styles/globalStyles';
import { localDashboardStyles } from '../styles/LocalDashboardStyles';
import { Ionicons } from '@expo/vector-icons';
import { getUserAssignedLocales, getUser } from '../services/firestoreService';

const LocalDashboard = ({ navigation }) => {
    const [assignedLocales, setAssignedLocales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [role, setRole] = useState('');

    useFocusEffect(
        useCallback(() => {
            const fetchUserData = async () => {
                setLoading(true);
                try {
                    const user = auth.currentUser;
                    if (user) {
                        // Obtener los datos completos del usuario desde Firestore
                        const userData = await getUser(user.uid);
                        
                        if (userData) {
                            // Usar el nombre del usuario en lugar del email
                            setUserName(userData.nombre || userData.name || user.email || 'Usuario');
                            setRole(userData.rol || 'local');
                            
                            // Obtener los locales asignados
                            const locales = await getUserAssignedLocales(user.uid);
                            setAssignedLocales(locales);
                        } else {
                            // Fallback si no se encuentra el usuario en Firestore
                            setUserName(user.email || 'Usuario');
                            setRole('local');
                            setAssignedLocales([]);
                        }
                    }
                } catch (error) {
                    console.error("Error al obtener los datos del usuario: ", error);
                    // Fallback en caso de error
                    const user = auth.currentUser;
                    if (user) {
                        setUserName(user.email || 'Usuario');
                    }
                    setAssignedLocales([]);
                } finally {
                    setLoading(false);
                }
            };

            fetchUserData();
        }, [])
    );

    const handleLogout = () => {
        signOut(auth).catch(error => console.error('Error al cerrar sesión:', error));
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={localDashboardStyles.localCard}
            onPress={() => navigation.navigate('LocalMenu', { 
                localId: item.localId, 
                localName: item.nombre 
            })}
        >
            <View style={localDashboardStyles.cardContent}>
                <View style={localDashboardStyles.localIcon}>
                    <Ionicons name="storefront" size={24} color={colors.white} />
                </View>
                <View style={localDashboardStyles.localInfo}>
                    <Text style={localDashboardStyles.localName}>{item.nombre}</Text>
                    <Text style={localDashboardStyles.localRole}>Encargado</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={globalStyles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.primaryPink} />
                <Text style={localDashboardStyles.loadingText}>Cargando tus locales...</Text>
            </View>
        );
    }

    return (
        <View style={globalStyles.container}>
            <View style={globalStyles.header}>
                <View>
                    <Text style={localDashboardStyles.welcomeText}>Hola,</Text>
                    <Text style={globalStyles.title}>{userName}</Text>
                    <Text style={localDashboardStyles.roleText}>
                        {role === 'admin' ? 'Administrador' : 'Encargado de Local'}
                    </Text>
                </View>
                <TouchableOpacity style={localDashboardStyles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={colors.white} />
                    <Text style={localDashboardStyles.logoutText}>Salir</Text>
                </TouchableOpacity>
            </View>

            <ScrollView>
                <View style={localDashboardStyles.sectionHeader}>
                    <Text style={globalStyles.subtitle}>Mis Locales Asignados</Text>
                    <Text style={localDashboardStyles.localesCount}>{assignedLocales.length} locales</Text>
                </View>

                <FlatList
                    data={assignedLocales}
                    renderItem={renderItem}
                    keyExtractor={item => item.localId}
                    scrollEnabled={false}
                    ListEmptyComponent={
                        <View style={localDashboardStyles.emptyState}>
                            <Ionicons name="storefront-outline" size={48} color={colors.textLight} />
                            <Text style={localDashboardStyles.emptyText}>Aún no tienes locales asignados</Text>
                            <Text style={localDashboardStyles.emptySubtext}>Contacta a un administrador para que te asigne uno</Text>
                        </View>
                    }
                />
            </ScrollView>
        </View>
    );
};

export default LocalDashboard;