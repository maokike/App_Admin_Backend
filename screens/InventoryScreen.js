import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    ActivityIndicator, 
    ScrollView, 
    Alert, 
    TouchableOpacity
} from 'react-native';
import { db } from '../firebase-init';
import { collection, getDocs, orderBy, query, writeBatch, doc } from 'firebase/firestore';
import { globalStyles, colors } from '../styles/globalStyles';
import { inventoryStyles } from '../styles/InventoryScreenStyles';
import { Ionicons } from '@expo/vector-icons';

const InventoryScreen = ({ route, navigation }) => {
    const { localId } = route.params;
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [migrating, setMigrating] = useState(false);

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                setLoading(true);
                
                // Intentar obtener inventario del local
                const inventoryRef = collection(db, 'Locales', localId, 'inventario');
                const q = query(inventoryRef, orderBy('nombre'));
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    // Si existe inventario por local, usarlo
                    const inventoryList = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setInventory(inventoryList);
                } else {
                    // Si no existe inventario, mostrar opción para migrar
                    setInventory([]);
                }
            } catch (error) {
                console.error("Error al obtener el inventario: ", error);
                // En caso de error, también mostrar opción para migrar
                setInventory([]);
            } finally {
                setLoading(false);
            }
        };

        if (localId) {
            fetchInventory();
        }
    }, [localId]);

    const handleMigration = async () => {
        setMigrating(true);
        try {
            // Obtener productos globales
            const productsSnapshot = await getDocs(collection(db, 'products'));
            const products = productsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Crear batch para migración
            const batch = writeBatch(db);

            // Migrar productos al local actual
            for (const product of products) {
                const inventoryRef = doc(db, 'Locales', localId, 'inventario', product.id);
                
                batch.set(inventoryRef, {
                    nombre: product.name || product.nombre || 'Producto sin nombre',
                    precio: product.price || product.precio || 0,
                    cantidad: product.stock || product.cantidad || 0,
                    descripcion: product.description || product.descripcion || '',
                    activo: true,
                    migrado: true,
                    fechaMigracion: new Date(),
                    productoOriginalId: product.id
                });
            }

            // Ejecutar la migración
            await batch.commit();

            Alert.alert('Éxito', `Se migraron ${products.length} productos al inventario del local`);
            
            // Recargar inventario después de migración
            const inventoryRef = collection(db, 'Locales', localId, 'inventario');
            const q = query(inventoryRef, orderBy('nombre'));
            const querySnapshot = await getDocs(q);
            
            const inventoryList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setInventory(inventoryList);
            
        } catch (error) {
            console.error('Error en migración:', error);
            Alert.alert('Error', 'No se pudo completar la migración: ' + error.message);
        } finally {
            setMigrating(false);
        }
    };

    const getStockBadgeColor = (cantidad) => {
        if (cantidad > 10) return colors.success;
        if (cantidad > 0) return '#FFA000';
        return colors.error;
    };

    const getStockBadgeText = (cantidad) => {
        if (cantidad > 10) return 'Disponible';
        if (cantidad > 0) return 'Bajo Stock';
        return 'Agotado';
    };

    const renderItem = ({ item }) => (
        <View style={inventoryStyles.inventoryCard}>
            <View style={inventoryStyles.productHeader}>
                <Text style={inventoryStyles.productName}>{item.nombre}</Text>
                <Text style={inventoryStyles.productPrice}>${item.precio?.toFixed(2) || '0.00'}</Text>
            </View>
            {item.descripcion ? (
                <Text style={inventoryStyles.productDescription}>{item.descripcion}</Text>
            ) : null}
            <View style={inventoryStyles.productDetails}>
                <View style={inventoryStyles.stockInfo}>
                    <Ionicons name="cube-outline" size={16} color={colors.textLight} />
                    <Text style={inventoryStyles.stockText}>Stock: {item.cantidad || 0}</Text>
                </View>
                <View style={[inventoryStyles.stockBadge, 
                    { backgroundColor: getStockBadgeColor(item.cantidad) }]}>
                    <Text style={inventoryStyles.stockBadgeText}>
                        {getStockBadgeText(item.cantidad)}
                    </Text>
                </View>
            </View>
            {item.migrado && (
                <Text style={inventoryStyles.migratedText}>Migrado desde productos globales</Text>
            )}
        </View>
    );

    if (loading || migrating) {
        return (
            <View style={globalStyles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.primaryPink} />
                <Text style={inventoryStyles.loadingText}>
                    {migrating ? 'Migrando productos...' : 'Cargando inventario...'}
                </Text>
            </View>
        );
    }

    return (
        <View style={globalStyles.container}>
            <ScrollView>    
                <View style={inventoryStyles.header}>
                    <Text style={globalStyles.subtitle}>Inventario del Local</Text>
                    <Text style={inventoryStyles.productCount}>{inventory.length} productos</Text>
                </View>

                {inventory.length === 0 ? (
                    <View style={inventoryStyles.emptyState}>
                        <Ionicons name="cube-outline" size={48} color={colors.textLight} />
                        <Text style={inventoryStyles.emptyText}>No hay productos en el inventario</Text>
                        <Text style={inventoryStyles.emptySubtext}>
                            Los productos globales no se han migrado a este local
                        </Text>
                        <TouchableOpacity 
                            style={[globalStyles.primaryButton, inventoryStyles.migrationButton]}
                            onPress={handleMigration}
                            disabled={migrating}
                        >
                            <Text style={globalStyles.buttonText}>
                                {migrating ? 'Migrando...' : 'Migrar Productos Globales'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={inventory}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                    />
                )}
            </ScrollView>
        </View>
    );
};

export default InventoryScreen;