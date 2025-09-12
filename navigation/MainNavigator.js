import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { auth, db } from '../firebase-init';
import { doc, getDoc } from 'firebase/firestore';

// Pantallas de Admin
import AdminDashboard from '../screens/AdminDashboard';
import LocalDetailScreen from '../screens/LocalDetailScreen';

// Pantallas de Local
import LocalDashboard from '../screens/LocalDashboard';
import LocalMenuScreen from '../screens/LocalMenuScreen';
import RegisterSaleScreen from '../screens/RegisterSaleScreen';
import DailySummaryScreen from '../screens/DailySummaryScreen';

// Pantallas Reutilizables
import InventoryScreen from '../screens/InventoryScreen';


const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (!user) {
          setLoading(false);
          return;
      }
      try {
        const userDocRef = doc(db, 'Usuarios', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserRole(userDoc.data().rol);
        } else {
          console.error("Error: No se encontró el documento del usuario en Firestore.");
        }
      } catch (error) {
        console.error("Error al obtener el rol del usuario:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserRole();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Verificando rol de usuario...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {userRole === 'admin' ? (
        <Stack.Group>
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ headerShown: false }} />
          <Stack.Screen
            name="LocalDetail"
            component={LocalDetailScreen}
            options={({ route }) => ({ title: route.params.localName, headerBackTitle: 'Atrás' })}
          />
        </Stack.Group>
      ) : (
        <Stack.Group>
            <Stack.Screen name="LocalDashboard" component={LocalDashboard} options={{ headerShown: false }} />
            <Stack.Screen
                name="LocalMenu"
                component={LocalMenuScreen}
                options={({ route }) => ({ title: route.params.localName, headerBackTitle: 'Atrás' })}
            />
            <Stack.Screen
                name="Inventory"
                component={InventoryScreen}
                options={{ title: 'Inventario', headerBackTitle: 'Atrás' }}
            />
            <Stack.Screen
                name="RegisterSale"
                component={RegisterSaleScreen}
                options={{ title: 'Registrar Nueva Venta', headerBackTitle: 'Atrás' }}
            />
            <Stack.Screen
                name="DailySummary"
                component={DailySummaryScreen}
                options={{ title: 'Resumen del Día', headerBackTitle: 'Atrás' }}
            />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default MainNavigator;
