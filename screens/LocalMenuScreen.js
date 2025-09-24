import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { globalStyles, colors } from '../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const LocalMenuScreen = ({ route, navigation }) => {
    const { localId, localName } = route.params;

    React.useLayoutEffect(() => {
        navigation.setOptions({ title: localName });
    }, [navigation, localName]);

    const menuOptions = [
        {
            title: 'Ver Inventario',
            icon: 'cube-outline',
            screen: 'Inventory',
            color: colors.primaryPink
        },
        {
            title: 'Registrar Venta',
            icon: 'add-circle-outline',
            screen: 'RegisterSale',
            color: colors.primaryFuchsia
        },
        {
            title: 'Ver Resumen del Día',
            icon: 'bar-chart-outline',
            screen: 'DailySummary',
            color: colors.darkPink
        }
    ];

    return (
        <View style={globalStyles.container}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.welcomeSection}>
                    <Ionicons name="storefront" size={48} color={colors.primaryFuchsia} />
                    <Text style={styles.welcomeTitle}>Gestión de Local</Text>
                    <Text style={styles.welcomeSubtitle}>{localName}</Text>
                </View>

                <View style={styles.menuGrid}>
                    {menuOptions.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.menuButton, { backgroundColor: option.color }]}
                            onPress={() => navigation.navigate(option.screen, { localId: localId })}
                        >
                            <Ionicons name={option.icon} size={32} color={colors.white} />
                            <Text style={styles.menuButtonText}>{option.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.infoCard}>
                    <Ionicons name="information-circle-outline" size={24} color={colors.primaryPink} />
                    <Text style={styles.infoText}>
                        Selecciona una opción para gestionar tu local
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = {
    container: {
        flexGrow: 1,
        padding: 20,
    },
    welcomeSection: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 20,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textDark,
        marginTop: 16,
        textAlign: 'center',
    },
    welcomeSubtitle: {
        fontSize: 18,
        color: colors.primaryPink,
        fontWeight: '600',
        marginTop: 8,
        textAlign: 'center',
    },
    menuGrid: {
        gap: 16,
        marginBottom: 30,
    },
    menuButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        elevation: 4,
        shadowColor: colors.darkGray,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        gap: 16,
    },
    menuButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.lightPink,
        padding: 16,
        borderRadius: 12,
        gap: 12,
        marginTop: 20,
    },
    infoText: {
        fontSize: 14,
        color: colors.textDark,
        flex: 1,
        fontStyle: 'italic',
    },
};

export default LocalMenuScreen;