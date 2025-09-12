import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { db } from '../firebase-init';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const InventoryScreen = ({ localId }) => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInventory = async () => {
            if (!localId) return; // No hacer nada si no tenemos un localId

            try {
                // Creamos la ruta a la subcolección de inventario
                const inventoryPath = `Locales/${localId}/inventario`;
                // Creamos una consulta para ordenar los productos por nombre
                const q = query(collection(db, inventoryPath), orderBy('nombre'));

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

        fetchInventory();
    }, [localId]); // Se vuelve a ejecutar si el localId cambia

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.itemName}>{item.nombre}</Text>
            <View style={styles.itemDetails}>
                <Text style={styles.itemText}>Cantidad: {item.cantidad}</Text>
                {/* Formateamos el precio para que se vea como moneda */}
                <Text style={styles.itemText}>Precio: ${Number(item.precio).toFixed(2)}</Text>
            </View>
        </View>
    );

    return (
        <FlatList
            data={inventory}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Este local no tiene inventario registrado.</Text>
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
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    itemDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    itemText: {
        fontSize: 16,
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

export default InventoryScreen;
