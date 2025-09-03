import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { db } from '../firebase-init';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const SalesScreen = ({ localId }) => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSales = async () => {
            if (!localId) return;

            try {
                // Ruta a la subcolección de ventas
                const salesPath = `Locales/${localId}/ventas`;
                // Consulta para ordenar las ventas por fecha, de más reciente a más antigua
                const q = query(collection(db, salesPath), orderBy('fecha', 'desc'));

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

        fetchSales();
    }, [localId]);

    // Función para formatear el objeto Timestamp de Firebase a un formato legible
    const formatTimestamp = (timestamp) => {
        if (!timestamp || !timestamp.toDate) {
            return 'Fecha no disponible';
        }
        const date = timestamp.toDate();
        // Formato: DD/MM/AAAA, HH:MM
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.itemDate}>{formatTimestamp(item.fecha)}</Text>
            <View style={styles.itemDetails}>
                <Text style={styles.itemText}>Producto: {item.producto}</Text>
                <Text style={styles.itemTotal}>Total: ${Number(item.total).toFixed(2)}</Text>
            </View>
            <Text style={styles.itemText}>Tipo de Pago: {item.tipo_pago}</Text>
        </View>
    );

    return (
        <FlatList
            data={sales}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Este local no tiene ventas registradas.</Text>
                </View>
            }
        />
    );
};

const styles = StyleSheet.create({
    listContainer: {
        padding: 10,
    },
    itemContainer: {
        backgroundColor: 'white',
        padding: 15,
        marginVertical: 8,
        borderRadius: 8,
        elevation: 1,
    },
    itemDate: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    itemDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    itemText: {
        fontSize: 16,
    },
    itemTotal: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: 'gray',
    },
});

export default SalesScreen;
