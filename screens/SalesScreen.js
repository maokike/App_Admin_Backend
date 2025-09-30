import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { db } from '../firebase-init';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { globalStyles, colors } from '../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const SalesScreen = ({ localId }) => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'today', 'week'

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const salesRef = collection(db, 'Locales', localId, 'ventas');
                let q = query(salesRef, orderBy('fecha', 'desc'));
                
                // Aquí puedes agregar filtros por fecha si lo necesitas
                const querySnapshot = await getDocs(q);
                
                const salesList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setSales(salesList);
            } catch (error) {
                console.error("Error al obtener las ventas: ", error);
            } finally {
                setLoading(false);
            }
        };

        if (localId) {
            fetchSales();
        }
    }, [localId, filter]);

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Fecha no disponible';
        const date = timestamp.toDate();
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPaymentIcon = (tipoPago) => {
        return tipoPago === 'efectivo' ? 'cash' : 'card';
    };

    const getPaymentColor = (tipoPago) => {
        return tipoPago === 'efectivo' ? colors.success : colors.primaryPink;
    };

    const renderItem = ({ item }) => (
        <View style={styles.saleCard}>
            <View style={styles.saleHeader}>
                <Text style={styles.productName}>{item.producto}</Text>
                <Text style={styles.saleTotal}>${item.total?.toFixed(2) || '0.00'}</Text>
            </View>
            
            <View style={styles.saleDetails}>
                <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textLight} />
                    <Text style={styles.detailText}>{formatDate(item.fecha)}</Text>
                </View>
                
                <View style={styles.detailRow}>
                    <Ionicons name="cube-outline" size={14} color={colors.textLight} />
                    <Text style={styles.detailText}>Cantidad: {item.cantidad}</Text>
                </View>
                
                <View style={styles.detailRow}>
                    <Ionicons name={getPaymentIcon(item.tipo_pago)} size={14} color={getPaymentColor(item.tipo_pago)} />
                    <Text style={[styles.detailText, { color: getPaymentColor(item.tipo_pago) }]}>
                        {item.tipo_pago === 'efectivo' ? 'Efectivo' : 'Transferencia'}
                    </Text>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={globalStyles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.primaryPink} />
                <Text style={styles.loadingText}>Cargando ventas...</Text>
            </View>
        );
    }

    const totalSales = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);

    return (
        <View style={globalStyles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <View>
                        <Text style={globalStyles.subtitle}>Historial de Ventas</Text>
                        <Text style={styles.salesSummary}>Total: ${totalSales.toFixed(2)}</Text>
                    </View>
                    <Text style={styles.salesCount}>{sales.length} ventas</Text>
                </View>

                <FlatList
                    data={sales}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={48} color={colors.textLight} />
                            <Text style={styles.emptyText}>No hay ventas registradas</Text>
                            <Text style={styles.emptySubtext}>Las ventas aparecerán aquí una vez se registren</Text>
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
    salesCount: {
        color: colors.primaryPink,
        fontWeight: '600',
    },
    salesSummary: {
        fontSize: 14,
        color: colors.textLight,
        marginTop: 2,
    },
    saleCard: {
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
    saleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textDark,
        flex: 1,
    },
    saleTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primaryFuchsia,
    },
    saleDetails: {
        gap: 6,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 14,
        color: colors.textLight,
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

export default SalesScreen;