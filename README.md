# App Admin - Aplicación Móvil

¡Bienvenido/a al proyecto de la aplicación de administración! Esta es una aplicación móvil, construida con React Native y Expo, diseñada para funcionar tanto en Android como en iOS.

## 📜 Descripción General

La aplicación permite a los usuarios gestionar locales, inventarios y ventas. Existen dos tipos de roles para los usuarios:
- **Administrador (`admin`):** Puede ver todos los locales, consultar sus inventarios y revisar el historial de ventas.
- **Encargado de Local (`local`):** Solo puede ver los locales que tiene asignados, gestionar su inventario y registrar nuevas ventas.

---

## ✨ Funcionalidades Implementadas

### Generales
- **Autenticación de Usuarios:** Sistema de inicio de sesión y registro por correo y contraseña.
- **Navegación por Roles:** La aplicación detecta automáticamente el rol del usuario (`admin` o `local`) y muestra la interfaz correspondiente.

### Funcionalidades del Administrador (`admin`)
- **Vista de Todos los Locales:** El administrador puede ver una lista de todos los locales registrados en la base de datos.
- **Detalle del Local:** Al seleccionar un local, puede acceder a una vista con dos pestañas:
  - **Inventario:** Muestra una lista de todos los productos del local con su nombre, cantidad y precio.
  - **Ventas:** Muestra un historial de todas las ventas realizadas en ese local, ordenadas de la más reciente a la más antigua.

### Funcionalidades del Encargado de Local (`local`)
- **Vista de Locales Asignados:** El usuario solo ve los locales que tiene específicamente asignados en su perfil.
- **Menú de Acciones por Local:** Al seleccionar uno de sus locales, accede a un menú para:
  - **Ver Inventario:** Reutiliza la misma pantalla de inventario que el administrador.
  - **Registrar Venta:** Un formulario completo para:
    - Seleccionar un producto del inventario actual.
    - Especificar la cantidad (con validación de no exceder el stock).
    - Calcular el total de la venta automáticamente.
    - Elegir método de pago (efectivo o transferencia).
    - Subir una foto del comprobante si es transferencia.
    - La venta se registra y el stock del inventario se actualiza atómicamente.
  - **Ver Resumen del Día:** Muestra un resumen de las ventas del día actual, incluyendo ingresos totales y número de ventas.

---

## 🏗️ Estructura de la Base de Datos (Firestore)

Para que la aplicación funcione, tus datos en Firestore deben seguir esta estructura. Puedes añadir documentos manualmente desde la consola de Firebase para probar.

```
/Usuarios/{user_id}
  ├── nombre: (string) "Nombre del Usuario"
  ├── rol: (string) "admin" o "local"
  └── locales_asignados: (array) ["id_del_local_1", "id_del_local_2"]

/Locales/{local_id}
  ├── nombre: (string) "Nombre del Local"
  │
  ├── /inventario/{producto_id}
  │     ├── nombre: (string) "Nombre del Producto"
  │     ├── cantidad: (number) 100
  │     └── precio: (number) 15.99
  │
  └── /ventas/{venta_id}
        ├── fecha: (timestamp) La fecha y hora de la venta
        ├── producto: (string) "Nombre del Producto Vendido"
        ├── cantidad: (number) 2
        ├── total: (number) 31.98
        ├── tipo_pago: (string) "efectivo" o "transferencia"
        └── imagen_transferencia_url: (string) (Opcional) "http://..."
```

---

## 🚀 Cómo Empezar (Guía para no programadores)

Para poder ejecutar esta aplicación en tu computadora y verla en tu teléfono, necesitas seguir estos pasos.

### Paso 1: Instalar las Herramientas Necesarias

Necesitas instalar dos cosas en tu computadora: **Node.js** y **Git**.

1.  **Instalar Node.js:**
    *   Ve a la página oficial de Node.js: [https://nodejs.org/](https://nodejs.org/)
    *   Descarga la versión que dice **LTS** (es la más estable).
    *   Abre el archivo descargado y sigue los pasos del instalador.

2.  **Instalar Git:**
    *   Ve a la página oficial de Git: [https://git-scm.com/downloads](https://git-scm.com/downloads)
    *   Descarga la versión para tu sistema operativo (Windows o Mac) y sigue los pasos del instalador.

### Paso 2: Descargar el Código del Proyecto

1.  Abre la **Terminal** en tu computadora.
    *   **En Mac:** Ve a `Aplicaciones` > `Utilidades` > `Terminal`.
    *   **En Windows:** Busca "cmd" o "Símbolo del sistema" en el menú de inicio.
2.  Elige una carpeta donde quieras guardar el proyecto (ej. el Escritorio). Escribe en la terminal: `cd Desktop`
3.  Clona (descarga) el proyecto desde GitHub:
    ```bash
    git clone https://github.com/maokike/App_Admin_Backend.git
    ```
4.  Entra en la carpeta del proyecto: `cd App_Admin_Backend`
5.  Instala todas las dependencias. Este comando descargará todo lo necesario. Puede tardar unos minutos.
    ```bash
    npm install
    ```

### Paso 3: Configurar Firebase (Tu Base de Datos en la Nube)

1.  **Crea una cuenta y un proyecto en Firebase:**
    *   Ve a [https://console.firebase.google.com/](https://console.firebase.google.com/) y crea un nuevo proyecto.

2.  **Crea una Aplicación Web dentro de Firebase:**
    *   Dentro de tu proyecto, haz clic en el ícono de **Web** (`</>`).
    *   Registra la app y copia el objeto `firebaseConfig` que te proporciona Firebase.

3.  **Pega tu Configuración en el Proyecto:**
    *   Abre el archivo `firebase-config.js` en la carpeta del proyecto.
    *   Reemplaza el contenido de ejemplo con el `firebaseConfig` que copiaste.

4.  **Activa los Servicios de Firebase:**
    *   **Firestore Database:** En el menú de Firebase, ve a **Compilación > Firestore Database**, crea una base de datos e iníciala en **modo de prueba**.
    *   **Authentication:** Ve a **Compilación > Authentication**, haz clic en "Comenzar" y habilita el proveedor **Correo electrónico/Contraseña**.
    *   **Storage:** Ve a **Compilación > Storage**, haz clic en "Comenzar" e inícialo en **modo de prueba**.

### Paso 4: ¡Ejecutar la Aplicación!

1.  **Instala la app de Expo Go en tu teléfono** desde la App Store o Google Play.
2.  En tu computadora, dentro de la carpeta del proyecto, ejecuta:
    ```bash
    npm start
    ```
3.  Se mostrará un **código QR** en la terminal. Abre la app Expo Go en tu teléfono y escanea ese código.
4.  ¡La aplicación se cargará en tu teléfono! Ya puedes crear usuarios y probar las funcionalidades.
