import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { db, auth } from '../firebase-init';
import { collection, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const AdminDashboard = ({ navigation }) => {
    const [locales, setLocales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Esta función se ejecutará cuando el componente se cargue
        const fetchLocales = async () => {
            try {
                // Obtenemos todos los documentos de la colección "Locales"
                const querySnapshot = await getDocs(collection(db, 'Locales'));
                const localesList = querySnapshot.docs.map(doc => ({
                    id: doc.id, // El ID del documento
                    ...doc.data() // El resto de los datos (nombre, etc.)
                }));
                setLocales(localesList);
            } catch (error) {
                console.error("Error al obtener los locales: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLocales();
    }, []); // El array vacío asegura que esto se ejecute solo una vez

    const handleLogout = () => {
        signOut(auth).catch(error => console.error('Error al cerrar sesión:', error));
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => navigation.navigate('LocalDetail', { localId: item.id, localName: item.nombre })}
        >
            <Text style={styles.itemText}>{item.nombre}</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" />
                <Text>Cargando locales...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Panel de Administrador</Text>
                <Button title="Cerrar Sesión" onPress={handleLogout} color="#e74c3c" />
            </View>

            <Text style={styles.subtitle}>Lista de Locales</Text>

            <FlatList
                data={locales}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                ListEmptyComponent={<Text style={styles.emptyText}>No hay locales para mostrar. Añade locales en la consola de Firebase.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingTop: 40, // Para evitar el notch en iOS
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    itemContainer: {
        backgroundColor: 'white',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 10,
        borderRadius: 8,
        elevation: 2, // Sombra para Android
        shadowColor: '#000', // Sombra para iOS
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    itemText: {
        fontSize: 18,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: 'gray',
    }
});

export default AdminDashboard;
