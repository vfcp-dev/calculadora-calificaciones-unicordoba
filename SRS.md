# SRS - Sistema de Calculadora de Calificaciones
## Universidad de Córdoba

### Versión: 1.0
### Fecha: Noviembre 2025

---

## 1. INTRODUCCIÓN

### 1.1 Propósito
Este documento especifica los requerimientos del Sistema de Calculadora de Calificaciones desarrollado para la Universidad de Córdoba. El sistema permite gestionar estudiantes, calcular calificaciones académicas y determinar las notas necesarias para alcanzar objetivos específicos.

### 1.2 Alcance
El sistema es una aplicación web que funciona completamente en el navegador, utilizando LocalStorage para persistencia de datos. No requiere servidor backend ni conexión a internet después de la carga inicial.

### 1.3 Definiciones y Acrónimos
- **SRS**: Software Requirements Specification
- **DOM**: Document Object Model
- **CSV**: Comma Separated Values
- **LocalStorage**: Almacenamiento local del navegador

---

## 2. DESCRIPCIÓN GENERAL

### 2.1 Perspectiva del Producto
Sistema web independiente para gestión académica básica, enfocado en el cálculo y predicción de calificaciones estudiantiles.

### 2.2 Funciones del Producto
- Gestión de estudiantes (CRUD)
- Configuración de porcentajes académicos
- Cálculo automático de definitivas
- Predicción de notas necesarias
- Importación/Exportación de datos
- Validaciones en tiempo real

### 2.3 Características de los Usuarios
- **Docentes**: Usuarios principales que gestionan calificaciones
- **Administradores académicos**: Configuran parámetros del sistema

### 2.4 Restricciones
- Funciona solo en navegadores modernos
- Límite de almacenamiento del LocalStorage (~5-10MB)
- Sin sincronización entre dispositivos

---

## 3. REQUERIMIENTOS ESPECÍFICOS

### 3.1 Requerimientos Funcionales

#### RF-001: Gestión de Estudiantes
- **Descripción**: El sistema debe permitir agregar, editar, eliminar y visualizar estudiantes
- **Entrada**: Nombre, código, calificaciones de cortes
- **Procesamiento**: Validación de datos, verificación de códigos únicos
- **Salida**: Lista de estudiantes con información académica

#### RF-002: Configuración de Porcentajes
- **Descripción**: Configurar porcentajes de cada corte académico
- **Entrada**: Porcentajes para corte 1, 2 y 3
- **Procesamiento**: Validación que sumen 100%
- **Salida**: Confirmación de guardado

#### RF-003: Cálculo de Definitivas
- **Descripción**: Calcular automáticamente la calificación definitiva
- **Entrada**: Calificaciones de cortes y porcentajes configurados
- **Procesamiento**: (Corte1 × %1) + (Corte2 × %2) + (Corte3 × %3)
- **Salida**: Calificación definitiva o acumulada

#### RF-004: Predicción de Notas
- **Descripción**: Calcular nota necesaria para alcanzar 2.96 y 5.0
- **Entrada**: Calificaciones existentes y objetivo deseado
- **Procesamiento**: (Objetivo - Acumulado) × 100 / PorcentajeRestante
- **Salida**: Nota requerida o "inalcanzable"

#### RF-005: Importación/Exportación
- **Descripción**: Cargar datos desde CSV y exportar resultados
- **Entrada**: Archivo CSV con formato específico
- **Procesamiento**: Parseo de datos, validación de formato
- **Salida**: Datos importados o archivo CSV exportado

### 3.2 Requerimientos No Funcionales

#### RNF-001: Usabilidad
- Interfaz intuitiva con navegación clara
- Tiempo de respuesta < 100ms para operaciones locales
- Mensajes de retroalimentación inmediata

#### RNF-002: Confiabilidad
- Validación robusta de datos de entrada
- Manejo de errores con mensajes informativos
- Persistencia automática de datos

#### RNF-003: Rendimiento
- Carga inicial < 3 segundos
- Soporte para hasta 500 estudiantes sin degradación
- Uso eficiente de memoria del navegador

