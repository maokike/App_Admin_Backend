import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Alert, Image, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { auth, storage } from '../firebase-init';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { globalStyles, colors } from '../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { getProducts, registerSale } from '../services/firestoreService';

const RegisterSaleScreen = ({ route, navigation }) => {
    const { localId } = route.params;

    const [products, setProducts] = useState([]);
    const [saleItems, setSaleItems] = useState([]); // Array de productos en la venta
    const [currentProduct, setCurrentProduct] = useState(null);
    const [currentQuantity, setCurrentQuantity] = useState('1');
    const [paymentMethod, setPaymentMethod] = useState('efectivo');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [productsLoading, setProductsLoading] = useState(true);

    // Función para formatear números con separador de miles y sin decimales
    const formatNumber = (number) => {
        return Number(number).toLocaleString('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    // Función para calcular el total de la venta
    const calculateTotal = () => {
        return saleItems.reduce((total, item) => {
            const price = item.product.price || item.product.precio || 0;
            return total + (price * item.quantity);
        }, 0);
    };

    const total = calculateTotal();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productsList = await getProducts();
                setProducts(productsList);
                if (productsList.length > 0) {
                    setCurrentProduct(productsList[0].id);
                }
            } catch (error) {
                console.error("Error fetching products: ", error);
                Alert.alert("Error", "No se pudo cargar los productos.");
            } finally {
                setProductsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const addProductToSale = () => {
        if (!currentProduct) {
            Alert.alert("Error", "Por favor, selecciona un producto.");
            return;
        }

        const quantity = parseInt(currentQuantity, 10);
        if (!quantity || quantity <= 0) {
            Alert.alert("Error", "La cantidad debe ser mayor a cero.");
            return;
        }

        const product = products.find(p => p.id === currentProduct);
        const availableStock = product.stock || product.cantidad || 0;

        // Verificar stock disponible (considerando productos ya agregados)
        const alreadyAddedItem = saleItems.find(item => item.product.id === currentProduct);
        const totalQuantityForProduct = alreadyAddedItem ? 
            alreadyAddedItem.quantity + quantity : quantity;

        if (totalQuantityForProduct > availableStock) {
            Alert.alert("Error", `No hay suficiente stock. Disponible: ${availableStock}.`);
            return;
        }

        if (alreadyAddedItem) {
            // Actualizar cantidad si el producto ya está en la venta
            setSaleItems(prevItems => 
                prevItems.map(item => 
                    item.product.id === currentProduct 
                        ? { ...item, quantity: totalQuantityForProduct }
                        : item
                )
            );
        } else {
            // Agregar nuevo producto a la venta
            setSaleItems(prevItems => [
                ...prevItems,
                {
                    id: Date.now().toString(), // ID temporal
                    product: product,
                    quantity: quantity
                }
            ]);
        }

        // Resetear campos para nuevo producto
        setCurrentQuantity('1');
    };

    const removeProductFromSale = (itemId) => {
        setSaleItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };

    const updateProductQuantity = (itemId, newQuantity) => {
        if (newQuantity <= 0) {
            removeProductFromSale(itemId);
            return;
        }

        setSaleItems(prevItems => 
            prevItems.map(item => 
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Se necesita acceso a la galería para subir comprobantes.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = ref(storage, `comprobantes/${localId}/${new Date().toISOString()}`);
        await uploadBytes(storageRef, blob);
        return await getDownloadURL(storageRef);
    };

    const handleRegisterSale = async () => {
        if (saleItems.length === 0) {
            Alert.alert("Error", "Por favor, agrega al menos un producto a la venta.");
            return;
        }

        if (paymentMethod === 'transferencia' && !image) {
            Alert.alert("Error", "Por favor, sube el comprobante de la transferencia.");
            return;
        }

        setLoading(true);

        try {
            let imageUrl = '';
            if (paymentMethod === 'transferencia' && image) {
                imageUrl = await uploadImage(image);
            }

            // Registrar cada producto como una venta separada (o puedes modificar para una sola venta con múltiples productos)
            for (const item of saleItems) {
                const saleData = {
                    localId: localId,
                    productId: item.product.id,
                    quantity: item.quantity,
                    total: (item.product.price || item.product.precio || 0) * item.quantity,
                    paymentMethod: paymentMethod === 'efectivo' ? 'cash' : 'card',
                    date: new Date(),
                    producto: item.product.name || item.product.nombre,
                    tipo_pago: paymentMethod,
                    imagen_transferencia_url: imageUrl
                };

                await registerSale(saleData);
            }

            Alert.alert("Éxito", `Venta registrada correctamente con ${saleItems.length} producto(s).`);
            navigation.goBack();

        } catch (error) {
            console.error("Error al registrar la venta: ", error);
            Alert.alert("Error", `No se pudo registrar la venta. ${error.toString()}`);
        } finally {
            setLoading(false);
        }
    };

    if (productsLoading) {
        return (
            <View style={globalStyles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.primaryPink} />
                <Text style={styles.loadingText}>Cargando productos...</Text>
            </View>
        );
    }

    const selectedProductData = products.find(p => p.id === currentProduct);

    return (
        <KeyboardAvoidingView 
            style={globalStyles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.sectionTitle}>Registrar Nueva Venta</Text>

                {/* Sección para agregar productos */}
                <View style={styles.formSection}>
                    <Text style={globalStyles.subtitle}>Agregar Productos</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Producto:</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={currentProduct}
                                onValueChange={setCurrentProduct}
                                style={styles.picker}
                            >
                                {products.map(p => (
                                    <Picker.Item 
                                        key={p.id} 
                                        label={`${p.name || p.nombre} (Stock: ${p.stock || p.cantidad || 0})`} 
                                        value={p.id} 
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.quantityRow}>
                        <View style={styles.quantityInputContainer}>
                            <Text style={styles.label}>Cantidad:</Text>
                            <TextInput
                                style={styles.quantityInput}
                                value={currentQuantity}
                                onChangeText={setCurrentQuantity}
                                keyboardType="numeric"
                                placeholder="1"
                            />
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.addButton}
                            onPress={addProductToSale}
                        >
                            <Ionicons name="add" size={20} color={colors.white} />
                            <Text style={styles.addButtonText}>Agregar</Text>
                        </TouchableOpacity>
                    </View>

                    {selectedProductData && (
                        <View style={styles.productInfo}>
                            <Text style={styles.productInfoText}>
                                Precio unitario: ${formatNumber(selectedProductData.price || selectedProductData.precio || 0)}
                            </Text>
                            <Text style={styles.productInfoText}>
                                Stock disponible: {formatNumber(selectedProductData.stock || selectedProductData.cantidad || 0)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Lista de productos agregados */}
                {saleItems.length > 0 && (
                    <View style={styles.formSection}>
                        <Text style={globalStyles.subtitle}>Productos en la Venta</Text>
                        
                        <FlatList
                            data={saleItems}
                            scrollEnabled={false}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <View style={styles.saleItem}>
                                    <View style={styles.saleItemInfo}>
                                        <Text style={styles.productName}>
                                            {item.product.name || item.product.nombre}
                                        </Text>
                                        <Text style={styles.productPrice}>
                                            ${formatNumber(item.product.price || item.product.precio || 0)} c/u
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.quantityControls}>
                                        <TouchableOpacity 
                                            style={styles.quantityButton}
                                            onPress={() => updateProductQuantity(item.id, item.quantity - 1)}
                                        >
                                            <Ionicons name="remove" size={16} color={colors.white} />
                                        </TouchableOpacity>
                                        
                                        <Text style={styles.quantityText}>
                                            {item.quantity}
                                        </Text>
                                        
                                        <TouchableOpacity 
                                            style={styles.quantityButton}
                                            onPress={() => updateProductQuantity(item.id, item.quantity + 1)}
                                        >
                                            <Ionicons name="add" size={16} color={colors.white} />
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity 
                                            style={styles.deleteButton}
                                            onPress={() => removeProductFromSale(item.id)}
                                        >
                                            <Ionicons name="trash" size={16} color={colors.white} />
                                        </TouchableOpacity>
                                    </View>
                                    
                                    <Text style={styles.itemTotal}>
                                        ${formatNumber((item.product.price || item.product.precio || 0) * item.quantity)}
                                    </Text>
                                </View>
                            )}
                        />
                    </View>
                )}

                {/* Método de pago */}
                <View style={styles.formSection}>
                    <Text style={globalStyles.subtitle}>Método de Pago</Text>
                    
                    <View style={styles.paymentButtons}>
                        <TouchableOpacity
                            style={[
                                styles.paymentButton,
                                paymentMethod === 'efectivo' && styles.paymentButtonActive
                            ]}
                            onPress={() => setPaymentMethod('efectivo')}
                        >
                            <Ionicons 
                                name="cash" 
                                size={24} 
                                color={paymentMethod === 'efectivo' ? colors.white : colors.primaryPink} 
                            />
                            <Text style={[
                                styles.paymentButtonText,
                                paymentMethod === 'efectivo' && styles.paymentButtonTextActive
                            ]}>
                                Efectivo
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.paymentButton,
                                paymentMethod === 'transferencia' && styles.paymentButtonActive
                            ]}
                            onPress={() => setPaymentMethod('transferencia')}
                        >
                            <Ionicons 
                                name="card" 
                                size={24} 
                                color={paymentMethod === 'transferencia' ? colors.white : colors.primaryPink} 
                            />
                            <Text style={[
                                styles.paymentButtonText,
                                paymentMethod === 'transferencia' && styles.paymentButtonTextActive
                            ]}>
                                Transferencia
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {paymentMethod === 'transferencia' && (
                        <View style={styles.imageSection}>
                            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                                <Ionicons name="camera" size={24} color={colors.white} />
                                <Text style={styles.imageButtonText}>
                                    {image ? 'Cambiar Comprobante' : 'Seleccionar Comprobante'}
                                </Text>
                            </TouchableOpacity>
                            {image && (
                                <Image source={{ uri: image }} style={styles.imagePreview} />
                            )}
                        </View>
                    )}
                </View>

                {/* Total */}
                <View style={styles.totalSection}>
                    <Text style={styles.totalLabel}>Total a Pagar:</Text>
                    <Text style={styles.totalAmount}>${formatNumber(total)}</Text>
                    <Text style={styles.itemsCount}>{saleItems.length} producto(s) en la venta</Text>
                </View>

                {/* Botón registrar */}
                <TouchableOpacity
                    style={[globalStyles.buttonPrimary, loading && styles.buttonDisabled]}
                    onPress={handleRegisterSale}
                    disabled={loading || saleItems.length === 0}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                            <Text style={globalStyles.buttonText}>
                                Registrar Venta ({saleItems.length} productos)
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = {
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primaryFuchsia,
        textAlign: 'center',
        marginBottom: 30,
    },
    formSection: {
        backgroundColor: colors.white,
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: colors.darkGray,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textDark,
        marginBottom: 8,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: colors.mediumGray,
        borderRadius: 8,
        overflow: 'hidden',
    },
    picker: {
        backgroundColor: colors.white,
    },
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
    },
    quantityInputContainer: {
        flex: 1,
    },
    quantityInput: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.mediumGray,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primaryPink,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    addButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
    productInfo: {
        backgroundColor: colors.lightPink,
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    productInfoText: {
        fontSize: 14,
        color: colors.textDark,
        marginBottom: 4,
    },
    saleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: colors.lightGray,
        borderRadius: 8,
        marginBottom: 8,
    },
    saleItemInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textDark,
    },
    productPrice: {
        fontSize: 12,
        color: colors.textLight,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginHorizontal: 12,
    },
    quantityButton: {
        backgroundColor: colors.primaryPink,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: colors.error,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    quantityText: {
        fontSize: 14,
        fontWeight: '600',
        minWidth: 20,
        textAlign: 'center',
    },
    itemTotal: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primaryFuchsia,
    },
    paymentButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    paymentButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.primaryPink,
        gap: 8,
    },
    paymentButtonActive: {
        backgroundColor: colors.primaryPink,
    },
    paymentButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primaryPink,
    },
    paymentButtonTextActive: {
        color: colors.white,
    },
    imageSection: {
        marginTop: 16,
    },
    imageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primaryPink,
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    imageButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginTop: 12,
    },
    totalSection: {
        backgroundColor: colors.primaryFuchsia,
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 18,
        color: colors.white,
        fontWeight: '600',
    },
    totalAmount: {
        fontSize: 32,
        color: colors.white,
        fontWeight: 'bold',
        marginTop: 8,
    },
    itemsCount: {
        fontSize: 14,
        color: colors.white,
        opacity: 0.9,
        marginTop: 4,
    },
    buttonDisabled: {
        backgroundColor: colors.mediumGray,
    },
    loadingText: {
        marginTop: 12,
        color: colors.textLight,
    },
};

export default RegisterSaleScreen;