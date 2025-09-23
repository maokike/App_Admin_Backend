import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { db } from '../firebase-init';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { globalStyles, colors } from '../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const DailySummaryScreen = ({ route }) => {
    const { localId } = route.params;
    const [sales, setSales] = useState([]);
    const [summary, setSummary] = useState({ totalRevenue: 0, saleCount: 0, averageSale: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchSummary = useCallback(async () => {
        try {
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

            const salesPath = `Locales/${localId}/ventas`;
            const q = query(
                collection(db, salesPath),
                where('fecha', '>=', startOfDay),
                where('fecha', '<=', endOfDay),
                orderBy('fecha', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const salesList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setSales(salesList);

            const totalRevenue = salesList.reduce((sum, sale) => sum + sale.total, 0);
            const saleCount = salesList.length;
            const averageSale = saleCount > 0 ? totalRevenue / saleCount : 0;

            setSummary({ totalRevenue, saleCount, averageSale });

        } catch (error) {
            console.error("Error al obtener el resumen diario: ", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [localId]);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchSummary();
        }, [fetchSummary])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchSummary();
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp || !timestamp.toDate) return 'Hora no disponible';
        return timestamp.toDate().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    const getPaymentIcon = (tipoPago) => {
        return tipoPago === 'efectivo' ? 'cash' : 'card';
    };

    if (loading) {
        return (
            <View style={globalStyles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.primaryPink} />
                <Text style={styles.loadingText}>Cargando resumen...</Text>
            </View>
        );
    }

    const renderItem = ({ item }) => (
        <View style={styles.saleCard}>
            <View style={styles.saleHeader}>
                <Text style={styles.productName}>{item.producto}</Text>
                <Text style={styles.saleTotal}>${item.total?.toFixed(2)}</Text>
            </View>
            <View style={styles.saleDetails}>
                <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={14} color={colors.textLight} />
                    <Text style={styles.detailText}>{formatTimestamp(item.fecha)}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="cube-outline" size={14} color={colors.textLight} />
                    <Text style={styles.detailText}>Cantidad: {item.cantidad}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name={getPaymentIcon(item.tipo_pago)} size={14} color={colors.primaryPink} />
                    <Text style={styles.detailText}>
                        {item.tipo_pago === 'efectivo' ? 'Efectivo' : 'Transferencia'}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={globalStyles.container}>
            <ScrollView 
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh}
                        colors={[colors.primaryPink]}
                    />
                }
            >
                {/* Header con fecha */}
                <View style={styles.dateHeader}>
                    <Ionicons name="calendar" size={24} color={colors.primaryFuchsia} />
                    <Text style={styles.dateText}>
                        {new Date().toLocaleDateString('es-ES', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </Text>
                </View>

                {/* Tarjetas de resumen */}
                <View style={styles.summaryGrid}>
                    <View style={[styles.summaryCard, { backgroundColor: colors.primaryPink }]}>
                        <Ionicons name="cash" size={32} color={colors.white} />
                        <Text style={styles.summaryValue}>${summary.totalRevenue.toFixed(2)}</Text>
                        <Text style={styles.summaryLabel}>Ingresos Totales</Text>
                    </View>

                    <View style={[styles.summaryCard, { backgroundColor: colors.primaryFuchsia }]}>
                        <Ionicons name="receipt" size={32} color={colors.white} />
                        <Text style={styles.summaryValue}>{summary.saleCount}</Text>
                        <Text style={styles.summaryLabel}>Ventas Realizadas</Text>
                    </View>

                    <View style={[styles.summaryCard, { backgroundColor: colors.darkPink }]}>
                        <Ionicons name="trending-up" size={32} color={colors.white} />
                        <Text style={styles.summaryValue}>${summary.averageSale.toFixed(2)}</Text>
                        <Text style={styles.summaryLabel}>Promedio por Venta</Text>
                    </View>
                </View>

                {/* Lista de ventas */}
                <View style={styles.salesSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={globalStyles.subtitle}>Ventas del Día</Text>
                        <Text style={styles.salesCount}>{sales.length} ventas</Text>
                    </View>

                    {sales.length > 0 ? (
                        <FlatList
                            data={sales}
                            renderItem={renderItem}
                            keyExtractor={item => item.id}
                            scrollEnabled={false}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={64} color={colors.textLight} />
                            <Text style={styles.emptyText}>No hay ventas hoy</Text>
                            <Text style={styles.emptySubtext}>
                                Las ventas realizadas hoy aparecerán aquí
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = {
    dateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
        padding: 20,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        gap: 12,
        shadowColor: colors.darkGray,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textDark,
        textTransform: 'capitalize',
    },
    summaryGrid: {
        padding: 16,
        gap: 12,
    },
    summaryCard: {
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: colors.darkGray,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.white,
        marginTop: 8,
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 14,
        color: colors.white,
        fontWeight: '600',
        opacity: 0.9,
    },
    salesSection: {
        marginTop: 8,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    salesCount: {
        color: colors.primaryPink,
        fontWeight: '600',
        fontSize: 14,
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
        marginBottom: 8,
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
    emptyState: {
        alignItems: 'center',
        padding: 40,
        marginTop: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textDark,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.textLight,
        textAlign: 'center',
        marginTop: 8,
    },
    loadingText: {
        marginTop: 12,
        color: colors.textLight,
    },
};

export default DailySummaryScreen;