#### RNF-004: Seguridad
- Validación de datos en el frontend
- Sanitización de entradas de usuario
- No almacenamiento de datos sensibles

---

## 4. ARQUITECTURA DEL SISTEMA

### 4.1 Estructura de Archivos
```
/FDA/
├── index.html          # Estructura principal
├── styles.css          # Estilos y diseño
├── script.js           # Lógica de aplicación
└── SRS.md             # Este documento
```

### 4.2 Patrones de Diseño
- **Singleton**: Clase CalculadoraCalificaciones única
- **MVC**: Separación de vista, modelo y controlador
- **Observer**: Event listeners para interacciones

### 4.3 Persistencia de Datos
```javascript
// Estructura en LocalStorage
{
  "estudiantes": [
    {
      "id": "string",
      "nombre": "string", 
      "codigo": "string",
      "corte1": number|null,
      "corte2": number|null,
      "corte3": number|null
    }
  ],
  "porcentajes": {
    "corte1": number,
    "corte2": number,
    "corte3": number
  }
}
```

---

## 5. EXPLICACIÓN DEL CÓDIGO

### 5.1 Clase Principal (script.js)

#### Constructor y Inicialización
```javascript
constructor() {
    this.estudiantes = [];      // Array de estudiantes
    this.porcentajes = {        // Configuración de cortes
        corte1: 30, corte2: 30, corte3: 40
    };
    this.init();               // Inicialización del sistema
}
```

#### Gestión de Datos (LocalStorage)
```javascript
cargarDatos() {
    // Carga datos persistentes del navegador
    // Maneja errores de parsing JSON
}

guardarDatos() {
    // Persiste estado actual en LocalStorage
    // Manejo de errores de quota excedida
}
```

#### Event Listeners
```javascript
configurarEventListeners() {
    // Navegación entre secciones
    // Formularios y validación
    // Carga de archivos
    // Atajos de teclado
}
```

### 5.2 Cálculos Académicos

#### Cálculo de Definitiva
```javascript
calcularDefinitiva(estudiante) {
    // Suma ponderada: Σ(nota × porcentaje)
    // Maneja cortes incompletos
    // Retorna definitiva y cortes completados
}
```

#### Predicción de Notas
```javascript
calcularNotaNecesaria(estudiante, objetivoNota) {
    // Fórmula: (Objetivo - Acumulado) × 100 / PorcentajeRestante
    // Validación de rangos (0-5.0)
    // Identificación de metas inalcanzables
}
```

### 5.3 Validaciones

#### Validación de Notas
```javascript
validarNota(valor) {
    // Conversión a número
    // Rango 0-5.0
    // Redondeo a 2 decimales
    // Manejo de valores nulos
}
```

#### Validación de Estudiantes
```javascript
validarDatosEstudiante(nombre, codigo, id) {
    // Longitud mínima de campos
    // Unicidad de códigos
    // Caracteres válidos
}
```

### 5.4 Interfaz de Usuario

#### Renderizado Dinámico
```javascript
renderizarEstudiantes() {
    // Generación de HTML dinámico
    // Estado visual según calificaciones
    // Event binding para acciones
}
```

#### Sistema de Notificaciones
```javascript
mostrarToast(mensaje, tipo) {
    // Feedback visual inmediato
    // Tipos: success, error, warning, info
    // Auto-ocultación temporal
}
```

---

## 6. FLUJO DE NAVEGACIÓN

### 6.1 Sección Estudiantes (Principal)
```
Inicio → Lista de Estudiantes
  ├── [Agregar] → Modal Formulario → Validación → Guardar → Lista
  ├── [Editar] → Modal Formulario (pre-lleno) → Actualizar → Lista  
  ├── [Eliminar] → Confirmación → Eliminar → Lista
  └── [Ver Predicciones] → Cálculos automáticos mostrados en card
```

### 6.2 Sección Configuración
```
Configuración
  ├── Porcentajes → Validación suma 100% → Guardar → Recálculo
  ├── Carga CSV → Validación formato → Importar → Lista actualizada
  ├── Exportar → Generar CSV → Descarga
  └── Limpiar → Confirmación → Borrar todo → Lista vacía
```

