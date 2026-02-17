TourApp: Audioguías InteligentesTourApp es una plataforma móvil de turismo inteligente que permite a los usuarios crear, gestionar y disfrutar de rutas turísticas personalizadas. La aplicación combina la potencia de Supabase para la gestión de datos, 
Google Maps para la navegación y Text-to-Speech para una experiencia de audioguía inmersiva.

Características Principales

-Audioguía Dinámica: Reproducción de historias mediante síntesis de voz con resaltado de texto en tiempo real.
-Mapas Interactivos: Visualización de rutas con polilíneas y marcadores personalizados.
-Generación de Informes: Exportación de los detalles del tour a PDF con imágenes de portada.
-Gestión de Perfiles: Personalización de usuario y carga de avatares mediante almacenamiento en la nube.
-Panel de Creador: Herramientas completas para añadir, editar y ordenar paradas en el mapa.
-Diseño Premium: Interfaz moderna basada en la paleta de colores Indigo & Violet.

-Stack TecnológicoCoreReact Native / Expo: Desarrollo de la aplicación móvil.
-TypeScript: Tipado estático para un código más robusto.
-Supabase: Base de datos (PostgreSQL), Autenticación y Storage para imágenes.
-Dependencias ClavePara que este proyecto funcione correctamente, se han utilizado las siguientes librerías:
  -LibreríaPropósito@supabase/supabase-jsCliente oficial para la comunicación con el Backend.
  -react-native-mapsVisualización de mapas de Google/Apple.expo-speechMotor de texto a voz para la audioguía.
  -expo-image-pickerAcceso a la galería para cambiar la foto de perfil.
  -expo-print & expo-sharingGeneración y compartición de archivos PDF.
  -@react-navigation/nativeGestión de la navegación entre pantallas.
  -react-native-safe-area-contextManejo de áreas seguras (notches/barras de sistema).

--Instalación y ConfiguraciónClonar el repositorio:Bashgit clone https://github.com/aleksandraMikayelyan/YourSevilleTourGuide.git

cd YourSevilleTourGuide
Instalar dependencias:Bashnpm install
# o si usas expo
npx expo install

Variables de Entorno:Crea un archivo .env o configura tu servicio de constantes con tus credenciales de Supabase:Code snippetSUPABASE_URL=tu_url_de_supabase

SUPABASE_ANON_KEY=tu_llave_anon_key

Ejecutar el proyecto:Bashnpx expo start
-- Capturas de Pantalla (Look & Feel)La aplicación utiliza un lenguaje de diseño moderno:Primario: Indigo (#4F46E5)Acento: Violeta (#7C3AED)Fondo: Soft Ice (#F0F2F9)📄 Estructura del ProyectoPlaintext

|── src/
│   ├── components/    # Componentes reutilizables
│   ├── screens/       # Pantallas (Mapa, Perfil, Formulario, Registro, Edicion, Pantalla principal)
│   ├── services/      # Configuración de Supabase
│   ├── utils/         # Utilidades (Generación de PDF, formateo)
├── App.tsx            # Navegador principal
└── package.json       # Listado de dependencias
