# Árbol de Navidad Interactivo de Lujo

Una experiencia inmersiva de árbol de Navidad en 3D de alta fidelidad con control de gestos manuales, ensamblaje dinámico de caos a orden y una estética lujosa en verde esmeralda y oro.

## Prompt Original

Gemini 3 en Google AI Studio y Claude 4.5 Sonnet en Cursor:

```
Configuración del personaje: Eres un experto en desarrollo creativo 3D con dominio de React 19, TypeScript y Three.js (R3F). Objetivo de la tarea: Construir una aplicación web 3D de alta fidelidad llamada "Árbol de Navidad Interactivo de Lujo". El estilo visual debe presentar una sensación de lujo "estilo Trump", con tonos principales de verde esmeralda profundo y oro brillante, acompañados de efectos de brillo cinematográficos. Stack tecnológico: React 19, TypeScript, React Three Fiber, Drei, Postprocessing, Tailwind CSS.
Lógica y arquitectura principal: Máquina de estados: Incluye dos estados, CHAOS (caos disperso) y FORMED (agregado en árbol), con deformación dinámica entre ambos. Sistema de posición dual (Dual-Position System): Todos los elementos (agujas, decoraciones) deben tener asignadas dos coordenadas al inicializarse: ChaosPosition: Coordenadas aleatorias dentro de un espacio esférico. TargetPosition: Coordenadas del objetivo que forman la forma cónica del árbol.
Interpolación entre ambas (Lerp) en useFrame según el progreso. Detalles de implementación específicos: Sistema de follaje (Foliage): Uso de THREE.Points y ShaderMaterial personalizado para renderizar una gran cantidad de partículas. Decoraciones (Ornaments): Uso de InstancedMesh para optimizar el renderizado. Dividido en cajas de regalo de varios colores (pesadas), bolas de colores (ligeras), luces de adorno (muy ligeras), con diferentes pesos de empuje físico. Uso de Lerp para lograr una animación de retorno fluida. Procesamiento posterior: Activar el efecto Bloom (umbral 0.8, intensidad 1.2) para crear un "halo dorado".
Configuración de la escena: Posición de la cámara [0, 4, 20], usando luz ambiental HDRI Lobby.
Añadir muchas decoraciones de fotos estilo polaroid.
Usar la imagen de la cámara para detectar gestos: la mano abierta representa "unleash" (desatar), cerrar el puño vuelve al árbol de Navidad. El movimiento de la mano permite ajustar el ángulo de visión.
```

## Instalación

1. **Clonar el repositorio:**

   ```bash
   git clone <repository-url>
   cd grand-luxury-interactive-christmas-tree
   ```

2. **Instalar dependencias:**

   ```bash
   npm install
   ```

3. **Ejecutar el servidor de desarrollo:**

   ```bash
   npm run dev
   ```

   > Nota: El modo de desarrollo local utiliza localStorage para compartir (solo funciona en el mismo navegador).
   > Para compartir en la nube completamente, consulta el paso 4.

4. **Configurar Cloudflare (Opcional - para compartir en la nube):**

   - Sigue la guía detallada en `cloudflare-setup.md`.
   - Copia `env.example` a `.env.local` y rellena tus credenciales de Cloudflare.
   - Usa `npm run dev:vercel` para probar con el entorno completo de Vercel.

5. **Abrir tu navegador:**
   - Navega a `http://localhost:3010`.
   - Permite el acceso a la cámara para el control de gestos.
   - Haz clic en "Subir fotos" para cargar tus imágenes.

## Uso

### Carga de fotos y compartir

1. **Subir fotos:**

   - Haz clic en el botón "Subir fotos" para seleccionar hasta 22 imágenes.
   - Las fotos aparecerán como polaroids en el árbol de Navidad.

2. **Generar enlace para compartir:**

   - Después de subir las fotos, haz clic en "Generar enlace para compartir".
   - Espera 2-3 segundos para que se complete la subida.
   - Copia el enlace generado y compártelo con tus amigos.

3. **Ver fotos compartidas:**
   - Tus amigos pueden abrir el enlace compartido en cualquier navegador.
   - Las fotos se cargarán automáticamente en el árbol de Navidad.
   - No se requiere inicio de sesión ni instalación de aplicaciones.
   - Los enlaces caducan después de 30 días.

### Controles de gestos

1. **Posiciona tu mano** frente a la webcam (visible en la vista previa superior derecha).
2. **Mueve tu mano** para controlar el ángulo de la cámara:
   - Izquierda/Derecha: Rotación horizontal.
   - Arriba/Abajo: Inclinación vertical.
3. **Abre tu mano** (extiende todos los dedos): Activa el modo caos.
4. **Cierra el puño**: Restaura el árbol al modo formado.

### Controles de ratón

Cuando no se detecta ninguna mano, puedes:

- **Hacer clic y arrastrar** para rotar la vista.
- **Desplazarte (scroll)** para acercar/alejar el zoom.
- **Clic derecho y arrastrar** para desplazarte lateralmente (desactivado por defecto).

## Stack Tecnológico

### Frontend

- React 19 con TypeScript
- React Three Fiber (R3F) para renderizado 3D
- Three.js para gráficos WebGL
- @react-three/drei para ayudantes
- @react-three/postprocessing para efectos visuales
- MediaPipe para detección de gestos manuales
- Tailwind CSS para diseño

### Backend (Compartir fotos)

- Vercel Serverless Functions
- Cloudflare R2 (almacenamiento de objetos compatible con S3)
- Cloudflare KV (almacenamiento clave-valor)
- Cliente AWS SDK S3 para la integración con R2

### Características

- Control de gestos manuales mediante webcam
- Transiciones de estado dinámicas (CHAOS ↔ FORMED)
- Carga de fotos y posibilidad de compartir en la nube
- Enlaces de uso compartido temporales (caducidad de 30 días)
- Renderizado instanciado para mejorar el rendimiento
- Efectos de Bloom y postprocesamiento

## ¡Felices Fiestas!

¡Que tu código sea alegre y brillante! 
