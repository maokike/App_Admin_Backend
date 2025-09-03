import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { db, storage } from '../firebase-init';
import { collection, getDocs, doc, runTransaction } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

const RegisterSaleScreen = ({ route, navigation }) => {
    const { localId } = route.params;

    const [inventory, setInventory] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState('1');
    const [paymentMethod, setPaymentMethod] = useState('efectivo');
    const [image, setImage] = useState(null);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [inventoryLoading, setInventoryLoading] = useState(true);

    // Cargar inventario al iniciar
    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const inventoryPath = `Locales/${localId}/inventario`;
                const querySnapshot = await getDocs(collection(db, inventoryPath));
                const inventoryList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setInventory(inventoryList);
                if (inventoryList.length > 0) {
                    setSelectedProduct(inventoryList[0].id);
                }
            } catch (error) {
                console.error("Error fetching inventory: ", error);
                Alert.alert("Error", "No se pudo cargar el inventario.");
            } finally {
                setInventoryLoading(false);
            }
        };
        fetchInventory();
    }, [localId]);

    // Calcular total cuando cambia el producto o la cantidad
    useEffect(() => {
        if (selectedProduct && inventory.length > 0) {
            const product = inventory.find(p => p.id === selectedProduct);
            const quant = parseInt(quantity, 10) || 0;
            if (product) {
                setTotal(product.precio * quant);
            }
        }
    }, [selectedProduct, quantity, inventory]);

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
        setLoading(true);
        const quant = parseInt(quantity, 10);
        const product = inventory.find(p => p.id === selectedProduct);

        // Validaciones
        if (!product) {
            Alert.alert("Error", "Por favor, selecciona un producto.");
            setLoading(false);
            return;
        }
        if (!quant || quant <= 0) {
            Alert.alert("Error", "La cantidad debe ser mayor a cero.");
            setLoading(false);
            return;
        }
        if (quant > product.cantidad) {
            Alert.alert("Error", `No hay suficiente stock. Disponible: ${product.cantidad}.`);
            setLoading(false);
            return;
        }
        if (paymentMethod === 'transferencia' && !image) {
            Alert.alert("Error", "Por favor, sube el comprobante de la transferencia.");
            setLoading(false);
            return;
        }

        try {
            await runTransaction(db, async (transaction) => {
                const productRef = doc(db, `Locales/${localId}/inventario`, product.id);
                const saleRef = doc(collection(db, `Locales/${localId}/ventas`));

                // 1. Volver a leer el producto dentro de la transacción
                const productDoc = await transaction.get(productRef);
                if (!productDoc.exists()) {
                    throw "El producto ya no existe.";
                }
                const currentStock = productDoc.data().cantidad;
                if (quant > currentStock) {
                    throw `No hay suficiente stock. Disponible: ${currentStock}.`;
                }

                // 2. Subir imagen si es necesario
                let imageUrl = '';
                if (paymentMethod === 'transferencia') {
                    imageUrl = await uploadImage(image);
                }

                // 3. Registrar la venta
                transaction.set(saleRef, {
                    fecha: new Date(),
                    producto: product.nombre, // Guardamos el nombre para referencia rápida
                    cantidad: quant,
                    total: total,
                    tipo_pago: paymentMethod,
                    imagen_transferencia_url: imageUrl,
                });

                // 4. Actualizar el inventario
                const newStock = currentStock - quant;
                transaction.update(productRef, { cantidad: newStock });
            });

            Alert.alert("Éxito", "Venta registrada correctamente.");
            navigation.goBack();

        } catch (error) {
            console.error("Error en la transacción: ", error);
            Alert.alert("Error", `No se pudo registrar la venta. ${error.toString()}`);
        } finally {
            setLoading(false);
        }
    };

    if (inventoryLoading) {
        return <ActivityIndicator style={{ flex: 1 }} size="large" />;
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.label}>Producto:</Text>
            <Picker
                selectedValue={selectedProduct}
                onValueChange={(itemValue) => setSelectedProduct(itemValue)}
                style={styles.picker}
            >
                {inventory.map(p => (
                    <Picker.Item key={p.id} label={`${p.nombre} (Stock: ${p.cantidad})`} value={p.id} />
                ))}
            </Picker>

            <Text style={styles.label}>Cantidad:</Text>
            <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
            />

            <Text style={styles.label}>Método de Pago:</Text>
            <Picker
                selectedValue={paymentMethod}
                onValueChange={(itemValue) => setPaymentMethod(itemValue)}
                style={styles.picker}
            >
                <Picker.Item label="Efectivo" value="efectivo" />
                <Picker.Item label="Transferencia" value="transferencia" />
            </Picker>

            {paymentMethod === 'transferencia' && (
                <View style={styles.imageContainer}>
                    <Button title="Seleccionar Comprobante" onPress={pickImage} />
                    {image && <Image source={{ uri: image }} style={styles.image} />}
                </View>
            )}

            <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegisterSale}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Registrar Venta</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
};

// Add extensive styling for a good UX
const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 5,
    },
    input: {
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        borderColor: '#ccc',
        borderWidth: 1,
        fontSize: 16,
    },
    picker: {
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    imageContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    image: {
        width: 200,
        height: 200,
        marginTop: 15,
        resizeMode: 'contain',
    },
    total: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
    },
    button: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#9c9c9c',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default RegisterSaleScreen;
