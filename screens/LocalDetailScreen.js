import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

// Estos dos componentes los crearé en los siguientes pasos.
// Serán las pantallas para cada una de las pestañas.
import InventoryScreen from './InventoryScreen';
import SalesScreen from './SalesScreen';

const Tab = createMaterialTopTabNavigator();

const LocalDetailScreen = ({ route }) => {
  // Obtenemos el ID del local que se pasó como parámetro durante la navegación.
  const { localId } = route.params;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: 'gray',
        tabBarIndicatorStyle: {
          backgroundColor: '#3498db',
        },
        tabBarLabelStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/*
        Cada pantalla del Tab Navigator recibe el ID del local.
        Usamos una función para renderizar el componente y pasarle props.
      */}
      <Tab.Screen name="Inventario">
        {() => <InventoryScreen localId={localId} />}
      </Tab.Screen>
      <Tab.Screen name="Ventas">
        {() => <SalesScreen localId={localId} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default LocalDetailScreen;
