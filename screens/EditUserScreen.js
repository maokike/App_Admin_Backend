// screens/EditUserScreen.js (VERSIÓN CORREGIDA)
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator, // ← IMPORTACIÓN AGREGADA
    FlatList
} from 'react-native';
import { globalStyles, colors } from '../styles/globalStyles';
import { editUserStyles } from '../styles/EditUserStyles';
import { Ionicons } from '@expo/vector-icons';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase-init';
import { useToast } from '../hooks/useToast';

const EditUserScreen = ({ route, navigation }) => {
    const { user, locales, onUserSaved } = route.params;
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        rol: 'local',
        locales_asignados: []
    });
    const [loading, setLoading] = useState(false);
    const [availableLocales, setAvailableLocales] = useState([]);
    const [showPassword, setShowPassword] = useState(false);

    const isEditing = !!user;

    useEffect(() => {
        if (user) {
            setFormData({
                nombre: user.nombre || '',
                email: user.email || '',
                password: '', // No mostrar password existente
                rol: user.rol || 'local',
                locales_asignados: user.locales_asignados || []
            });
        }
        setAvailableLocales(locales || []);
        
        navigation.setOptions({
            title: isEditing ? 'Editar Usuario' : 'Nuevo Usuario'
        });
    }, [user, locales, navigation, isEditing]);

    const handleSave = async () => {
        if (!formData.nombre.trim() || !formData.email.trim()) {
            showToast('error', 'Error', 'Nombre y email son obligatorios');
            return;
        }

        if (!isEditing && !formData.password) {
            showToast('error', 'Error', 'La contraseña es obligatoria para nuevos usuarios');
            return;
        }

        if (!isEditing && formData.password.length < 6) {
            showToast('error', 'Error', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        try {
            console.log('🔄 Iniciando creación/actualización de usuario...');
            
            if (isEditing) {
                // Actualizar usuario existente en Firestore
                console.log('📝 Actualizando usuario existente:', user.id);
                const userRef = doc(db, 'Usuarios', user.id);
                const updateData = {
                    nombre: formData.nombre,
                    email: formData.email,
                    rol: formData.rol,
                    locales_asignados: formData.locales_asignados,
                    fecha_actualizacion: new Date()
                };
                
                await updateDoc(userRef, updateData);
                console.log('✅ Usuario actualizado en Firestore');
                showToast('success', 'Usuario Actualizado', 'Los datos del usuario han sido actualizados');
            } else {
                // Crear nuevo usuario con Firebase Auth
                console.log('👤 Creando nuevo usuario en Auth...');
                const userCredential = await createUserWithEmailAndPassword(
                    auth, 
                    formData.email, 
                    formData.password
                );
                
                const newUser = userCredential.user;
                console.log('✅ Usuario creado en Auth:', newUser.uid);
                
                // Guardar datos adicionales en Firestore
                const userData = {
                    nombre: formData.nombre,
                    email: formData.email,
                    rol: formData.rol,
                    locales_asignados: formData.locales_asignados,
                    fecha_creacion: new Date(),
                    uid: newUser.uid
                };
                
                console.log('💾 Guardando datos en Firestore...');
                await setDoc(doc(db, 'Usuarios', newUser.uid), userData);
                console.log('✅ Datos guardados en Firestore');
                showToast('success', 'Usuario Creado', 'El usuario ha sido creado exitosamente');
            }

            onUserSaved?.();
            navigation.goBack();
        } catch (error) {
            console.error("❌ Error saving user: ", error);
            console.error("Código de error:", error.code);
            console.error("Mensaje de error:", error.message);
            
            // Manejar errores específicos de Firebase
            let errorMessage = 'No se pudo guardar el usuario';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Este email ya está registrado';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'El formato del email es inválido';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'La contraseña es demasiado débil';
            } else if (error.code === 'permission-denied') {
                errorMessage = 'Error de permisos. Contacta al administrador.';
                console.error('🔐 Detalles de permisos:', error);
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Error de conexión. Verifica tu internet.';
            }
            
            showToast('error', 'Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const toggleLocalAssignment = (local) => {
        const isAssigned = formData.locales_asignados.some(la => la.localId === local.id);
        
        if (isAssigned) {
            // Remover local
            setFormData(prev => ({
                ...prev,
                locales_asignados: prev.locales_asignados.filter(la => la.localId !== local.id)
            }));
        } else {
            // Agregar local
            setFormData(prev => ({
                ...prev,
                locales_asignados: [
                    ...prev.locales_asignados,
                    {
                        localId: local.id,
                        nombre: local.name || local.Nombre
                    }
                ]
            }));
        }
    };

    const isLocalAssigned = (localId) => {
        return formData.locales_asignados.some(la => la.localId === localId);
    };

    const renderLocalItem = ({ item }) => (
        <TouchableOpacity
            style={[
                editUserStyles.localItem,
                isLocalAssigned(item.id) && editUserStyles.localItemSelected
            ]}
            onPress={() => toggleLocalAssignment(item)}
        >
            <View style={editUserStyles.localInfo}>
                <Ionicons 
                    name="business" 
                    size={20} 
                    color={isLocalAssigned(item.id) ? colors.white : colors.primaryPink} 
                />
                <View>
                    <Text style={[
                        editUserStyles.localName,
                        isLocalAssigned(item.id) && editUserStyles.localNameSelected
                    ]}>
                        {item.name || item.Nombre}
                    </Text>
                    <Text style={[
                        editUserStyles.localAddress,
                        isLocalAssigned(item.id) && editUserStyles.localAddressSelected
                    ]}>
                        {item.address || item.Dirección || 'Sin dirección'}
                    </Text>
                </View>
            </View>
            <Ionicons 
                name={isLocalAssigned(item.id) ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={isLocalAssigned(item.id) ? colors.white : colors.textLight}
            />
        </TouchableOpacity>
    );

    return (
        <View style={globalStyles.container}>
            <ScrollView style={editUserStyles.formContainer}>
                {/* Información Básica */}
                <View style={editUserStyles.section}>
                    <Text style={editUserStyles.sectionTitle}>Información Básica</Text>
                    
                    <View style={editUserStyles.inputGroup}>
                        <Text style={editUserStyles.label}>Nombre *</Text>
                        <TextInput
                            style={editUserStyles.input}
                            value={formData.nombre}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, nombre: text }))}
                            placeholder="Ingrese el nombre completo"
                        />
                    </View>

                    <View style={editUserStyles.inputGroup}>
                        <Text style={editUserStyles.label}>Email *</Text>
                        <TextInput
                            style={editUserStyles.input}
                            value={formData.email}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                            placeholder="usuario@ejemplo.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isEditing}
                        />
                    </View>

                    {!isEditing && (
                        <View style={editUserStyles.inputGroup}>
                            <Text style={editUserStyles.label}>Contraseña *</Text>
                            <View style={editUserStyles.passwordContainer}>
                                <TextInput
                                    style={editUserStyles.input}
                                    value={formData.password}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                                    placeholder="Mínimo 6 caracteres"
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    style={editUserStyles.passwordToggle}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Ionicons 
                                        name={showPassword ? "eye-off" : "eye"} 
                                        size={20} 
                                        color={colors.textLight} 
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <View style={editUserStyles.inputGroup}>
                        <Text style={editUserStyles.label}>Rol del Usuario</Text>
                        <View style={editUserStyles.roleContainer}>
                            <TouchableOpacity
                                style={[
                                    editUserStyles.roleButton,
                                    formData.rol === 'admin' && editUserStyles.roleButtonSelected
                                ]}
                                onPress={() => setFormData(prev => ({ ...prev, rol: 'admin' }))}
                            >
                                <Ionicons 
                                    name="shield" 
                                    size={20} 
                                    color={formData.rol === 'admin' ? colors.white : colors.primaryFuchsia} 
                                />
                                <Text style={[
                                    editUserStyles.roleButtonText,
                                    formData.rol === 'admin' && editUserStyles.roleButtonTextSelected
                                ]}>
                                    Administrador
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    editUserStyles.roleButton,
                                    formData.rol === 'local' && editUserStyles.roleButtonSelected
                                ]}
                                onPress={() => setFormData(prev => ({ ...prev, rol: 'local' }))}
                            >
                                <Ionicons 
                                    name="business" 
                                    size={20} 
                                    color={formData.rol === 'local' ? colors.white : colors.primaryBlue} 
                                />
                                <Text style={[
                                    editUserStyles.roleButtonText,
                                    formData.rol === 'local' && editUserStyles.roleButtonTextSelected
                                ]}>
                                    Local
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Asignación de Locales */}
                <View style={editUserStyles.section}>
                    <Text style={editUserStyles.sectionTitle}>
                        Locales Asignados ({formData.locales_asignados.length})
                    </Text>
                    <Text style={editUserStyles.sectionSubtitle}>
                        Selecciona los locales que este usuario puede gestionar
                    </Text>

                    {availableLocales.length > 0 ? (
                        <FlatList
                            data={availableLocales}
                            renderItem={renderLocalItem}
                            keyExtractor={item => item.id}
                            scrollEnabled={false}
                            style={editUserStyles.localesList}
                        />
                    ) : (
                        <View style={editUserStyles.emptyLocales}>
                            <Ionicons name="business-outline" size={48} color={colors.textLight} />
                            <Text style={editUserStyles.emptyLocalesText}>
                                No hay locales disponibles
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Botones de acción */}
            <View style={editUserStyles.actionButtons}>
                <TouchableOpacity
                    style={editUserStyles.cancelButton}
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                >
                    <Text style={editUserStyles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        editUserStyles.saveButton,
                        loading && editUserStyles.saveButtonDisabled
                    ]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <>
                            <Ionicons name="save" size={20} color={colors.white} />
                            <Text style={editUserStyles.saveButtonText}>
                                {isEditing ? 'Actualizar' : 'Crear'} Usuario
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default EditUserScreen;