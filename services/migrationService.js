// services/migrationService.js
import { db } from '../firebase-init';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc,
  writeBatch
} from 'firebase/firestore';

// Migrar productos globales a inventarios por local
export const migrateProductsToLocales = async () => {
  try {
    console.log('Iniciando migración de productos...');
    
    // 1. Obtener todos los productos globales
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Productos encontrados: ${products.length}`);

    // 2. Obtener todos los locales
    const localesSnapshot = await getDocs(collection(db, 'Locales'));
    const locales = localesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Locales encontrados: ${locales.length}`);

    // 3. Para cada local, crear su inventario con los productos
    for (const local of locales) {
      const batch = writeBatch(db);
      
      for (const product of products) {
        const inventoryRef = doc(db, 'Locales', local.id, 'inventario', product.id);
        
        // Mapear campos del producto global al formato de inventario
        batch.set(inventoryRef, {
          nombre: product.name || product.nombre || 'Producto sin nombre',
          precio: product.price || product.precio || 0,
          cantidad: product.stock || product.cantidad || 0,
          descripcion: product.description || product.descripcion || '',
          activo: true,
          migrado: true,
          fechaMigracion: new Date(),
          productoOriginalId: product.id
        });
      }
      
      // Commit del batch para este local
      await batch.commit();
      console.log(`Inventario migrado para: ${local.Nombre || local.nombre}`);
    }

    console.log('Migración completada exitosamente');
    return { 
      success: true, 
      message: `Migración completada: ${products.length} productos migrados a ${locales.length} locales` 
    };
    
  } catch (error) {
    console.error('Error en migración:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Verificar si un local ya tiene inventario
export const checkLocalInventory = async (localId) => {
  try {
    const inventarioRef = collection(db, 'Locales', localId, 'inventario');
    const snapshot = await getDocs(inventarioRef);
    console.log(`Inventario encontrado para local ${localId}: ${snapshot.size} productos`);
    return !snapshot.empty;
  } catch (error) {
    console.error(`Error verificando inventario del local ${localId}:`, error);
    return false;
  }
};

// Obtener inventario de un local específico
export const getLocalInventory = async (localId) => {
  try {
    const inventarioRef = collection(db, 'Locales', localId, 'inventario');
    const snapshot = await getDocs(inventarioRef);
    
    if (snapshot.empty) {
      console.log(`No hay inventario para el local ${localId}`);
      return [];
    }
    
    const inventory = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Inventario obtenido para local ${localId}: ${inventory.length} productos`);
    return inventory;
    
  } catch (error) {
    console.error(`Error obteniendo inventario del local ${localId}:`, error);
    return [];
  }
};

// Migración específica para un solo local
export const migrateProductsToSingleLocal = async (localId) => {
  try {
    // Obtener productos globales
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const batch = writeBatch(db);

    // Migrar productos a este local específico
    for (const product of products) {
      const inventoryRef = doc(db, 'Locales', localId, 'inventario', product.id);
      
      batch.set(inventoryRef, {
        nombre: product.name || product.nombre || 'Producto sin nombre',
        precio: product.price || product.precio || 0,
        cantidad: product.stock || product.cantidad || 0,
        descripcion: product.description || product.descripcion || '',
        activo: true,
        migrado: true,
        fechaMigracion: new Date(),
        productoOriginalId: product.id
      });
    }

    await batch.commit();
    
    console.log(`Migración completada para local ${localId}: ${products.length} productos`);
    return { 
      success: true, 
      message: `${products.length} productos migrados al local` 
    };
    
  } catch (error) {
    console.error(`Error en migración para local ${localId}:`, error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};
