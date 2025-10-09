import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import InventoryScreen from './InventoryScreen';
import SalesScreen from './SalesScreen';
import { colors } from '../styles/globalStyles';

const Tab = createMaterialTopTabNavigator();

const LocalDetailScreen = ({ route }) => {
  const { localId, localName } = route.params;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primaryFuchsia,
        tabBarInactiveTintColor: colors.textLight,
        tabBarIndicatorStyle: {
          backgroundColor: colors.primaryFuchsia,
          height: 3,
        },
        tabBarLabelStyle: {
          fontWeight: 'bold',
          fontSize: 14,
          textTransform: 'none',
        },
        tabBarStyle: {
          backgroundColor: colors.white,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.mediumGray,
        },
      }}
    >
      <Tab.Screen 
        name="Inventario" 
        options={{ tabBarLabel: 'Inventario' }}
      >
        {() => <InventoryScreen localId={localId} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Ventas" 
        options={{ tabBarLabel: 'Historial de Ventas' }}
      >
        {() => <SalesScreen localId={localId} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default LocalDetailScreen;