import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { auth } from '../firebase-init';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { globalStyles, colors } from '../styles/globalStyles';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email === '' || password === '') {
      Alert.alert('Campos vacíos', 'Por favor, introduce tu correo y contraseña.');
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('Usuario ha iniciado sesión:', userCredential.user.email);
      })
      .catch((error) => {
        Alert.alert('Error de inicio de sesión', 'El correo o la contraseña son incorrectos.');
        console.error(error);
      });
  };

  return (
    <KeyboardAvoidingView 
      style={globalStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.loginContainer}>
        <Text style={styles.title}>Iniciar Sesión</Text>
        <Text style={styles.subtitle}>Bienvenido de vuelta</Text>
        
        <TextInput
          style={globalStyles.input}
          placeholder="Correo Electrónico"
          placeholderTextColor={colors.textLight}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={globalStyles.input}
          placeholder="Contraseña"
          placeholderTextColor={colors.textLight}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity style={globalStyles.buttonPrimary} onPress={handleLogin}>
          <Text style={globalStyles.buttonText}>Acceder</Text>
        </TouchableOpacity>
        
        <View style={styles.signupRedirect}>
          <Text style={styles.redirectText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.redirectLink}>Regístrate aquí</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = {
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.primaryFuchsia,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.textLight,
    marginBottom: 32,
  },
  signupRedirect: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  redirectText: {
    color: colors.textLight,
  },
  redirectLink: {
    color: colors.primaryPink,
    fontWeight: 'bold',
  },
};

export default LoginScreen;