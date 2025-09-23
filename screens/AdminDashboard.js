import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { auth } from '../firebase-init';
import { signOut } from 'firebase/auth';
import { globalStyles, colors } from '../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { getLocales } from '../services/firestoreService';

const AdminDashboard = ({ navigation }) => {
    const [locales, setLocales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLocales = async () => {
            try {
                const localesList = await getLocales();
                setLocales(localesList);
            } catch (error) {
                console.error("Error al obtener los locales: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLocales();
    }, []);

    const handleLogout = () => {
        signOut(auth).catch(error => console.error('Error al cerrar sesión:', error));
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.localCard}
            onPress={() => navigation.navigate('LocalDetail', { 
                localId: item.id, 
                localName: item.Nombre || item.nombre || 'Local sin nombre' 
            })}
        >
            <View style={styles.cardContent}>
                <Ionicons name="business" size={24} color={colors.primaryPink} />
                <View style={styles.localInfo}>
                    <Text style={styles.localName}>
                        {item.Nombre || item.nombre || 'Local sin nombre'}
                    </Text>
                    <Text style={styles.localAddress}>
                        {item.Dirección || item.direccion || 'Sin dirección'}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={globalStyles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.primaryPink} />
                <Text style={styles.loadingText}>Cargando locales...</Text>
            </View>
        );
    }

    return (
        <View style={globalStyles.container}>
            <View style={globalStyles.header}>
                <View>
                    <Text style={globalStyles.title}>Panel de Administrador</Text>
                    <Text style={styles.subtitle}>Gestión de locales</Text>
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={colors.white} />
                    <Text style={styles.logoutText}>Salir</Text>
                </TouchableOpacity>
            </View>

            <ScrollView>
                <View style={styles.sectionHeader}>
                    <Text style={globalStyles.subtitle}>Lista de Locales</Text>
                    <Text style={styles.localesCount}>{locales.length} locales</Text>
                </View>

                <FlatList
                    data={locales}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="business-outline" size={48} color={colors.textLight} />
                            <Text style={styles.emptyText}>No se encontraron locales</Text>
                            <Text style={styles.emptySubtext}>
                                Añade locales en la consola de Firebase
                            </Text>
                        </View>
                    }
                />
            </ScrollView>
        </View>
    );
};

const styles = {
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
    localInfo: {
        flex: 1,
        marginLeft: 12,
    },
    localName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textDark,
    },
    localAddress: {
        fontSize: 14,
        color: colors.textLight,
        marginTop: 4,
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

export default AdminDashboard;