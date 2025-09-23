import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { auth } from '../firebase-init';
import { signOut } from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native';
import { globalStyles, colors } from '../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { getUserAssignedLocales } from '../services/firestoreService';

const LocalDashboard = ({ navigation }) => {
    const [assignedLocales, setAssignedLocales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [role, setRole] = useState('');

    useFocusEffect(
        useCallback(() => {
            const fetchAssignedLocales = async () => {
                setLoading(true);
                try {
                    const user = auth.currentUser;
                    if (user) {
                        const locales = await getUserAssignedLocales(user.uid);
                        setAssignedLocales(locales);
                        
                        // También obtener info del usuario para mostrar nombre
                        // Esto lo haremos en el servicio getUserAssignedLocales
                        setUserName(user.email || 'Usuario');
                        setRole('local'); // O obtener del servicio
                    }
                } catch (error) {
                    console.error("Error al obtener los locales asignados: ", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchAssignedLocales();
        }, [])
    );

    const handleLogout = () => {
        signOut(auth).catch(error => console.error('Error al cerrar sesión:', error));
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.localCard}
            onPress={() => navigation.navigate('LocalMenu', { 
                localId: item.localId, 
                localName: item.nombre 
            })}
        >
            <View style={styles.cardContent}>
                <View style={styles.localIcon}>
                    <Ionicons name="storefront" size={24} color={colors.white} />
                </View>
                <View style={styles.localInfo}>
                    <Text style={styles.localName}>{item.nombre}</Text>
                    <Text style={styles.localRole}>Encargado</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={globalStyles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.primaryPink} />
                <Text style={styles.loadingText}>Cargando tus locales...</Text>
            </View>
        );
    }

    return (
        <View style={globalStyles.container}>
            <View style={globalStyles.header}>
                <View>
                    <Text style={styles.welcomeText}>Hola,</Text>
                    <Text style={globalStyles.title}>{userName}</Text>
                    <Text style={styles.roleText}>Encargado de Local</Text>
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={colors.white} />
                    <Text style={styles.logoutText}>Salir</Text>
                </TouchableOpacity>
            </View>

            <ScrollView>
                <View style={styles.sectionHeader}>
                    <Text style={globalStyles.subtitle}>Mis Locales Asignados</Text>
                    <Text style={styles.localesCount}>{assignedLocales.length} locales</Text>
                </View>

                <FlatList
                    data={assignedLocales}
                    renderItem={renderItem}
                    keyExtractor={item => item.localId}
                    scrollEnabled={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="storefront-outline" size={48} color={colors.textLight} />
                            <Text style={styles.emptyText}>Aún no tienes locales asignados</Text>
                            <Text style={styles.emptySubtext}>Contacta a un administrador para que te asigne uno</Text>
                        </View>
                    }
                />
            </ScrollView>
        </View>
    );
};


const styles = {
    welcomeText: {
        fontSize: 16,
        color: colors.textLight,
        marginBottom: 2,
    },
    roleText: {
        fontSize: 14,
        color: colors.primaryPink,
        fontWeight: '600',
        marginTop: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
    },
    localesCount: {
        color: colors.primaryPink,
        fontWeight: '600',
    },
    localCard: {
        backgroundColor: colors.white,
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: 12,
        padding: 16,
        shadowColor: colors.darkGray,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    localIcon: {
        backgroundColor: colors.primaryPink,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    localInfo: {
        flex: 1,
        marginLeft: 12,
    },
    localName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textDark,
    },
    localRole: {
        fontSize: 14,
        color: colors.textLight,
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primaryPink,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        gap: 4,
    },
    logoutText: {
        color: colors.white,
        fontWeight: '600',
    },
    loadingText: {
        marginTop: 12,
        color: colors.textLight,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
        marginTop: 20,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textDark,
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.textLight,
        textAlign: 'center',
        marginTop: 4,
    },
};

export default LocalDashboard;