### 6.3 Sección Ayuda
```
Ayuda → Documentación estática
  ├── Instrucciones de uso
  ├── Interpretación de colores  
  ├── Formato de archivo CSV
  └── Atajos de teclado
```

---

## 7. VALIDACIONES IMPLEMENTADAS

### 7.1 Validaciones de Entrada

#### Campos de Estudiante
- **Nombre**: Mínimo 2 caracteres, no vacío
- **Código**: Mínimo 3 caracteres, único en el sistema
- **Calificaciones**: Rango 0-5.0, máximo 2 decimales

#### Campos de Configuración
- **Porcentajes**: Números enteros, suma exacta de 100%
- **Archivos**: Formato CSV válido, estructura correcta

### 7.2 Validaciones de Negocio

#### Cálculos Académicos
- **Notas negativas**: Automáticamente convertidas a 0
- **Notas > 5.0**: Automáticamente limitadas a 5.0
- **Divisiones por cero**: Manejadas en cálculos de porcentajes
- **Metas inalcanzables**: Identificadas y marcadas visualmente

#### Duplicación de Datos
- **Códigos únicos**: No se permiten códigos duplicados
- **Importación**: Ignora estudiantes con códigos existentes

### 7.3 Validaciones de Interfaz

#### Formularios en Tiempo Real
```javascript
input.addEventListener('input', (e) => {
    // Validación inmediata mientras se escribe
    // Feedback visual con colores
    // Mensajes de error específicos
});
```

#### Estados Visuales
- **Verde**: Datos válidos y correctos
- **Rojo**: Errores que requieren corrección
- **Gris**: Estados neutros o inalcanzables

---

## 8. APLICACIÓN DE ESTILOS

### 8.1 Paleta de Colores

#### Colores Principales
```css
:root {
    --color-primary: #2d5a4b;        /* Verde oscuro */
    --color-primary-light: #3d6b5c;  /* Verde medio */
    --color-primary-dark: #1d4a3b;   /* Verde muy oscuro */
    --color-secondary: #ffffff;      /* Blanco */
}
```

#### Colores de Estado
```css
--color-success: #28a745;    /* Verde para aprobados */
--color-danger: #dc3545;     /* Rojo para reprobados */
--color-warning: #ffc107;    /* Amarillo para advertencias */
--color-gray: #6c757d;       /* Gris para neutro/inalcanzable */
```

### 8.2 Tipografía y Espaciado
```css
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
line-height: 1.6;
--border-radius: 8px;
--box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
```

### 8.3 Componentes de Interfaz

#### Cards de Estudiantes
- **Borde izquierdo**: Color según estado académico
- **Hover effect**: Elevación con sombra
- **Grid responsive**: Adaptable a diferentes tamaños de pantalla

#### Sistema de Navegación
- **Tabs horizontales**: Navegación clara entre secciones
- **Estado activo**: Indicador visual con borde inferior
- **Responsive**: Colapsa verticalmente en móviles

#### Modales y Formularios
- **Backdrop blur**: Efecto de desenfoque en fondo
- **Animaciones**: Aparición suave con CSS transitions
- **Validación visual**: Colores en tiempo real para campos

### 8.4 Responsive Design

#### Breakpoints
```css
@media (max-width: 768px) {
    /* Tablet y móvil */
    .estudiantes-grid { grid-template-columns: 1fr; }
    .nav-menu { flex-direction: column; }
}

@media (max-width: 480px) {
    /* Móvil pequeño */
    .btn { padding: 10px 16px; font-size: 0.9rem; }
}
```

#### Adaptaciones Móviles
- **Grid fluido**: Cards apilados en una columna
- **Navegación vertical**: Menú adaptado para toque
- **Botones más grandes**: Optimizados para dedos
- **Modales fullscreen**: En pantallas muy pequeñas

---

## 9. CASOS DE USO PRINCIPALES

