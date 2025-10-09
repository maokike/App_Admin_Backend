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
import { editLocalStyles } from '../styles/EditLocalStyles';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const EditLocalScreen = ({ route, navigation }) => {
    const { local, users, onLocalUpdated, onLocalDeleted } = route.params;
    const [formData, setFormData] = useState({
        name: local.name || '',
        address: local.address || '',
        phone: local.phone || '',
        userId: local.userId || ''
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
            const updatedLocal = { ...local, ...formData };
            await onLocalUpdated(updatedLocal);
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'No se pudo actualizar el local');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Eliminar Local",
            `¿Está seguro que desea eliminar el local "${local.name}"? Esta acción no se puede deshacer.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await onLocalDeleted(local.id, local.name);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo eliminar el local');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const localUsers = users;

    return (
        <KeyboardAvoidingView
            style={globalStyles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={globalStyles.header}>
                <TouchableOpacity
                    style={editLocalStyles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.primaryPink} />
                </TouchableOpacity>
                <Text style={globalStyles.title}>Editar Local</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={editLocalStyles.formContainer}>
                <View style={editLocalStyles.formGroup}>
                    <Text style={editLocalStyles.label}>Nombre del Local *</Text>
                    <TextInput
                        style={editLocalStyles.input}
                        placeholder="Mi Tiendita"
                        value={formData.name}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                        placeholderTextColor={colors.textLight}
                    />
                </View>

                <View style={editLocalStyles.formGroup}>
                    <Text style={editLocalStyles.label}>Dirección *</Text>
                    <TextInput
                        style={editLocalStyles.input}
                        placeholder="Av. Siempre Viva 123"
                        value={formData.address}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                        placeholderTextColor={colors.textLight}
                    />
                </View>

                <View style={editLocalStyles.formGroup}>
                    <Text style={editLocalStyles.label}>Teléfono (Opcional)</Text>
                    <TextInput
                        style={editLocalStyles.input}
                        placeholder="+54 9 11 1234-5678"
                        value={formData.phone}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                        placeholderTextColor={colors.textLight}
                        keyboardType="phone-pad"
                    />
                </View>

                <View style={editLocalStyles.formGroup}>
                    <Text style={editLocalStyles.label}>Asignar Usuario *</Text>
                    <View style={editLocalStyles.pickerContainer}>
                        <Picker
                            selectedValue={formData.userId}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, userId: value }))}
                            style={editLocalStyles.picker}
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

                <View style={editLocalStyles.buttonsContainer}>
                    <TouchableOpacity
                        style={[editLocalStyles.deleteButton, loading && editLocalStyles.buttonDisabled]}
                        onPress={handleDelete}
                        disabled={loading}
                    >
                        <Ionicons name="trash" size={20} color={colors.white} />
                        <Text style={editLocalStyles.deleteButtonText}>Eliminar Local</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[editLocalStyles.submitButton, loading && editLocalStyles.buttonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <>
                                <Ionicons name="save" size={20} color={colors.white} />
                                <Text style={editLocalStyles.submitButtonText}>Guardar Cambios</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default EditLocalScreen;