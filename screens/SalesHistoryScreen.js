// SalesHistoryScreen.js - Pantalla nueva para historial completo
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
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { globalStyles, colors } from '../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const formatNumber = (number) => {
    if (number === 0) return '0';
    const integerNumber = Math.round(number);
    return integerNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const SalesHistoryScreen = ({ route, navigation }) => {
    const { localId } = route.params;
    const [allSales, setAllSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAllSales = useCallback(async () => {
        try {
            console.log('📊 Cargando historial completo...');
            
            const q = query(
                collection(db, 'sales'),
                where('localId', '==', localId),
                orderBy('date', 'desc')
            );

            const querySnapshot = await getDocs(q);
            console.log(`✅ ${querySnapshot.size} ventas en historial`);

            const salesData = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                salesData.push({
                    id: doc.id,
                    ...data
                });
            });

            // Agrupar por ventaId
            const groupedSalesMap = {};
            salesData.forEach(sale => {
                const ventaId = sale.ventaId || sale.id;
                
                if (!groupedSalesMap[ventaId]) {
                    groupedSalesMap[ventaId] = {
                        ventaId: ventaId,
                        date: sale.date,
                        tipo_pago: sale.tipo_pago,
                        productos: [],
                        totalVenta: 0
                    };
                }
                
                groupedSalesMap[ventaId].productos.push({
                    producto: sale.producto,
                    quantity: sale.quantity,
                    total: sale.total
                });
                
                groupedSalesMap[ventaId].totalVenta += sale.total || 0;
            });
            
            const groupedSalesArray = Object.values(groupedSalesMap);
            setAllSales(groupedSalesArray);

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
            fetchAllSales();
        }, [fetchAllSales])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchAllSales();
    };

    const formatDate = (timestamp) => {
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

    const renderItem = ({ item }) => (
        <View style={styles.saleCard}>
            <View style={styles.saleHeader}>
                <Text style={styles.productName}>Venta del {formatDate(item.date)}</Text>
                <Text style={styles.saleTotal}>${formatNumber(item.totalVenta)}</Text>
            </View>
            
            {item.productos.map((producto, index) => (
                <View key={index} style={styles.productRow}>
                    <Text style={styles.productText}>
                        {producto.quantity}x {producto.producto || 'Producto'} - ${formatNumber(producto.total)}
                    </Text>
                </View>
            ))}
            
            <View style={styles.saleDetails}>
                <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={14} color={colors.textLight} />
                    <Text style={styles.detailText}>{formatDate(item.date)}</Text>
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

    if (loading) {
        return (
            <View style={globalStyles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.primaryPink} />
                <Text style={styles.loadingText}>Cargando historial...</Text>
            </View>
        );
    }

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
                <View style={styles.header}>
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.primaryFuchsia} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Historial de Ventas</Text>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{allSales.length}</Text>
                        <Text style={styles.statLabel}>Total Ventas</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>
                            ${formatNumber(allSales.reduce((sum, venta) => sum + venta.totalVenta, 0))}
                        </Text>
                        <Text style={styles.statLabel}>Ingresos Totales</Text>
                    </View>
                </View>

                <View style={styles.salesSection}>
                    <Text style={globalStyles.subtitle}>Todas las Ventas</Text>
                    
                    {allSales.length > 0 ? (
                        <FlatList
                            data={allSales}
                            renderItem={renderItem}
                            keyExtractor={item => item.ventaId}
                            scrollEnabled={false}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={64} color={colors.textLight} />
                            <Text style={styles.emptyText}>No hay ventas en el historial</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = {
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
    },
    backButton: {
        marginRight: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primaryFuchsia,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
    },
    statCard: {
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        minWidth: 120,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primaryFuchsia,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textLight,
        marginTop: 5,
    },
    saleCard: {
        backgroundColor: colors.white,
        padding: 15,
        marginVertical: 5,
        marginHorizontal: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    saleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textDark,
        flex: 1,
    },
    saleTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primaryPink,
    },
    productRow: {
        paddingVertical: 3,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    productText: {
        fontSize: 14,
        color: colors.textLight,
    },
    saleDetails: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 2,
    },
    detailText: {
        fontSize: 12,
        color: colors.textLight,
        marginLeft: 5,
    },
    salesSection: {
        marginTop: 20,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        color: colors.textLight,
        marginTop: 10,
        textAlign: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: colors.textLight,
        fontSize: 16,
    },
};

export default SalesHistoryScreen;