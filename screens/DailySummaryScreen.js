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
    const integerNumber = Math.round(number);
    return integerNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, (match, offset, string) => {
        const positionFromEnd = string.length - offset - 3;
        return positionFromEnd >= 6 ? "'" : ".";
    });
};

const DailySummaryScreen = ({ route, navigation }) => {
    const { localId } = route.params;
    const [todaySales, setTodaySales] = useState([]);
    const [summary, setSummary] = useState({ totalRevenue: 0, saleCount: 0, averageSale: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [totalVentasSistema, setTotalVentasSistema] = useState(0);

    const fetchTodaySales = useCallback(async () => {
        try {
            console.log('📅 Cargando TODAS las ventas y filtrando por día...');
            
            const q = query(collection(db, 'sales'), orderBy('date', 'desc'));
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

            // Filtrar por localId y fecha de HOY
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

            const todaySalesData = allSales.filter(sale => {
                if (sale.localId !== localId) return false;
                if (sale.date && sale.date.toDate) {
                    const saleDate = sale.date.toDate();
                    return saleDate >= startOfDay && saleDate < endOfDay;
                }
                return false;
            });

            console.log(`📍 Ventas del local ${localId} hoy: ${todaySalesData.length}`);
            
            // MEJORAR LA AGRUPACIÓN: Agrupar por ventaId O por fecha+hora
            const groupedSalesMap = {};
            
            todaySalesData.forEach(sale => {
                let groupKey;
                
                // Si tiene ventaId, usar ese
                if (sale.ventaId && sale.ventaId.startsWith('VENTA_')) {
                    groupKey = sale.ventaId;
                } else {
                    // Si no tiene ventaId, crear uno basado en fecha+hora
                    if (sale.date && sale.date.toDate) {
                        const saleDate = sale.date.toDate();
                        // Agrupar por minuto (misma fecha+hora+minuto)
                        const dateKey = `${saleDate.getFullYear()}-${saleDate.getMonth()}-${saleDate.getDate()}-${saleDate.getHours()}-${saleDate.getMinutes()}`;
                        groupKey = `AUTO_${localId}_${dateKey}`;
                    } else {
                        // Fallback: usar id individual
                        groupKey = sale.id;
                    }
                }
                
                if (!groupedSalesMap[groupKey]) {
                    groupedSalesMap[groupKey] = {
                        ventaId: groupKey,
                        date: sale.date,
                        localId: sale.localId,
                        tipo_pago: sale.tipo_pago,
                        productos: [],
                        totalVenta: 0,
                        esAgrupado: groupKey.startsWith('VENTA_') || groupKey.startsWith('AUTO_')
                    };
                }
                
                groupedSalesMap[groupKey].productos.push({
                    producto: sale.producto,
                    quantity: sale.quantity,
                    total: sale.total,
                    id: sale.id
                });
                
                groupedSalesMap[groupKey].totalVenta += sale.total || 0;
            });
            
            const groupedSalesArray = Object.values(groupedSalesMap);
            
            console.log(`📦 Ventas agrupadas hoy: ${groupedSalesArray.length}`);
            
            // DEBUG DETALLADO: Mostrar cada venta y sus productos
            console.log('🔍 DETALLE DE VENTAS AGRUPADAS:');
            groupedSalesArray.forEach((venta, index) => {
                console.log(`\n🛒 Venta ${index + 1} (${venta.ventaId}):`);
                console.log(`   📅 Fecha: ${venta.date?.toDate?.()?.toLocaleString()}`);
                console.log(`   📦 Productos: ${venta.productos.length}`);
                console.log(`   💰 Total: $${venta.totalVenta}`);
                venta.productos.forEach((prod, prodIndex) => {
                    console.log(`      ${prodIndex + 1}. ${prod.quantity}x ${prod.producto} - $${prod.total}`);
                });
            });

            setTodaySales(groupedSalesArray);

            // Calcular resumen
            const totalRevenue = groupedSalesArray.reduce((sum, venta) => sum + venta.totalVenta, 0);
            const saleCount = groupedSalesArray.length;
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
            fetchTodaySales();
        }, [fetchTodaySales])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchTodaySales();
    };

    const formatTimestamp = (timestamp) => {
        try {
            if (!timestamp) return 'Fecha no disponible';
            
            if (timestamp.toDate) {
                const date = timestamp.toDate();
                return date.toLocaleString('es-ES', { 
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
                <Text style={styles.loadingText}>Cargando ventas del día...</Text>
            </View>
        );
    }

    const renderItem = ({ item }) => (
        <View style={styles.saleCard}>
            <View style={styles.saleHeader}>
                <Text style={styles.productName}>
                    Venta {formatTimestamp(item.date)}
                    {item.esAgrupado && item.productos.length > 1 && ' (Agrupada)'}
                </Text>
                <Text style={styles.saleTotal}>${formatNumber(item.totalVenta)}</Text>
            </View>
            
            {item.productos.map((producto, index) => (
                <View key={producto.id || index} style={styles.productRow}>
                    <Text style={styles.productText}>
                        {producto.quantity}x {producto.producto || 'Producto'} - ${formatNumber(producto.total)}
                    </Text>
                </View>
            ))}
            
            <View style={styles.saleDetails}>
                <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={14} color={colors.textLight} />
                    <Text style={styles.detailText}>{formatTimestamp(item.date)}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="cube-outline" size={14} color={colors.textLight} />
                    <Text style={styles.detailText}>{item.productos.length} productos</Text>
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
                        <Text style={styles.dateText}>Resumen del Día</Text>
                        <Text style={{fontSize: 12, color: colors.textLight}}>
                            {new Date().toLocaleDateString('es-ES')}
                        </Text>
                        <Text style={{fontSize: 10, color: colors.textLight}}>
                            Local ID: {localId}
                        </Text>
                    </View>
                </View>

                <View style={styles.summaryGrid}>
                    <View style={[styles.summaryCard, { backgroundColor: colors.primaryPink }]}>
                        <Ionicons name="cash" size={32} color={colors.white} />
                        <Text style={styles.summaryValue}>${formatNumber(summary.totalRevenue)}</Text>
                        <Text style={styles.summaryLabel}>Ingresos Hoy</Text>
                    </View>

                    <View style={[styles.summaryCard, { backgroundColor: colors.primaryFuchsia }]}>
                        <Ionicons name="receipt" size={32} color={colors.white} />
                        <Text style={styles.summaryValue}>{formatNumber(summary.saleCount)}</Text>
                        <Text style={styles.summaryLabel}>Ventas Hoy</Text>
                    </View>

                    <View style={[styles.summaryCard, { backgroundColor: colors.darkPink }]}>
                        <Ionicons name="trending-up" size={32} color={colors.white} />
                        <Text style={styles.summaryValue}>${formatNumber(summary.averageSale)}</Text>
                        <Text style={styles.summaryLabel}>Promedio/Venta</Text>
                    </View>
                </View>

                <View style={styles.salesSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={globalStyles.subtitle}>Ventas de Hoy</Text>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('SalesHistory', { localId })}
                            style={styles.historyButton}
                        >
                            <Text style={styles.historyButtonText}>Ver Historial</Text>
                            <Ionicons name="time-outline" size={16} color={colors.primaryPink} />
                        </TouchableOpacity>
                    </View>

                    {todaySales.length > 0 ? (
                        <FlatList
                            data={todaySales}
                            renderItem={renderItem}
                            keyExtractor={item => item.ventaId}
                            scrollEnabled={false}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="calendar-outline" size={64} color={colors.textLight} />
                            <Text style={styles.emptyText}>No hay ventas hoy</Text>
                            <Text style={styles.emptySubtext}>
                                Las ventas de hoy aparecerán aquí
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

export default DailySummaryScreen;