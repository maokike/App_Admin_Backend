import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { auth, db } from '../firebase-init';
import { doc, getDoc } from 'firebase/firestore';

import AdminDashboard from '../screens/AdminDashboard';
import LocalDetailScreen from '../screens/LocalDetailScreen';
import LocalDashboard from '../screens/LocalDashboard';
import LocalMenuScreen from '../screens/LocalMenuScreen';
import RegisterSaleScreen from '../screens/RegisterSaleScreen';
import DailySummaryScreen from '../screens/DailySummaryScreen';
import InventoryScreen from '../screens/InventoryScreen';
import { globalStyles, colors } from '../styles/globalStyles';

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
      <View style={globalStyles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primaryPink} />
        <Text style={styles.loadingText}>Verificando rol de usuario...</Text>
      </View>
    );
  }

  const screenOptions = {
    headerStyle: {
      backgroundColor: colors.white,
    },
    headerTintColor: colors.primaryFuchsia,
    headerTitleStyle: {
      fontWeight: 'bold',
    },
    headerBackTitle: 'Atrás',
    headerBackTitleStyle: {
      color: colors.primaryPink,
    },
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {userRole === 'admin' ? (
        <Stack.Group>
          <Stack.Screen 
            name="AdminDashboard" 
            component={AdminDashboard} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen
            name="LocalDetail"
            component={LocalDetailScreen}
            options={({ route }) => ({ 
              title: route.params.localName,
              headerStyle: {
                backgroundColor: colors.white,
              },
              headerTintColor: colors.primaryFuchsia,
            })}
          />
        </Stack.Group>
      ) : (
        <Stack.Group>
            <Stack.Screen 
              name="LocalDashboard" 
              component={LocalDashboard} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen
                name="LocalMenu"
                component={LocalMenuScreen}
                options={({ route }) => ({ 
                  title: route.params.localName,
                  headerStyle: {
                    backgroundColor: colors.white,
                  },
                  headerTintColor: colors.primaryFuchsia,
                })}
            />
            <Stack.Screen
                name="Inventory"
                component={InventoryScreen}
                options={{ 
                  title: 'Inventario',
                  headerStyle: {
                    backgroundColor: colors.white,
                  },
                  headerTintColor: colors.primaryFuchsia,
                }}
            />
            <Stack.Screen
                name="RegisterSale"
                component={RegisterSaleScreen}
                options={{ 
                  title: 'Registrar Nueva Venta',
                  headerStyle: {
                    backgroundColor: colors.white,
                  },
                  headerTintColor: colors.primaryFuchsia,
                }}
            />
            <Stack.Screen
                name="DailySummary"
                component={DailySummaryScreen}
                options={{ 
                  title: 'Resumen del Día',
                  headerStyle: {
                    backgroundColor: colors.white,
                  },
                  headerTintColor: colors.primaryFuchsia,
                }}
            />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};

const styles = {
  loadingText: {
    marginTop: 12,
    color: colors.textLight,
    fontSize: 16,
  },
};

export default MainNavigator;