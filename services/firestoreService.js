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
  runTransaction
} from 'firebase/firestore';

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

// Obtener locales asignados a un usuario
export const getUserAssignedLocales = async (userId) => {
  try {
    const user = await getUser(userId);
    if (!user || !user.locales_asignados) return [];
    
    const assignedLocales = [];
    
    // Para cada localId asignado, obtener los detalles del local
    for (const localAssignment of user.locales_asignados) {
      try {
        const localDoc = await getDoc(doc(db, 'Locales', localAssignment.localId));
        if (localDoc.exists()) {
          assignedLocales.push({
            localId: localAssignment.localId,
            nombre: localAssignment.nombre || localDoc.data().Nombre || 'Local sin nombre'
          });
        }
      } catch (error) {
        console.error(`Error obteniendo local ${localAssignment.localId}:`, error);
      }
    }
    
    return assignedLocales;
  } catch (error) {
    console.error("Error al obtener locales asignados: ", error);
    return [];
  }
};