import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { db, auth } from '../firebase-init';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native';

const LocalDashboard = ({ navigation }) => {
    const [assignedLocales, setAssignedLocales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');

    // useCallback memoriza la función para que no se cree en cada render.
    // useFocusEffect ejecuta el callback cada vez que la pantalla entra en foco.
    useFocusEffect(
        useCallback(() => {
            const fetchAssignedLocales = async () => {
                setLoading(true);
                try {
                    const user = auth.currentUser;
                    if (user) {
                        const userDocRef = doc(db, 'Usuarios', user.uid);
                        const userDoc = await getDoc(userDocRef);

                        if (userDoc.exists()) {
                            setUserName(userDoc.data().nombre);
                            const assignedIds = userDoc.data().locales_asignados || [];

                            if (assignedIds.length > 0) {
                                // Obtenemos los datos de cada local asignado.
                                const localesPromises = assignedIds.map(id => getDoc(doc(db, 'Locales', id)));
                                const localesDocs = await Promise.all(localesPromises);

                                const localesList = localesDocs
                                    .filter(doc => doc.exists()) // Nos aseguramos de que el local exista
                                    .map(doc => ({
                                        id: doc.id,
                                        ...doc.data()
                                    }));

                                setAssignedLocales(localesList);
                            } else {
                                setAssignedLocales([]); // El usuario no tiene locales asignados
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error al obtener los locales asignados: ", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchAssignedLocales();
        }, [])
    );

    const handleLogout = () => {
        signOut(auth).catch(error => console.error('Error al cerrar sesión:', error));
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => navigation.navigate('LocalMenu', { localId: item.id, localName: item.nombre })}
        >
            <Text style={styles.itemText}>{item.nombre}</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" />
                <Text>Cargando tus locales...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Hola, {userName}</Text>
                <Button title="Cerrar Sesión" onPress={handleLogout} color="#e74c3c" />
            </View>

            <Text style={styles.subtitle}>Mis Locales Asignados</Text>

            <FlatList
                data={assignedLocales}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                ListEmptyComponent={<Text style={styles.emptyText}>No tienes locales asignados.</Text>}
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
        paddingTop: 40,
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
        elevation: 2,
        shadowColor: '#000',
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

export default LocalDashboard;
