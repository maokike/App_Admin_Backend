import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { db } from '../firebase-init';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

const DailySummaryScreen = ({ route }) => {
    const { localId } = route.params;
    const [sales, setSales] = useState([]);
    const [summary, setSummary] = useState({ totalRevenue: 0, saleCount: 0 });
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
            setSummary({ totalRevenue, saleCount: salesList.length });

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

    if (loading) {
        return <ActivityIndicator style={{ flex: 1 }} size="large" />;
    }

    const renderItem = ({ item }) => (
        <View style={styles.saleItem}>
            <Text style={styles.saleProduct}>{item.producto} (x{item.cantidad})</Text>
            <View style={styles.saleDetails}>
                <Text>{formatTimestamp(item.fecha)}</Text>
                <Text style={styles.saleTotal}>${item.total.toFixed(2)}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Resumen del Día</Text>
                <View style={styles.summaryBox}>
                    <View style={styles.summaryMetric}>
                        <Text style={styles.summaryValue}>${summary.totalRevenue.toFixed(2)}</Text>
                        <Text style={styles.summaryLabel}>Ingresos Totales</Text>
                    </View>
                    <View style={styles.summaryMetric}>
                        <Text style={styles.summaryValue}>{summary.saleCount}</Text>
                        <Text style={styles.summaryLabel}>Nº de Ventas</Text>
                    </View>
                </View>
            </View>
            <Text style={styles.listTitle}>Ventas de Hoy</Text>
            <FlatList
                data={sales}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                ListEmptyComponent={<Text style={styles.emptyText}>No se han registrado ventas hoy.</Text>}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    summaryContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    summaryTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    summaryBox: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryMetric: {
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3498db',
    },
    summaryLabel: {
        fontSize: 14,
        color: 'gray',
        marginTop: 5,
    },
    listTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        padding: 15,
        paddingBottom: 5,
    },
    saleItem: {
        backgroundColor: 'white',
        padding: 15,
        marginHorizontal: 15,
        marginVertical: 5,
        borderRadius: 8,
        elevation: 1,
    },
    saleProduct: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    saleDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    saleTotal: {
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 30,
        fontSize: 16,
        color: 'gray',
    },
});

export default DailySummaryScreen;
