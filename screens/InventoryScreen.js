import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { db } from '../firebase-init';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { globalStyles, colors } from '../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const InventoryScreen = ({ localId }) => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const inventoryRef = collection(db, 'Locales', localId, 'inventario');
                const q = query(inventoryRef, orderBy('nombre'));
                const querySnapshot = await getDocs(q);
                
                const inventoryList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setInventory(inventoryList);
            } catch (error) {
                console.error("Error al obtener el inventario: ", error);
            } finally {
                setLoading(false);
            }
        };

        if (localId) {
            fetchInventory();
        }
    }, [localId]);

    const renderItem = ({ item }) => (
        <View style={styles.inventoryCard}>
            <View style={styles.productHeader}>
                <Text style={styles.productName}>{item.nombre}</Text>
                <Text style={styles.productPrice}>${item.precio?.toFixed(2) || '0.00'}</Text>
            </View>
            <View style={styles.productDetails}>
                <View style={styles.stockInfo}>
                    <Ionicons name="cube-outline" size={16} color={colors.textLight} />
                    <Text style={styles.stockText}>Stock: {item.cantidad || 0}</Text>
                </View>
                <View style={[styles.stockBadge, 
                    { backgroundColor: item.cantidad > 10 ? colors.success : 
                                      item.cantidad > 0 ? '#FFA000' : colors.error }]}>
                    <Text style={styles.stockBadgeText}>
                        {item.cantidad > 10 ? 'Disponible' : 
                         item.cantidad > 0 ? 'Bajo Stock' : 'Agotado'}
                    </Text>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={globalStyles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.primaryPink} />
                <Text style={styles.loadingText}>Cargando inventario...</Text>
            </View>
        );
    }

    return (
        <View style={globalStyles.container}>
            <ScrollView>    
                <View style={styles.header}>
                    <Text style={globalStyles.subtitle}>Inventario del Local</Text>
                    <Text style={styles.productCount}>{inventory.length} productos</Text>
                </View>

                <FlatList
                    data={inventory}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="cube-outline" size={48} color={colors.textLight} />
                            <Text style={styles.emptyText}>No hay productos en el inventario</Text>
                            <Text style={styles.emptySubtext}>Agrega productos desde la consola de Firebase</Text>
                        </View>
                    }
                />
            </ScrollView>
        </View>
    );
};

const styles = {
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
    },
    productCount: {
        color: colors.primaryPink,
        fontWeight: '600',
    },
    inventoryCard: {
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
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textDark,
        flex: 1,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primaryFuchsia,
    },
    productDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stockInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    stockText: {
        fontSize: 14,
        color: colors.textLight,
    },
    stockBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    stockBadgeText: {
        fontSize: 12,
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

export default InventoryScreen;