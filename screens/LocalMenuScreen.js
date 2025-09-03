import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const LocalMenuScreen = ({ route, navigation }) => {
    // Recibimos los parámetros del local seleccionado
    const { localId, localName } = route.params;

    // Actualizamos el título del header de la pantalla dinámicamente
    React.useLayoutEffect(() => {
        navigation.setOptions({ title: localName });
    }, [navigation, localName]);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.menuButton}
                // Navegamos a la pantalla de Inventario, que ya existe y es reutilizable
                onPress={() => navigation.navigate('Inventory', { localId: localId })}
            >
                <Text style={styles.menuButtonText}>Ver Inventario</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.menuButton}
                // Navegamos a la pantalla para registrar una venta (la crearé a continuación)
                onPress={() => navigation.navigate('RegisterSale', { localId: localId })}
            >
                <Text style={styles.menuButtonText}>Registrar Venta</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.menuButton}
                // Navegamos al resumen diario (también por crear)
                onPress={() => navigation.navigate('DailySummary', { localId: localId })}
            >
                <Text style={styles.menuButtonText}>Ver Resumen del Día</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingTop: 20,
        paddingHorizontal: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    menuButton: {
        backgroundColor: '#3498db',
        padding: 20,
        borderRadius: 10,
        marginBottom: 15,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    menuButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    }
});

export default LocalMenuScreen;
