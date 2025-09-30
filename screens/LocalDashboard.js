import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    TouchableOpacity, 
    ActivityIndicator, 
    ScrollView, 
    Alert  // ✅ Agregar Alert aquí
} from 'react-native';
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
                        const userData = await getUser(user.uid);
                        
                        if (userData) {
                            setUserName(userData.nombre || userData.name || user.email || 'Usuario');
                            setRole(userData.rol || 'local');
                            const locales = await getUserAssignedLocales(user.uid);
                            setAssignedLocales(locales);
                        } else {
                            setUserName(user.email || 'Usuario');
                            setRole('local');
                            setAssignedLocales([]);
                        }
                    }
                } catch (error) {
                    console.error("Error al obtener los datos del usuario: ", error);
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

    const handleLocalPress = (local) => {
        // Menú de opciones para el local
        Alert.alert(
            `Opciones - ${local.nombre}`,
            '¿Qué acción deseas realizar?',
            [
                {
                    text: 'Ver Menú',
                    onPress: () => navigation.navigate('LocalMenu', { 
                        localId: local.localId, 
                        localName: local.nombre 
                    })
                },
                {
                    text: 'Resumen del Día',
                    onPress: () => navigation.navigate('DailySummary', { 
                        localId: local.localId 
                    })
                },
                {
                    text: 'Historial de Ventas',
                    onPress: () => navigation.navigate('SalesHistory', { 
                        localId: local.localId 
                    })
                },
                {
                    text: 'Registrar Venta',
                    onPress: () => navigation.navigate('RegisterSale', { 
                        localId: local.localId,
                        localName: local.nombre 
                    })
                },
                {
                    text: 'Inventario',
                    onPress: () => navigation.navigate('Inventory', { 
                        localId: local.localId 
                    })
                },
                {
                    text: 'Cancelar',
                    style: 'cancel'
                }
            ]
        );
    };

    // ✅ Función corregida para manejar acciones rápidas con múltiples locales
    const handleQuickAction = (actionType) => {
        if (assignedLocales.length === 0) {
            Alert.alert("Sin locales", "No tienes locales asignados.");
            return;
        }

        if (assignedLocales.length === 1) {
            // Si solo tiene un local, navegar directamente
            const local = assignedLocales[0];
            if (actionType === 'dailySummary') {
                navigation.navigate('DailySummary', { localId: local.localId });
            } else if (actionType === 'registerSale') {
                navigation.navigate('RegisterSale', { 
                    localId: local.localId,
                    localName: local.nombre 
                });
            }
        } else {
            // Si tiene múltiples locales, mostrar selector
            Alert.alert(
                "Selecciona un local",
                "Tienes múltiples locales asignados",
                [
                    ...assignedLocales.map(local => ({
                        text: local.nombre,
                        onPress: () => {
                            if (actionType === 'dailySummary') {
                                navigation.navigate('DailySummary', { localId: local.localId });
                            } else if (actionType === 'registerSale') {
                                navigation.navigate('RegisterSale', { 
                                    localId: local.localId,
                                    localName: local.nombre 
                                });
                            }
                        }
                    })),
                    {
                        text: 'Cancelar',
                        style: 'cancel'
                    }
                ]
            );
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={localDashboardStyles.localCard}
            onPress={() => handleLocalPress(item)}
        >
            <View style={localDashboardStyles.cardContent}>
                <View style={localDashboardStyles.localIcon}>
                    <Ionicons name="storefront" size={24} color={colors.white} />
                </View>
                <View style={localDashboardStyles.localInfo}>
                    <Text style={localDashboardStyles.localName}>{item.nombre}</Text>
                    <Text style={localDashboardStyles.localRole}>Encargado</Text>
                    <Text style={localDashboardStyles.localId}>ID: {item.localId}</Text>
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

            <ScrollView 
                style={localDashboardStyles.scrollView}
                contentContainerStyle={localDashboardStyles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Sección de Acciones Rápidas - Solo mostrar si hay locales */}
                {assignedLocales.length > 0 && (
                    <View style={localDashboardStyles.quickActions}>
                        <Text style={globalStyles.subtitle}>Acciones Rápidas</Text>
                        <View style={localDashboardStyles.actionsGrid}>
                            <TouchableOpacity 
                                style={localDashboardStyles.actionCard}
                                onPress={() => handleQuickAction('dailySummary')}
                            >
                                <Ionicons name="today" size={24} color={colors.primaryPink} />
                                <Text style={localDashboardStyles.actionText}>Resumen del Día</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={localDashboardStyles.actionCard}
                                onPress={() => handleQuickAction('registerSale')}
                            >
                                <Ionicons name="add-circle" size={24} color={colors.primaryPink} />
                                <Text style={localDashboardStyles.actionText}>Nueva Venta</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Sección de Locales Asignados */}
                <View style={localDashboardStyles.sectionHeader}>
                    <Text style={globalStyles.subtitle}>Mis Locales Asignados</Text>
                    <Text style={localDashboardStyles.localesCount}>
                        {assignedLocales.length} {assignedLocales.length === 1 ? 'local' : 'locales'}
                    </Text>
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
                            <Text style={localDashboardStyles.emptySubtext}>
                                Contacta a un administrador para que te asigne uno
                            </Text>
                        </View>
                    }
                />
            </ScrollView>
        </View>
    );
};

export default LocalDashboard;