import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { auth, db } from '../firebase-init';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { globalStyles, colors } from '../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (name === '' || email === '' || password === '' || role === '') {
      Alert.alert('Campos incompletos', 'Por favor, rellena todos los campos.');
      return;
    }
    
    const roleLower = role.toLowerCase();
    if (roleLower !== 'admin' && roleLower !== 'local') {
        Alert.alert('Rol inválido', 'El rol debe ser "admin" o "local".');
        return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "Usuarios", user.uid), {
        nombre: name,
        rol: roleLower,
        locales_asignados: []
      });

      console.log('¡Usuario registrado y datos guardados en Firestore!');

    } catch (error) {
      let errorMessage = 'Ocurrió un error durante el registro.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo electrónico ya está en uso.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El formato del correo electrónico no es válido.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      }
      Alert.alert('Error de Registro', errorMessage);
      console.error("Error en el registro: ", error);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'admin', label: 'Administrador', icon: 'shield-checkmark', description: 'Acceso completo a todos los locales' },
    { value: 'local', label: 'Encargado de Local', icon: 'storefront', description: 'Gestiona locales específicos' }
  ];

  return (
    <KeyboardAvoidingView 
      style={globalStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Ionicons name="person-add" size={48} color={colors.primaryFuchsia} />
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Únete a la plataforma de gestión</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre Completo</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={colors.textLight} />
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu nombre completo"
                placeholderTextColor={colors.textLight}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={colors.textLight} />
              <TextInput
                style={styles.input}
                placeholder="tu@correo.com"
                placeholderTextColor={colors.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textLight} />
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de Usuario</Text>
            <View style={styles.roleContainer}>
              {roleOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.roleButton,
                    role === option.value && styles.roleButtonActive
                  ]}
                  onPress={() => setRole(option.value)}
                >
                  <Ionicons 
                    name={option.icon} 
                    size={24} 
                    color={role === option.value ? colors.white : colors.primaryPink} 
                  />
                  <View style={styles.roleTextContainer}>
                    <Text style={[
                      styles.roleButtonText,
                      role === option.value && styles.roleButtonTextActive
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={styles.roleDescription}>{option.description}</Text>
                  </View>
                  {role === option.value && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[globalStyles.buttonPrimary, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="create-outline" size={20} color={colors.white} />
                <Text style={globalStyles.buttonText}>Crear Cuenta</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.loginRedirect}>
            <Text style={styles.redirectText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.redirectLink}>Inicia sesión aquí</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = {
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primaryFuchsia,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 16,
    shadowColor: colors.darkGray,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: colors.textDark,
  },
  roleContainer: {
    gap: 12,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: colors.primaryPink,
    borderRadius: 12,
    gap: 12,
  },
  roleButtonActive: {
    backgroundColor: colors.primaryPink,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryPink,
  },
  roleButtonTextActive: {
    color: colors.white,
  },
  roleDescription: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  buttonDisabled: {
    backgroundColor: colors.mediumGray,
  },
  loginRedirect: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
  },
  redirectText: {
    color: colors.textLight,
  },
  redirectLink: {
    color: colors.primaryPink,
    fontWeight: 'bold',
    marginLeft: 4,
  },
};

export default SignUpScreen;