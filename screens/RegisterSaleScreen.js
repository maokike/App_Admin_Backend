import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase-init';
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    Alert,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    FlatList,
    Keyboard
} from 'react-native';
import { auth, storage } from '../firebase-init';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { globalStyles, colors } from '../styles/globalStyles';
import { registerSaleStyles } from '../styles/RegisterSaleScreenStyles';
import { Ionicons } from '@expo/vector-icons';
import { getProducts, registerSale } from '../services/firestoreService';

const RegisterSaleScreen = ({ route, navigation }) => {
    const { localId } = route.params;

    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [saleItems, setSaleItems] = useState([]);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [selectedProductData, setSelectedProductData] = useState(null);
    const [currentQuantity, setCurrentQuantity] = useState('1');
    const [paymentMethod, setPaymentMethod] = useState('efectivo');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [productsLoading, setProductsLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Formatear números
    const formatNumber = (number) => {
        return Number(number).toLocaleString('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    // Calcular total
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
                setFilteredProducts(productsList);
                if (productsList.length > 0) {
                    setCurrentProduct(null); // 🚫 ya no seleccionamos el primero
                    setSelectedProductData(null);
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

    // Sincronizar selectedProductData con currentProduct
    useEffect(() => {
        if (currentProduct && products.length > 0) {
            const product = products.find(p => p.id === currentProduct.id);
            setSelectedProductData(product);
            console.log('Producto actualizado:', product?.name || product?.nombre);
        } else {
            setSelectedProductData(null);
        }
    }, [currentProduct, products]);

    // Filtrar productos según la búsqueda
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredProducts(products);
        } else {
            const filtered = products.filter(product => {
                const productName = (product.name || product.nombre || '').toLowerCase();
                const productDescription = (product.description || '').toLowerCase();
                const query = searchQuery.toLowerCase();
                return productName.includes(query) || productDescription.includes(query);
            });
            setFilteredProducts(filtered);
        }
    }, [searchQuery, products]);

    const handleSearchFocus = () => {
        setShowDropdown(true);
        setFilteredProducts(products);
    };

    const handleSearchChange = (text) => {
        setSearchQuery(text);
        setShowDropdown(true);
    };

    // Cambia el producto seleccionado al tocar en el dropdown
    const handleProductSelect = (product) => {
        console.log('Producto seleccionado:', product.id);
        setCurrentProduct(product); // 🔑 guarda el objeto completo
        setShowDropdown(false);
        setSearchQuery('');
        setCurrentQuantity('1');
        setRefreshKey(prev => prev + 1);

        if (Platform.OS !== 'web') {
            Keyboard.dismiss();
        }
    };

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

        const product = currentProduct;
        if (!product) {
            Alert.alert("Error", "Producto no encontrado.");
            return;
        }

        const availableStock = product.stock || product.cantidad || 0;

        const alreadyAddedItem = saleItems.find(item => item.product.id === currentProduct.id);
        const totalQuantityForProduct = alreadyAddedItem ?
            alreadyAddedItem.quantity + quantity : quantity;

        if (totalQuantityForProduct > availableStock) {
            Alert.alert("Error", `No hay suficiente stock. Disponible: ${availableStock}.`);
            return;
        }

        if (alreadyAddedItem) {
            setSaleItems(prevItems =>
                prevItems.map(item =>
                    item.product.id === currentProduct
                        ? { ...item, quantity: totalQuantityForProduct }
                        : item
                )
            );
        } else {
            setSaleItems(prevItems => [
                ...prevItems,
                {
                    id: Date.now().toString(),
                    product: product,
                    quantity: quantity
                }
            ]);
        }

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
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const storageRef = ref(storage, `comprobantes/${localId}/${new Date().toISOString()}`);
            await uploadBytes(storageRef, blob);
            return await getDownloadURL(storageRef);
        } catch (error) {
            console.error("Error al subir imagen: ", error);
            throw error;
        }
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

            // Registrar todas las ventas
            const salePromises = saleItems.map(async (item) => {
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

                return await registerSale(saleData);
            });

            await Promise.all(salePromises);

            Alert.alert("Éxito", `Venta registrada correctamente con ${saleItems.length} producto(s).`);
            navigation.goBack();

        } catch (error) {
            console.error("Error al registrar la venta: ", error);
            Alert.alert("Error", `No se pudo registrar la venta. ${error.toString()}`);
        } finally {
            setLoading(false);
        }
    };

    // Renderizar sección de agregar productos
    const renderAddProductSection = () => (
        <View style={registerSaleStyles.formSection}>
            <Text style={globalStyles.subtitle}>Agregar Productos</Text>

            {/* Buscador de productos con dropdown */}
            <View style={registerSaleStyles.inputGroup}>
                <Text style={registerSaleStyles.label}>Seleccionar Producto:</Text>
                <View style={registerSaleStyles.searchContainer}>
                    <View style={registerSaleStyles.searchInputContainer}>
                        <Ionicons name="search" size={20} color={colors.textLight} style={registerSaleStyles.searchIcon} />
                        <TextInput
                            style={registerSaleStyles.searchInput}
                            placeholder="Toca aquí para buscar productos..."
                            placeholderTextColor={colors.textLight}
                            value={searchQuery}
                            onChangeText={handleSearchChange}
                            onFocus={handleSearchFocus}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                style={registerSaleStyles.clearButton}
                                onPress={() => {
                                    setSearchQuery('');
                                    setFilteredProducts(products);
                                }}
                            >
                                <Ionicons name="close-circle" size={20} color={colors.textLight} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Dropdown de productos */}
                    {showDropdown && (
                        <View style={[registerSaleStyles.dropdownContainer, { maxHeight: 300 }]}>
                            <FlatList
                                data={filteredProducts}
                                keyExtractor={item => item.id.toString()}
                                nestedScrollEnabled={false}
                                keyboardShouldPersistTaps="always"
                                showsVerticalScrollIndicator={true}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            registerSaleStyles.productItem,
                                            currentProduct?.id === item.id && { backgroundColor: colors.lightGray }
                                        ]}
                                        onPress={() => handleProductSelect(item)} // Solo cerrar al tap
                                    >
                                        <View style={registerSaleStyles.productInfo}>
                                            <Text style={registerSaleStyles.productName}>
                                                {item.name || item.nombre}
                                            </Text>
                                            <Text style={registerSaleStyles.productDetails}>
                                                ${formatNumber(item.price || item.precio || 0)} • Stock: {item.stock || item.cantidad || 0}
                                            </Text>
                                        </View>
                                        {currentProduct?.id === item.id && (
                                            <Ionicons name="checkmark" size={20} color={colors.primaryPink} />
                                        )}
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <Text style={registerSaleStyles.noResultsText}>
                                        No se encontraron productos
                                    </Text>
                                }
                            />
                        </View>
                    )}

                </View>
            </View>

            {/* Producto seleccionado */}
            {currentProduct ? (
                <View style={registerSaleStyles.selectedProduct}>
                    <Text style={registerSaleStyles.selectedProductLabel}>Producto seleccionado:</Text>
                    <View style={registerSaleStyles.selectedProductInfo}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={registerSaleStyles.selectedProductName}>
                                {currentProduct.name || currentProduct.nombre}
                            </Text>
                            <Text style={registerSaleStyles.selectedProductPrice}>
                                ${formatNumber(currentProduct.price || currentProduct.precio || 0)}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={registerSaleStyles.changeProductButton}
                            onPress={() => {
                                setShowDropdown(true);
                                setSearchQuery('');
                            }}
                        >
                            <Text style={registerSaleStyles.changeProductText}>Cambiar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <Text style={registerSaleStyles.noProductSelectedText}>
                    No hay producto seleccionado. Toca en el buscador para seleccionar uno.
                </Text>
            )}

            {/* Cantidad y botón agregar */}
            <View style={registerSaleStyles.quantityRow}>
                <View style={registerSaleStyles.quantityInputContainer}>
                    <Text style={registerSaleStyles.label}>Cantidad:</Text>
                    <TextInput
                        style={registerSaleStyles.quantityInput}
                        value={currentQuantity}
                        onChangeText={setCurrentQuantity}
                        keyboardType="numeric"
                        placeholder="1"
                    />
                </View>

                <TouchableOpacity
                    style={[
                        registerSaleStyles.addButton,
                        (!currentProduct || productsLoading) && registerSaleStyles.addButtonDisabled
                    ]}
                    onPress={addProductToSale}
                    disabled={!currentProduct || productsLoading}
                >
                    <Ionicons name="add" size={20} color={colors.white} />
                    <Text style={registerSaleStyles.addButtonText}>Agregar</Text>
                </TouchableOpacity>
            </View>

            {/* Info del producto seleccionado */}
            {selectedProductData && (
                <View style={registerSaleStyles.productInfoCard}>
                    <Text style={registerSaleStyles.productInfoTitle}>Información del Producto</Text>
                    <View style={registerSaleStyles.productInfoRow}>
                        <Text style={registerSaleStyles.productInfoLabel}>Precio:</Text>
                        <Text style={registerSaleStyles.productInfoValue}>
                            ${formatNumber(selectedProductData.price || selectedProductData.precio || 0)}
                        </Text>
                    </View>
                    <View style={registerSaleStyles.productInfoRow}>
                        <Text style={registerSaleStyles.productInfoLabel}>Stock disponible:</Text>
                        <Text style={registerSaleStyles.productInfoValue}>
                            {formatNumber(selectedProductData.stock || selectedProductData.cantidad || 0)}
                        </Text>
                    </View>
                    {selectedProductData.description && (
                        <View style={registerSaleStyles.productInfoRow}>
                            <Text style={registerSaleStyles.productInfoLabel}>Descripción:</Text>
                            <Text style={registerSaleStyles.productInfoValue}>
                                {selectedProductData.description}
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );

    // Renderizar lista de productos en la venta
    const renderSaleItemsSection = () => {
        if (saleItems.length === 0) return null;

        return (
            <View style={registerSaleStyles.formSection}>
                <Text style={globalStyles.subtitle}>Productos en la Venta ({saleItems.length})</Text>

                <FlatList
                    data={saleItems}
                    scrollEnabled={false}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={registerSaleStyles.saleItem}>
                            <View style={registerSaleStyles.saleItemInfo}>
                                <Text style={registerSaleStyles.productName}>
                                    {item.product.name || item.product.nombre}
                                </Text>
                                <Text style={registerSaleStyles.productPrice}>
                                    ${formatNumber(item.product.price || item.product.precio || 0)} c/u
                                </Text>
                            </View>

                            <View style={registerSaleStyles.quantityControls}>
                                <TouchableOpacity
                                    style={registerSaleStyles.quantityButton}
                                    onPress={() => updateProductQuantity(item.id, item.quantity - 1)}
                                >
                                    <Ionicons name="remove" size={16} color={colors.white} />
                                </TouchableOpacity>

                                <Text style={registerSaleStyles.quantityText}>
                                    {item.quantity}
                                </Text>

                                <TouchableOpacity
                                    style={registerSaleStyles.quantityButton}
                                    onPress={() => updateProductQuantity(item.id, item.quantity + 1)}
                                >
                                    <Ionicons name="add" size={16} color={colors.white} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={registerSaleStyles.deleteButton}
                                    onPress={() => removeProductFromSale(item.id)}
                                >
                                    <Ionicons name="trash" size={16} color={colors.white} />
                                </TouchableOpacity>
                            </View>

                            <Text style={registerSaleStyles.itemTotal}>
                                ${formatNumber((item.product.price || item.product.precio || 0) * item.quantity)}
                            </Text>
                        </View>
                    )}
                />
            </View>
        );
    };

    // Renderizar método de pago
    const renderPaymentSection = () => (
        <View style={registerSaleStyles.formSection}>
            <Text style={globalStyles.subtitle}>Método de Pago</Text>

            <View style={registerSaleStyles.paymentButtons}>
                <TouchableOpacity
                    style={[
                        registerSaleStyles.paymentButton,
                        paymentMethod === 'efectivo' && registerSaleStyles.paymentButtonActive
                    ]}
                    onPress={() => setPaymentMethod('efectivo')}
                >
                    <Ionicons
                        name="cash"
                        size={24}
                        color={paymentMethod === 'efectivo' ? colors.white : colors.primaryPink}
                    />
                    <Text style={[
                        registerSaleStyles.paymentButtonText,
                        paymentMethod === 'efectivo' && registerSaleStyles.paymentButtonTextActive
                    ]}>
                        Efectivo
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        registerSaleStyles.paymentButton,
                        paymentMethod === 'transferencia' && registerSaleStyles.paymentButtonActive
                    ]}
                    onPress={() => setPaymentMethod('transferencia')}
                >
                    <Ionicons
                        name="card"
                        size={24}
                        color={paymentMethod === 'transferencia' ? colors.white : colors.primaryPink}
                    />
                    <Text style={[
                        registerSaleStyles.paymentButtonText,
                        paymentMethod === 'transferencia' && registerSaleStyles.paymentButtonTextActive
                    ]}>
                        Transferencia
                    </Text>
                </TouchableOpacity>
            </View>

            {paymentMethod === 'transferencia' && (
                <View style={registerSaleStyles.imageSection}>
                    <TouchableOpacity style={registerSaleStyles.imageButton} onPress={pickImage}>
                        <Ionicons name="camera" size={24} color={colors.white} />
                        <Text style={registerSaleStyles.imageButtonText}>
                            {image ? 'Cambiar Comprobante' : 'Seleccionar Comprobante'}
                        </Text>
                    </TouchableOpacity>
                    {image && (
                        <Image source={{ uri: image }} style={registerSaleStyles.imagePreview} />
                    )}
                </View>
            )}
        </View>
    );

    // Renderizar total
    const renderTotalSection = () => (
        <View style={registerSaleStyles.totalSection}>
            <Text style={registerSaleStyles.totalLabel}>Total a Pagar:</Text>
            <Text style={registerSaleStyles.totalAmount}>${formatNumber(total)}</Text>
            <Text style={registerSaleStyles.itemsCount}>{saleItems.length} producto(s) en la venta</Text>
        </View>
    );

    // Renderizar botón de registro
    const renderRegisterButton = () => (
        <TouchableOpacity
            style={[globalStyles.buttonPrimary, (loading || saleItems.length === 0) && registerSaleStyles.buttonDisabled]}
            onPress={handleRegisterSale}
            disabled={loading || saleItems.length === 0}
        >
            {loading ? (
                <ActivityIndicator color={colors.white} />
            ) : (
                <>
                    <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                    <Text style={globalStyles.buttonText}>
                        Registrar Venta ({saleItems.length})
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );

    if (productsLoading) {
        return (
            <View style={globalStyles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.primaryPink} />
                <Text style={registerSaleStyles.loadingText}>Cargando productos...</Text>
            </View>
        );
    }

    // Datos para el FlatList principal
    const screenSections = [
        { key: 'title', component: <Text style={registerSaleStyles.sectionTitle}>Registrar Nueva Venta</Text> },
        { key: 'addProduct', component: renderAddProductSection() },
        { key: 'saleItems', component: renderSaleItemsSection() },
        { key: 'payment', component: renderPaymentSection() },
        { key: 'total', component: renderTotalSection() },
        { key: 'button', component: renderRegisterButton() },
    ].filter(section => section.component !== null);

    return (
        <KeyboardAvoidingView
            style={globalStyles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            key={refreshKey}
        >
            <FlatList
                data={screenSections}
                keyExtractor={item => item.key}
                renderItem={({ item }) => item.component}
                contentContainerStyle={registerSaleStyles.container}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="always" // Esto es importante
            />


        </KeyboardAvoidingView>
    );
};

export default RegisterSaleScreen;