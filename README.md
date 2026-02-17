# TOURAPP: AUDIOGUÍAS INTELIGENTES

TourApp es una solución móvil avanzada de turismo inteligente diseñada para permitir a los usuarios la creación, gestión y exploración de rutas turísticas personalizadas. El sistema integra la infraestructura de **Supabase** para el manejo de datos y autenticación, **Google Maps API** para la geolocalización y navegación, y tecnología **Text-to-Speech** para ofrecer una experiencia de audioguía inmersiva y automatizada.

---

## CARACTERÍSTICAS PRINCIPALES

* **Audioguía Dinámica**
  Reproducción de narrativas históricas mediante síntesis de voz, sincronizada con el resaltado de texto en tiempo real para mejorar la accesibilidad y la retención.

* **Mapas e Interfaz Geográfica**
  Visualización avanzada de rutas mediante polilíneas dinámicas y marcadores personalizados para una navegación intuitiva en el destino.

* **Sistema de Documentación**
  Motor de exportación que transforma los detalles del tour en documentos PDF profesionales, incluyendo imágenes de portada y metadatos del trayecto.

* **Gestión de Identidad**
  Perfiles de usuario personalizados con carga de avatares integrada mediante almacenamiento de objetos en la nube.

* **Panel de Administración del Creador**
  Suite de herramientas dedicada a la curaduría de contenido, permitiendo añadir, editar y reordenar paradas geográficas con precisión.

* **Arquitectura de Diseño Premium**
  Interfaz de usuario de alta fidelidad centrada en la experiencia de uso, implementada con una paleta cromática Indigo & Violet.

---

## STACK TECNOLÓGICO

### Núcleo del Sistema
* **React Native / Expo**: Entorno de desarrollo para despliegue multiplataforma.
* **TypeScript**: Implementación de tipado estático para garantizar la integridad y escalabilidad del código.
* **Supabase**: Arquitectura Backend-as-a-Service basada en PostgreSQL, incluyendo sistemas de Autenticación y Storage.

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