### 9.1 Agregar Nuevo Estudiante
```
Actor: Docente
Precondición: Sistema iniciado
Flujo:
1. Click en "Agregar Estudiante"
2. Modal se abre
3. Llenar formulario (nombre, código, calificaciones opcionales)
4. Sistema valida datos en tiempo real
5. Click "Guardar"
6. Sistema valida unicidad del código
7. Estudiante se agrega a la lista
8. Modal se cierra
9. Lista se actualiza automáticamente
Postcondición: Estudiante visible en lista principal
```

### 9.2 Calcular Nota Necesaria
```
Actor: Docente
Precondición: Estudiante con al menos un corte registrado
Flujo:
1. Sistema calcula automáticamente al mostrar estudiante
2. Muestra nota necesaria para 2.96 y 5.0
3. Si es inalcanzable, muestra mensaje específico
4. Actualización automática al editar calificaciones
Postcondición: Información predictiva visible
```

### 9.3 Configurar Porcentajes
```
Actor: Administrador académico
Precondición: Acceso a sección configuración
Flujo:
1. Navegar a "Configuración"
2. Modificar porcentajes de cortes
3. Sistema valida suma = 100% en tiempo real
4. Click "Guardar Configuración"
5. Sistema actualiza cálculos existentes
6. Mensaje de confirmación
Postcondición: Todos los cálculos usan nuevos porcentajes
```

---

## 10. MANEJO DE ERRORES

### 10.1 Errores de Usuario
- **Campos vacíos**: Resaltado visual y mensaje específico
- **Notas inválidas**: Corrección automática con notificación
- **Código duplicado**: Mensaje de error y prevención de guardado

### 10.2 Errores de Sistema
- **LocalStorage lleno**: Mensaje informativo y sugerencias
- **Archivo CSV corrupto**: Validación y reporte de líneas problemáticas
- **JavaScript deshabilitado**: Mensaje de compatibilidad

### 10.3 Recuperación de Errores
- **Auto-guardado**: Previene pérdida de datos
- **Validación preventiva**: Evita estados inválidos
- **Mensajes informativos**: Guían al usuario hacia la solución

---

## 11. TESTING Y VALIDACIÓN

### 11.1 Casos de Prueba

#### Funcionalidad Básica
- ✅ Agregar estudiante con datos válidos
- ✅ Editar calificaciones existentes
- ✅ Eliminar estudiante con confirmación
- ✅ Configurar porcentajes que sumen 100%

#### Validaciones
- ✅ Rechazar notas negativas
- ✅ Limitar notas a máximo 5.0
- ✅ Prevenir códigos duplicados
- ✅ Validar formato de archivo CSV

#### Cálculos
- ✅ Definitiva con todos los cortes
- ✅ Acumulado con cortes parciales
- ✅ Predicción para nota objetivo
- ✅ Identificación de metas inalcanzables

### 11.2 Navegadores Compatibles
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

---

## 12. INSTALACIÓN Y DEPLOYMENT

### 12.1 Requisitos del Sistema
- Navegador web moderno
- JavaScript habilitado
- Mínimo 5MB espacio de LocalStorage disponible

### 12.2 Instalación
1. Descargar archivos: `index.html`, `styles.css`, `script.js`
2. Colocar en mismo directorio
3. Abrir `index.html` en navegador
4. No requiere servidor web (funciona con protocolo file://)

### 12.3 Configuración Inicial
- Sistema inicia con porcentajes por defecto (30%, 30%, 40%)
- Lista de estudiantes vacía
- Todas las funcionalidades disponibles inmediatamente

---

## 13. MANTENIMIENTO Y EXTENSIONES

### 13.1 Futuras Mejoras
- Sincronización con servicios en la nube
- Reportes gráficos y estadísticas
- Gestión de múltiples materias
- Integración con sistemas académicos existentes

### 13.2 Escalabilidad
- Migración a base de datos real
- API REST para operaciones remotas
- Autenticación y autorización de usuarios
- Versionado de datos y respaldos automáticos

---

**Documento generado para Universidad de Córdoba**  
**Sistema de Calculadora de Calificaciones v1.0**  
**Noviembre 2025**