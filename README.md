# SmartParking UTEQ

Panel de administración web para el sistema de parqueadero inteligente de la Universidad Técnica Estatal de Quevedo (UTEQ). Permite gestionar los vehículos y propietarios autorizados a ingresar al campus, y monitorear en tiempo real el estado de ocupación de los puestos de estacionamiento a partir de sensores conectados por Firebase Realtime Database.

**Repositorio:** https://github.com/Ronald8595/SmartParkingUTEQ

## Descripción del proyecto

El parqueadero de la UTEQ cuenta con sensores de distancia por puesto que reportan su estado (libre/ocupado) a una Firebase Realtime Database. Este panel consume esa información y la combina con una base de datos relacional en Supabase para ofrecer una interfaz de administración donde el personal de control puede:

- Mantener el padrón de vehículos y propietarios autorizados a estacionar.
- Ver de un vistazo qué puestos están libres u ocupados, y qué vehículo ocupa cada uno.
- Consultar el historial de entradas y salidas de un puesto específico.

## Características principales

### Vehículos y propietarios
- Listado con búsqueda por placa, vehículo o propietario, y conteo total de registros.
- Alta de nuevos vehículos con datos del vehículo (placa, marca, modelo, año, color, tipo, foto) y del propietario (cédula, nombre, correo institucional, foto).
- Edición de cualquier registro existente.
- Validación de duplicados por cédula y por placa antes de crear un registro.
- Retiro (baja lógica) de un vehículo: deja de listarse como activo, pero conserva su historial y puede reactivarse más adelante.
- Mensajes de confirmación para cada operación (creación, edición, retiro).

### Puestos de estacionamiento
- Grilla de puestos con filtro por estado (todos / libres / ocupados).
- Cada puesto se vincula a un sensor mediante `sensor_id_rtdb` y `ruta_firebase`, y su estado/distancia se sincroniza en vivo vía Supabase Realtime.
- Alta, edición y eliminación de puestos.
- Detalle de puesto con su historial de ocupaciones (sesiones de entrada/salida).

## Capturas de pantalla

**Home Page de SmartParkingUTEQ**

<img width="1914" height="914" alt="image" src="https://github.com/user-attachments/assets/bbaa3dca-8047-4817-a62b-65f54bd10867" />


**Listado de vehículos y propietarios**

<img width="881" height="445" alt="image" src="https://github.com/user-attachments/assets/44bf98c9-2607-4b8c-ac53-68cc756435f8" />


**Registro de un nuevo vehículo**

<img width="794" height="604" alt="image" src="https://github.com/user-attachments/assets/5a5a01cf-2123-4779-8a7f-7ae95f164133" />

<img width="975" height="119" alt="image" src="https://github.com/user-attachments/assets/f9993a30-2e7f-4556-a2ab-14538a073e8c" />


**Edición de un vehículo**

<img width="784" height="598" alt="image" src="https://github.com/user-attachments/assets/14590398-de58-4412-9ca3-0406c82b02ad" />

<img width="975" height="377" alt="image" src="https://github.com/user-attachments/assets/69274348-4425-4d62-a856-076112d0d2a2" />


**Retiro de un vehículo**

<img width="846" height="474" alt="image" src="https://github.com/user-attachments/assets/da6916d3-c342-43d2-8177-dc6db9cfa056" />

<img width="975" height="134" alt="image" src="https://github.com/user-attachments/assets/307649f9-d375-4488-ae90-77c0da5791cb" />

**Puestos Page - La pagina de puestos tambien tiene incorporado CRUD**
<img width="1891" height="906" alt="image" src="https://github.com/user-attachments/assets/eb470b36-9f00-4651-9b08-4960be2750cd" />

## Stack tecnológico

- **React 19** + **Vite** — interfaz y bundler.
- **CoreUI React 5** — componentes de UI (este proyecto parte de la plantilla CoreUI Free React Admin Template).
- **React Router 7** (`HashRouter`) — enrutamiento.
- **Redux / React Redux** — estado global (tema claro/oscuro del layout).
- **Supabase** (`@supabase/supabase-js`) — base de datos, autenticación de datos y canal Realtime para la sincronización en vivo de puestos.
- **Firebase Realtime Database** — origen de las lecturas de los sensores de cada puesto (referenciado desde Supabase vía `sensor_id_rtdb` / `ruta_firebase`).

## Estructura del proyecto

```
SmartParkingUTEQ/
├── docs/screenshots/          # Capturas usadas en este README
├── src/
│   ├── assets/                 # Íconos, logo e imágenes de marca
│   ├── components/              # Layout base (AppHeader, AppSidebar, AppFooter, AppContent, AppBreadcrumb...)
│   ├── hooks/
│   │   ├── useVehiculos.js      # CRUD de vehículos y propietarios contra Supabase
│   │   ├── usePuestos.js        # CRUD de puestos + suscripción Realtime + ocupación actual
│   │   └── useHistorialPuesto.js# Historial de sesiones de un puesto
│   ├── lib/
│   │   └── supabase.js          # Cliente de Supabase (usa variables de entorno VITE_*)
│   ├── layout/
│   │   └── DefaultLayout.jsx    # Layout con sidebar + header + contenido
│   ├── views/
│   │   ├── dashboard/           # Página de inicio (Dashboard.jsx)
│   │   └── parqueadero/         # Módulo principal del proyecto
│   │       ├── ListaVehiculos.jsx
│   │       ├── Puestos.jsx
│   │       ├── DetallePuesto.jsx
│   │       ├── HistorialPuesto.jsx
│   │       ├── PuestoFormModal.jsx
│   │       ├── PuestoEstadoModal.jsx
│   │       └── VehiculoFormModal.jsx
│   ├── _nav.jsx                 # Menú lateral (Home, Vehículos y propietarios, Puestos)
│   ├── routes.js                 # Rutas de la aplicación
│   └── App.jsx
└── package.json
```

## Instalación y configuración

### Requisitos previos
- Node.js 18 o superior
- Un proyecto de Supabase con las tablas `vehiculos`, `puestos` y `registros_estacionamiento`

### Pasos

```bash
git clone https://github.com/Ronald8595/SmartParkingUTEQ.git
cd SmartParkingUTEQ
npm install
```

Crear un archivo `.env` en la raíz con las credenciales de Supabase:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu-clave-publica
```

Iniciar el entorno de desarrollo:

```bash
npm start
```

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Levanta el servidor de desarrollo con Vite |
| `npm run build` | Genera el build de producción |
| `npm run serve` | Sirve el build de producción para previsualizarlo |
| `npm run lint` | Ejecuta ESLint sobre el proyecto |

## Autor

**Ronald Steven Agurto Macías**
Ingeniería en Telemática — Universidad Técnica Estatal de Quevedo (UTEQ)
`ragurto@uteq.edu.ec`

## Créditos

Interfaz base construida sobre [CoreUI Free React Admin Template](https://coreui.io/product/free-react-admin-template/) (MIT License).
