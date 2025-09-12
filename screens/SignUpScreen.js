import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebase-init'; // Importamos auth y db
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(''); // 'admin' o 'local'

  const handleSignUp = async () => {
    // Validación de campos
    if (name === '' || email === '' || password === '' || role === '') {
      Alert.alert('Campos incompletos', 'Por favor, rellena todos los campos.');
      return;
    }
    const roleLower = role.toLowerCase();
    if (roleLower !== 'admin' && roleLower !== 'local') {
        Alert.alert('Rol inválido', 'El rol debe ser "admin" o "local".');
        return;
    }

    try {
      // 1. Crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Guardar la información adicional en Firestore
      // Usamos el UID (ID único de usuario) como identificador del documento
      await setDoc(doc(db, "Usuarios", user.uid), {
        nombre: name,
        rol: roleLower,
        locales_asignados: [] // Por defecto, un nuevo usuario no tiene locales asignados
      });

      console.log('¡Usuario registrado y datos guardados en Firestore!');
      // La navegación se gestionará automáticamente en App.js al detectar el nuevo usuario logueado

    } catch (error) {
      // Gestión de errores comunes de Firebase
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
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre Completo"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo Electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Rol (escribe admin o local)"
        value={role}
        onChangeText={setRole}
        autoCapitalize="none"
      />
      <Button title="Registrarme" onPress={handleSignUp} />
       <View style={styles.loginRedirect}>
        <Text>¿Ya tienes cuenta? </Text>
        <Button
          title="Inicia sesión"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: 'white',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
        fontSize: 16,
    },
    loginRedirect: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    }
});

export default SignUpScreen;
