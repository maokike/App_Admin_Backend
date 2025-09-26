import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    ActivityIndicator, 
    ScrollView, 
    RefreshControl, 
    TouchableOpacity
} from 'react-native';
import { db } from '../firebase-init';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { globalStyles, colors } from '../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/DailySummaryStyles';

const formatNumber = (number) => {
    if (number === 0) return '0';
    
    // Convertir a número entero (quitar decimales)
    const integerNumber = Math.round(number);
    
    // Formatear con separadores de miles y millones
    return integerNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, (match, offset, string) => {
        // Después de millones usar apóstrofe, para miles usar punto
        const positionFromEnd = string.length - offset - 3;
        return positionFromEnd >= 6 ? "'" : ".";
    });
};

const DailySummaryScreen = ({ route }) => {
    const { localId } = route.params;
    const [sales, setSales] = useState([]);
    const [summary, setSummary] = useState({ totalRevenue: 0, saleCount: 0, averageSale: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [totalVentasSistema, setTotalVentasSistema] = useState(0);

    const fetchSummary = useCallback(async () => {
        try {
            console.log('🔍 Cargando TODAS las ventas y filtrando localmente...');
            
            // 1. Cargar TODAS las ventas sin filtro (para evitar error de índice)
            const q = query(
                collection(db, 'sales'),
                orderBy('date', 'desc')
            );

            const querySnapshot = await getDocs(q);
            console.log(`✅ Encontradas ${querySnapshot.size} ventas en total`);
            setTotalVentasSistema(querySnapshot.size);

            const allSales = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                allSales.push({
                    id: doc.id,
                    ...data
                });
            });

            // 2. Filtrar localmente por localId
            const localSales = allSales.filter(sale => sale.localId === localId);
            console.log(`📍 Ventas del local ${localId}: ${localSales.length}`);
            
            // Mostrar info de debug
            localSales.forEach(sale => {
                console.log('📦 Venta del local:', {
                    producto: sale.producto,
                    total: sale.total,
                    date: sale.date
                });
            });

            setSales(localSales);

            const totalRevenue = localSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
            const saleCount = localSales.length;
            const averageSale = saleCount > 0 ? totalRevenue / saleCount : 0;

            setSummary({ totalRevenue, saleCount, averageSale });

        } catch (error) {
            console.error("❌ Error:", error);
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
        try {
            if (!timestamp) return 'Fecha no disponible';
            
            if (timestamp.toDate) {
                const date = timestamp.toDate();
                return date.toLocaleString('es-ES', { 
                    day: '2-digit',
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            }
            
            return 'Formato inválido';
        } catch (error) {
            return 'Error en fecha';
        }
    };

    const getPaymentIcon = (tipoPago) => {
        return tipoPago === 'efectivo' ? 'cash' : 'card';
    };

    if (loading) {
        return (
            <View style={globalStyles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.primaryPink} />
                <Text style={styles.loadingText}>Cargando ventas...</Text>
            </View>
        );
    }

    const renderItem = ({ item }) => (
        <View style={styles.saleCard}>
            <View style={styles.saleHeader}>
                <Text style={styles.productName}>{item.producto}</Text>
                {/* CAMBIADO: usar formatNumber en lugar de toFixed(2) */}
                <Text style={styles.saleTotal}>${formatNumber(item.total || 0)}</Text>
            </View>
            <View style={styles.saleDetails}>
                <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={14} color={colors.textLight} />
                    <Text style={styles.detailText}>{formatTimestamp(item.date)}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="cube-outline" size={14} color={colors.textLight} />
                    <Text style={styles.detailText}>Cantidad: {item.quantity || 0}</Text>
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
                <View style={styles.dateHeader}>
                    <Ionicons name="calendar" size={24} color={colors.primaryFuchsia} />
                    <View style={{alignItems: 'center'}}>
                        <Text style={styles.dateText}>Resumen de Ventas</Text>
                        <Text style={{fontSize: 12, color: colors.textLight}}>
                            Local ID: {localId}
                        </Text>
                        <Text style={{fontSize: 10, color: colors.textLight}}>
                            Ventas en sistema: {totalVentasSistema}
                        </Text>
                    </View>
                </View>

                <View style={styles.summaryGrid}>
                    <View style={[styles.summaryCard, { backgroundColor: colors.primaryPink }]}>
                        <Ionicons name="cash" size={32} color={colors.white} />
                        {/* CAMBIADO: usar formatNumber en lugar de toFixed(2) */}
                        <Text style={styles.summaryValue}>${formatNumber(summary.totalRevenue)}</Text>
                        <Text style={styles.summaryLabel}>Ingresos Totales</Text>
                    </View>

                    <View style={[styles.summaryCard, { backgroundColor: colors.primaryFuchsia }]}>
                        <Ionicons name="receipt" size={32} color={colors.white} />
                        {/* CAMBIADO: usar formatNumber para el conteo de ventas */}
                        <Text style={styles.summaryValue}>{formatNumber(summary.saleCount)}</Text>
                        <Text style={styles.summaryLabel}>Ventas Realizadas</Text>
                    </View>

                    <View style={[styles.summaryCard, { backgroundColor: colors.darkPink }]}>
                        <Ionicons name="trending-up" size={32} color={colors.white} />
                        {/* CAMBIADO: usar formatNumber en lugar de toFixed(2) */}
                        <Text style={styles.summaryValue}>${formatNumber(summary.averageSale)}</Text>
                        <Text style={styles.summaryLabel}>Promedio por Venta</Text>
                    </View>
                </View>

                <View style={styles.salesSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={globalStyles.subtitle}>Ventas del Local</Text>
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
                            <Text style={styles.emptyText}>No hay ventas para este local</Text>
                            <Text style={styles.emptySubtext}>
                                Hay {totalVentasSistema} ventas en el sistema
                            </Text>
                            <Text style={styles.emptySubtext}>
                                Pero ninguna con localId: {localId}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

export default DailySummaryScreen;