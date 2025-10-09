// services/firestoreService.js
import { db } from '../firebase-init';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  query,
  where,
  orderBy,
  runTransaction,
  writeBatch
} from 'firebase/firestore';

// ========== FUNCIONES DE USUARIO Y LOCALES ==========

// Obtener usuario por ID
export const getUser = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'Usuarios', userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error al obtener usuario: ", error);
    return null;
  }
};

// Obtener locales asignados a un usuario - FUNCIÓN CORREGIDA
export const getUserAssignedLocales = async (userId) => {
  try {
    const user = await getUser(userId);
    console.log('Datos completos del usuario:', user);
    
    if (!user) {
      console.log('Usuario no encontrado');
      return [];
    }
    
    if (!user.locales_asignados) {
      console.log('Usuario no tiene locales_asignados');
      return [];
    }
    
    console.log('locales_asignados encontrados:', user.locales_asignados);
    
    const assignedLocales = [];
    
    // Para cada localId asignado, obtener los detalles del local
    for (const localAssignment of user.locales_asignados) {
      try {
        console.log('Buscando local:', localAssignment.localId);
        const localDoc = await getDoc(doc(db, 'Locales', localAssignment.localId));
        
        if (localDoc.exists()) {
          const localData = localDoc.data();
          console.log('Datos del local encontrado:', localData);
          
          assignedLocales.push({
            localId: localAssignment.localId,
            nombre: localAssignment.nombre || localData.Nombre || 'Local sin nombre'
          });
        } else {
          console.log('Local no encontrado en Firestore:', localAssignment.localId);
        }
      } catch (error) {
        console.error(`Error obteniendo local ${localAssignment.localId}:`, error);
      }
    }
    
    console.log('Locales asignados finales:', assignedLocales);
    return assignedLocales;
  } catch (error) {
    console.error("Error al obtener locales asignados: ", error);
    return [];
  }
};

// Obtener todos los locales
export const getLocales = async () => {
  try {
    console.log('Buscando colección Locales...');
    const querySnapshot = await getDocs(collection(db, 'Locales'));
    const localesList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('Locales encontrados:', localesList);
    return localesList;
  } catch (error) {
    console.error("Error al obtener locales: ", error);
    return [];
  }
};

// ========== FUNCIONES DE PRODUCTOS ==========

// Obtener todos los productos
export const getProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const productsList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('Productos encontrados:', productsList);
    return productsList;
  } catch (error) {
    console.error("Error al obtener productos: ", error);
    return [];
  }
};

// Obtener productos por local (filtramos después)
export const getProductsByLocal = async (localId) => {
  try {
    // En tu estructura, los productos son globales, no por local
    // Pero podemos filtrar si necesitas lógica específica
    const allProducts = await getProducts();
    return allProducts; // Retornamos todos los productos
  } catch (error) {
    console.error("Error al obtener productos del local: ", error);
    return [];
  }
};

// ========== FUNCIONES DE VENTAS ==========

// Obtener ventas por local
export const getSalesByLocal = async (localId) => {
  try {
    const salesRef = collection(db, 'sales');
    const q = query(
      salesRef, 
      where('localId', '==', localId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const salesList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Ventas encontradas para local ${localId}:`, salesList);
    return salesList;
  } catch (error) {
    console.error("Error al obtener ventas del local: ", error);
    return [];
  }
};

// Obtener ventas del día por local
export const getTodaySalesByLocal = async (localId) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const salesRef = collection(db, 'sales');
    const q = query(
      salesRef, 
      where('localId', '==', localId),
      where('date', '>=', startOfDay),
      where('date', '<=', endOfDay),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const salesList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return salesList;
  } catch (error) {
    console.error("Error al obtener ventas de hoy: ", error);
    return [];
  }
};

// Registrar nueva venta
export const registerSale = async (saleData) => {
    try {
        const salesRef = collection(db, 'sales');
        const productRef = doc(db, 'products', saleData.productId);
        
        await runTransaction(db, async (transaction) => {
            // 1. Verificar y actualizar stock del producto
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists()) {
                throw "El producto no existe.";
            }
            
            const product = productDoc.data();
            const currentStock = product.stock || 0;
            
            if (saleData.quantity > currentStock) {
                throw `Stock insuficiente. Disponible: ${currentStock}`;
            }
            
            // 2. Actualizar stock
            const newStock = currentStock - saleData.quantity;
            transaction.update(productRef, { stock: newStock });
            
            // 3. Registrar venta
            const saleRef = doc(salesRef);
            transaction.set(saleRef, {
                ...saleData,
                date: new Date()
            });
        });
        
        return true;
    } catch (error) {
        console.error("Error al registrar venta: ", error);
        throw error;
    }
};

// ========== FUNCIONES DE MIGRACIÓN ==========

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
export const getAllUsers = async () => {
  try {
    console.log('Buscando todos los usuarios...');
    const usersCollection = collection(db, 'Usuarios');
    const querySnapshot = await getDocs(usersCollection);
    const usersList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('Usuarios encontrados:', usersList.length);
    return usersList;
  } catch (error) {
    console.error("Error al obtener todos los usuarios: ", error);
    return [];
  }
};

// También agrega esta función para obtener solo usuarios con rol "local":
export const getLocalUsers = async () => {
  try {
    console.log('Buscando usuarios con rol local...');
    const usersCollection = collection(db, 'Usuarios');
    const q = query(usersCollection, where('rol', '==', 'local'));
    const querySnapshot = await getDocs(q);
    const usersList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('Usuarios locales encontrados:', usersList.length);
    return usersList;
  } catch (error) {
    console.error("Error al obtener usuarios locales: ", error);
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

// Verificar estado de migración de todos los locales
export const checkMigrationStatus = async () => {
  try {
    const localesSnapshot = await getDocs(collection(db, 'Locales'));
    const locales = localesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const status = [];

    for (const local of locales) {
      const hasInventory = await checkLocalInventory(local.id);
      status.push({
        localId: local.id,
        nombre: local.Nombre || local.nombre,
        tieneInventario: hasInventory
      });
    }

    return status;
  } catch (error) {
    console.error('Error verificando estado de migración:', error);
    return [];
  }
};