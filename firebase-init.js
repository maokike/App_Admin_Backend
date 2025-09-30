import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import {
    collection,
    getDocs,
    updateDoc,  // ← Asegúrate de tener esto
    doc,
    query,
    orderBy
} from 'firebase/firestore';

// Importamos la configuración que el usuario añadirá en firebase-config.js
import { firebaseConfig } from './firebase-config';

// Inicializamos la aplicación de Firebase con la configuración
const app = initializeApp(firebaseConfig);

// Obtenemos acceso a los diferentes servicios de Firebase que usaremos
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Exportamos los servicios para poder usarlos en cualquier parte de la aplicación
export { auth, db, storage };
