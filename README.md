# Olé Sevilla: Aplicación De Gestion Turistica

**Olé Sevilla** es una solución móvil avanzada de turismo inteligente diseñada para permitir a los usuarios la creación, gestión y exploración de rutas turísticas personalizadas en el corazón de Andalucía. El sistema integra la infraestructura de **Supabase** para el manejo de datos, **Rasa Open Source** para la asistencia por IA y tecnología **Text-to-Speech** para ofrecer una experiencia de audioguía inmersiva y automatizada.

---

##  CARACTERÍSTICAS PRINCIPALES

* **Asistente Virtual con IA (Rasa)**
  Integración de un chatbot inteligente capaz de guiar al usuario por el **Real Alcázar**, **Santa Cruz** y el **Río**, resolviendo dudas sobre itinerarios y tarifas en tiempo real.

* **Audioguía Dinámica**
  Reproducción de narrativas históricas mediante síntesis de voz, sincronizada con el resaltado de texto para mejorar la accesibilidad durante el recorrido.

* **Mapas e Interfaz Geográfica**
  Visualización avanzada de rutas mediante marcadores personalizados y navegación intuitiva a través de `TourMapScreen`.

* **Sistema de Documentación PDF**
  Motor de exportación que transforma los detalles del tour en documentos PDF profesionales mediante `PdfUtils`, incluyendo metadatos del trayecto.

* **Gestión de Identidad y Perfiles**
  Sistema robusto de autenticación y perfiles de usuario personalizados con almacenamiento en la nube vía **Supabase**.

* **Panel de Administración del Creador**
  Suite de herramientas (`EditStopsScreen`) para la curaduría de contenido, permitiendo añadir, editar y reordenar paradas geográficas con precisión.

---

## STACK TECNOLÓGICO

### Núcleo del Sistema
| Componente | Tecnología |
| :--- | :--- |
| **Frontend** | React Native + Expo (TypeScript) |
| **IA Backend** | Rasa Open Source |
| **Base de Datos** | Supabase |
| **Identidad** | Logo personalizado "Olé Sevilla" |

### Interfaz y Diseño
* **Identidad Visual**: Paleta cromática optimizada y branding personalizado bajo la marca **Olé Sevilla**.
* **Navegación**: Menú lateral dinámico (`ChatDrawer`) para una experiencia de usuario fluida.

---

## GUÍA DE DESPLIEGUE RÁPIDO

1. **Dependencias**: `npm install`
2. **Servidor IA**: 
   ```bash
   cd rasa-pro-iesVelazquez && rasa run --enable-api --cors "*"
   ```

### Dependencias de Infraestructura
| Librería | Propósito Técnico |
| :--- | :--- |
| **@supabase/supabase-js** | Cliente de integración para operaciones CRUD y autenticación. |
| **react-native-maps** | Motor de renderizado de mapas y gestión de capas geográficas. |
| **expo-speech** | Implementación del motor de síntesis de voz. |
| **expo-image-picker** | Gestión de acceso a activos multimedia del dispositivo. |
| **expo-print & expo-sharing** | Pipeline de generación y distribución de archivos PDF. |
| **@react-navigation/native** | Gestión del ciclo de vida de la navegación y el stack de pantallas. |
| **react-native-safe-area-context** | Control de diseño responsivo sobre áreas seguras de hardware. |

---

## INSTALACIÓN Y CONFIGURACIÓN

### 1. Clonación del Repositorio
```bash
git clone [https://github.com/aleksandraMikayelyan/YourSevilleTourGuide.git](https://github.com/aleksandraMikayelyan/YourSevilleTourGuide.git)
cd YourSevilleTourGuide
````
**###2. Gestión de Dependencias**
npm install
# Alternativa para entornos Expo:
npx expo install

**###3. Configuración de Variables de Entorno**
SUPABASE_URL=su_url_de_instancia
SUPABASE_ANON_KEY=su_llave_anon_key

**##4. Ejecución en Desarrollo**
npx expo start
---


## LENGUAJE VISUAL (LOOK & FEEL)
* **La interfaz se rige por estándares modernos de diseño visual:**

* **Color Primario: Indigo (#4F46E5)**

* **Color de Acento: Violeta (#7C3AED)**

* **Color de Fondo: Soft Ice (#F0F2F9)**


###  Arquitectura de Directorios

| Directorio / Archivo | Propósito Técnico |
| :--- | :--- |
| **src/components/** | Módulos de interfaz reutilizables y átomos de UI. |
| **src/screens/** | Controladores de vista principal (Mapa, Perfil, Formularios). |
| **src/services/** | Capa de abstracción para lógica de Supabase y servicios externos. |
| **src/utils/** | Funciones de soporte para procesamiento de PDF y formateo de datos. |
| **App.tsx** | Punto de entrada, configuración de Providers y navegación raíz. |
| **package.json** | Manifiesto de dependencias, scripts de entorno y configuración. |
