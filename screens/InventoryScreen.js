import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    ActivityIndicator, 
    ScrollView, 
    Alert, 
    TouchableOpacity,
    Modal,
    TextInput
} from 'react-native';
import { db, auth } from '../firebase-init';
import { 
    collection, 
    getDocs, 
    orderBy, 
    query, 
    writeBatch, 
    doc, 
    updateDoc,
    deleteDoc,
    onSnapshot 
} from 'firebase/firestore';
import { globalStyles, colors } from '../styles/globalStyles';
import { inventoryStyles } from '../styles/InventoryScreenStyles';
import { Ionicons } from '@expo/vector-icons';

const InventoryScreen = ({ route, navigation }) => {
    const { localId } = route.params;
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [migrating, setMigrating] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState({
        nombre: '',
        precio: '',
        cantidad: '',
        descripcion: ''
    });
    const [userRole, setUserRole] = useState(null);
    const [userLoading, setUserLoading] = useState(true);

    const isAdmin = userRole === 'admin';

    // Obtener el rol del usuario actual
    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const userDoc = await getDocs(collection(db, 'Usuarios'));
                    const userData = userDoc.docs.find(doc => doc.id === user.uid);
                    if (userData) {
                        setUserRole(userData.data().rol);
                    }
                }
            } catch (error) {
                console.error("Error al obtener el rol del usuario:", error);
            } finally {
                setUserLoading(false);
            }
        };

        fetchUserRole();
    }, []);

    // Escuchar cambios en tiempo real del inventario
    useEffect(() => {
        if (!localId) return;

        const inventoryRef = collection(db, 'Locales', localId, 'inventario');
        const q = query(inventoryRef, orderBy('nombre'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const inventoryList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setInventory(inventoryList);
            } else {
                setInventory([]);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error en tiempo real:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [localId]);

    const handleMigration = async () => {
        setMigrating(true);
        try {
            const productsSnapshot = await getDocs(collection(db, 'products'));
            const products = productsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const batch = writeBatch(db);

            for (const product of products) {
                const inventoryRef = doc(db, 'Locales', localId, 'inventario', product.id);
                
                batch.set(inventoryRef, {
                    nombre: product.name || product.nombre || 'Producto sin nombre',
                    precio: Number(product.price) || Number(product.precio) || 0,
                    cantidad: Number(product.stock) || Number(product.cantidad) || 0,
                    descripcion: product.description || product.descripcion || '',
                    activo: true,
                    migrado: true,
                    fechaMigracion: new Date(),
                    productoOriginalId: product.id
                });
            }

            await batch.commit();
            Alert.alert('Éxito', `Se migraron ${products.length} productos al inventario del local`);
            
        } catch (error) {
            console.error('Error en migración:', error);
            Alert.alert('Error', 'No se pudo completar la migración: ' + error.message);
        } finally {
            setMigrating(false);
        }
    };

    // Funciones de edición - solo para admin
    const handleEditProduct = (product) => {
        if (!isAdmin) return;
        
        setSelectedProduct(product);
        setEditingProduct({
            nombre: product.nombre || '',
            precio: product.precio?.toString() || '',
            cantidad: product.cantidad?.toString() || '',
            descripcion: product.descripcion || ''
        });
        setEditModalVisible(true);
    };

    const handleUpdateProduct = async () => {
        if (!selectedProduct || !isAdmin) return;

        try {
            const productRef = doc(db, 'Locales', localId, 'inventario', selectedProduct.id);
            await updateDoc(productRef, {
                nombre: editingProduct.nombre,
                precio: Number(editingProduct.precio) || 0,
                cantidad: Number(editingProduct.cantidad) || 0,
                descripcion: editingProduct.descripcion,
                fechaActualizacion: new Date()
            });

            Alert.alert('Éxito', 'Producto actualizado correctamente');
            setEditModalVisible(false);
            setSelectedProduct(null);
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            Alert.alert('Error', 'No se pudo actualizar el producto');
        }
    };

    const handleDeleteProduct = async () => {
        if (!selectedProduct || !isAdmin) return;

        Alert.alert(
            'Eliminar Producto',
            `¿Estás seguro de que quieres eliminar "${selectedProduct.nombre}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Eliminar', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const productRef = doc(db, 'Locales', localId, 'inventario', selectedProduct.id);
                            await deleteDoc(productRef);
                            Alert.alert('Éxito', 'Producto eliminado correctamente');
                            setEditModalVisible(false);
                            setSelectedProduct(null);
                        } catch (error) {
                            console.error('Error al eliminar producto:', error);
                            Alert.alert('Error', 'No se pudo eliminar el producto');
                        }
                    }
                }
            ]
        );
    };

    // Funciones auxiliares
    const formatPrice = (price) => {
        const priceNumber = Number(price);
        return `$${isNaN(priceNumber) ? '0.00' : priceNumber.toFixed(2)}`;
    };

    const getStockLevel = (cantidad) => {
        const stock = Number(cantidad) || 0;
        const maxStock = 200;
        return (stock / maxStock) * 100;
    };

    const getStockBadgeColor = (cantidad) => {
        const stock = Number(cantidad) || 0;
        if (stock > 10) return colors.success;
        if (stock > 0) return '#FFA000';
        return colors.error;
    };

    const getStockBadgeText = (cantidad) => {
        const stock = Number(cantidad) || 0;
        if (stock > 10) return 'Disponible';
        if (stock > 0) return 'Bajo Stock';
        return 'Agotado';
    };

    // Render item con control de roles
    const renderItem = ({ item }) => (
        <View style={inventoryStyles.inventoryCard}>
            <View style={inventoryStyles.productHeader}>
                <Text style={inventoryStyles.productName}>{item.nombre}</Text>
                <Text style={inventoryStyles.productPrice}>{formatPrice(item.precio)}</Text>
            </View>
            
            {item.descripcion ? (
                <Text style={inventoryStyles.productDescription}>{item.descripcion}</Text>
            ) : null}

            {/* Barra de progreso */}
            <View style={inventoryStyles.progressContainer}>
                <View style={inventoryStyles.progressBackground}>
                    <View 
                        style={[
                            inventoryStyles.progressFill,
                            { width: `${Math.min(getStockLevel(item.cantidad), 100)}%` }
                        ]} 
                    />
                </View>
                <Text style={inventoryStyles.progressText}>
                    {Math.round(getStockLevel(item.cantidad))}%
                </Text>
            </View>

            <View style={inventoryStyles.productDetails}>
                <View style={inventoryStyles.stockInfo}>
                    <Ionicons name="cube-outline" size={16} color={colors.textLight} />
                    <Text style={inventoryStyles.stockText}>Stock: {Number(item.cantidad) || 0}</Text>
                </View>
                
                <View style={inventoryStyles.actionsContainer}>
                    <View style={[inventoryStyles.stockBadge, 
                        { backgroundColor: getStockBadgeColor(item.cantidad) }]}>
                        <Text style={inventoryStyles.stockBadgeText}>
                            {getStockBadgeText(item.cantidad)}
                        </Text>
                    </View>
                    
                    {/* Solo mostrar botón de edición para admin */}
                    {isAdmin && (
                        <TouchableOpacity 
                            style={inventoryStyles.editButton}
                            onPress={() => handleEditProduct(item)}
                        >
                            <Ionicons name="pencil" size={18} color={colors.primaryPink} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {item.migrado && (
                <Text style={inventoryStyles.migratedText}>Migrado desde productos globales</Text>
            )}
        </View>
    );

    // Modal de edición - solo para admin
    const renderEditModal = () => (
        isAdmin && (
            <Modal
                visible={editModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={inventoryStyles.modalOverlay}>
                    <View style={inventoryStyles.modalContent}>
                        <Text style={inventoryStyles.modalTitle}>Editar Producto</Text>
                        
                        <TextInput
                            style={inventoryStyles.input}
                            placeholder="Nombre del producto"
                            value={editingProduct.nombre}
                            onChangeText={(text) => setEditingProduct({...editingProduct, nombre: text})}
                        />
                        
                        <TextInput
                            style={inventoryStyles.input}
                            placeholder="Precio"
                            value={editingProduct.precio}
                            onChangeText={(text) => setEditingProduct({...editingProduct, precio: text})}
                            keyboardType="numeric"
                        />
                        
                        <TextInput
                            style={inventoryStyles.input}
                            placeholder="Cantidad en stock"
                            value={editingProduct.cantidad}
                            onChangeText={(text) => setEditingProduct({...editingProduct, cantidad: text})}
                            keyboardType="numeric"
                        />
                        
                        <TextInput
                            style={[inventoryStyles.input, inventoryStyles.textArea]}
                            placeholder="Descripción"
                            value={editingProduct.descripcion}
                            onChangeText={(text) => setEditingProduct({...editingProduct, descripcion: text})}
                            multiline
                            numberOfLines={3}
                        />

                        <View style={inventoryStyles.modalButtons}>
                            <TouchableOpacity 
                                style={[inventoryStyles.modalButton, inventoryStyles.deleteButton]}
                                onPress={handleDeleteProduct}
                            >
                                <Text style={inventoryStyles.deleteButtonText}>Eliminar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[inventoryStyles.modalButton, inventoryStyles.cancelButton]}
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text style={inventoryStyles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[inventoryStyles.modalButton, inventoryStyles.saveButton]}
                                onPress={handleUpdateProduct}
                            >
                                <Text style={inventoryStyles.saveButtonText}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    );

    if (userLoading || loading || migrating) {
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
                    <View style={inventoryStyles.headerInfo}>
                        <Text style={inventoryStyles.productCount}>{inventory.length} productos</Text>
                        {isAdmin && (
                            <Text style={inventoryStyles.adminBadge}>Modo Administrador</Text>
                        )}
                    </View>
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
            
            {renderEditModal()}
        </View>
    );
};

export default InventoryScreen;