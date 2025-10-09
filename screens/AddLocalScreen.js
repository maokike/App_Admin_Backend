import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { globalStyles, colors } from '../styles/globalStyles';
import { addLocalStyles } from '../styles/AddLocalStyles';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const AddLocalScreen = ({ route, navigation }) => {
    const { users, onLocalAdded } = route.params;
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        userId: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!formData.name.trim() || !formData.address.trim() || !formData.userId) {
            Alert.alert('Error', 'Por favor complete todos los campos obligatorios');
            return;
        }

        if (formData.name.length < 2) {
            Alert.alert('Error', 'El nombre del local debe tener al menos 2 caracteres');
            return;
        }

        if (formData.address.length < 5) {
            Alert.alert('Error', 'La dirección debe tener al menos 5 caracteres');
            return;
        }

        setLoading(true);
        try {
            await onLocalAdded(formData);
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'No se pudo crear el local');
        } finally {
            setLoading(false);
        }
    };

    const localUsers = users;

    return (
        <KeyboardAvoidingView
            style={globalStyles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={globalStyles.header}>
                <TouchableOpacity
                    style={addLocalStyles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.primaryPink} />
                </TouchableOpacity>
                <Text style={globalStyles.title}>Nuevo Local</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={addLocalStyles.formContainer}>
                <View style={addLocalStyles.formGroup}>
                    <Text style={addLocalStyles.label}>Nombre del Local *</Text>
                    <TextInput
                        style={addLocalStyles.input}
                        placeholder="Mi Tiendita"
                        value={formData.name}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                        placeholderTextColor={colors.textLight}
                    />
                </View>

                <View style={addLocalStyles.formGroup}>
                    <Text style={addLocalStyles.label}>Dirección *</Text>
                    <TextInput
                        style={addLocalStyles.input}
                        placeholder="Av. Siempre Viva 123"
                        value={formData.address}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                        placeholderTextColor={colors.textLight}
                    />
                </View>

                <View style={addLocalStyles.formGroup}>
                    <Text style={addLocalStyles.label}>Teléfono (Opcional)</Text>
                    <TextInput
                        style={addLocalStyles.input}
                        placeholder="+54 9 11 1234-5678"
                        value={formData.phone}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                        placeholderTextColor={colors.textLight}
                        keyboardType="phone-pad"
                    />
                </View>

                <View style={addLocalStyles.formGroup}>
                    <Text style={addLocalStyles.label}>Asignar Usuario *</Text>
                    <View style={addLocalStyles.pickerContainer}>
                        <Picker
                            selectedValue={formData.userId}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, userId: value }))}
                            style={addLocalStyles.picker}
                        >
                            <Picker.Item label="Selecciona un usuario" value="" />
                            {localUsers.map(user => (
                                <Picker.Item
                                    key={user.id}
                                    label={user.name || user.email}
                                    value={user.id}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

                <TouchableOpacity
                    style={[
                        addLocalStyles.submitButton,
                        loading && addLocalStyles.submitButtonDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <>
                            <Ionicons name="business" size={20} color={colors.white} />
                            <Text style={addLocalStyles.submitButtonText}>Agregar Local</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default AddLocalScreen;