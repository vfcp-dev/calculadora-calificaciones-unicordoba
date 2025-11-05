# 📊 Calculadora de Calificaciones - Universidad de Córdoba

## Descripción

Sistema web de gestión académica que permite calcular calificaciones, predecir notas necesarias para aprobar y gestionar estudiantes de manera eficiente. Desarrollado específicamente para la Universidad de Córdoba.

![Universidad de Córdoba](https://aulasvirtuales.unicordoba.edu.co/pluginfile.php/1/theme_mb2nl/logo/1755638568/unicordoba_logo.png)

## ✨ Características Principales

- 🎓 **Gestión completa de estudiantes** (Agregar, editar, eliminar)
- 📊 **Cálculo automático de definitivas** con porcentajes configurables
- 🎯 **Predicción de notas necesarias** para alcanzar 2.96 y 5.0
- 💾 **Persistencia local** con LocalStorage
- 📁 **Importación/Exportación** de datos en formato CSV
- ✅ **Validaciones robustas** en tiempo real
- 📱 **Diseño responsive** para móviles y tablets
- 🎨 **Interfaz intuitiva** con colores institucionales

## 🚀 Instalación y Uso

### Requisitos
- Navegador web moderno (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- JavaScript habilitado
- Mínimo 5MB de LocalStorage disponible

### Instalación
1. Descarga todos los archivos del repositorio
2. Coloca los archivos en el mismo directorio
3. Abre `index.html` en tu navegador
4. ¡Listo! No requiere servidor web

### Uso Básico
1. **Configurar porcentajes**: Ve a "Configuración" y establece los porcentajes de cada corte
2. **Agregar estudiantes**: Usa el botón "Agregar Estudiante" o carga un archivo CSV
3. **Ver predicciones**: El sistema calcula automáticamente las notas necesarias
4. **Editar calificaciones**: Haz clic en cualquier estudiante para modificar sus datos

## 📁 Estructura del Proyecto

```
FDA/
├── index.html          # Página principal con estructura HTML
├── styles.css          # Estilos CSS con tema verde oscuro/blanco
├── script.js           # Lógica JavaScript completa
├── SRS.md             # Documentación técnica completa
└── README.md          # Este archivo
```

## 🎨 Diseño y Colores

- **Color Principal**: Verde Oscuro (#2d5a4b) - Tema institucional
- **Color Secundario**: Blanco (#ffffff)
- **Verde Éxito**: Estudiantes aprobados
- **Rojo Peligro**: Estudiantes reprobados
- **Gris Neutro**: Estados inalcanzables

## 📊 Formato CSV para Carga Masiva

```csv
Nombre,Código,Corte1,Corte2,Corte3
Juan Pérez,123456,4.5,3.8,0
María García,789012,3.2,4.0,3.5
Carlos López,345678,2.8,,
```

## ⚡ Funcionalidades Avanzadas

### Cálculos Automáticos
- **Definitiva**: `(Corte1 × %1) + (Corte2 × %2) + (Corte3 × %3)`
- **Nota Necesaria**: `(Objetivo - Acumulado) × 100 / PorcentajeRestante`

### Validaciones
- ❌ No permite notas negativas (convierte a 0)
- ⚠️ Limita notas máximas a 5.0
- 🔒 Códigos únicos por estudiante
- ✅ Porcentajes deben sumar exactamente 100%
- 🚫 Identifica metas inalcanzables

### Estados del Estudiante
- 🟢 **Aprobado**: Definitiva ≥ 3.0
- 🔴 **Reprobado**: Definitiva < 3.0
- ⚪ **Inalcanzable**: Nota necesaria > 5.0
- 🟡 **En Progreso**: Cortes incompletos

## ⌨️ Atajos de Teclado

- `Ctrl + N`: Agregar nuevo estudiante
- `Ctrl + S`: Guardar datos
- `Ctrl + E`: Exportar datos
- `Escape`: Cerrar modal

## 🔧 Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos responsive con CSS Grid y Flexbox
- **JavaScript ES6+**: Lógica de aplicación con clases y módulos
- **LocalStorage**: Persistencia de datos local
- **File API**: Manejo de archivos CSV

## 📱 Compatibilidad

| Navegador | Versión Mínima | Estado |
|-----------|----------------|--------|
| Chrome    | 60+           | ✅ Soportado |
| Firefox   | 55+           | ✅ Soportado |
| Safari    | 12+           | ✅ Soportado |
| Edge      | 79+           | ✅ Soportado |
| IE        | Cualquiera    | ❌ No soportado |

## 📖 Documentación

- **Manual de Usuario**: Disponible en la sección "Ayuda" de la aplicación
- **Manual Técnico**: Documentación completa en `SRS.md` y en la aplicación
- **API de Referencia**: Funciones documentadas en el código JavaScript

## 🚀 Futuras Mejoras

- [ ] Sincronización con servicios en la nube
- [ ] Reportes gráficos y estadísticas
- [ ] Gestión de múltiples materias
- [ ] PWA (Progressive Web App)
- [ ] Integración con sistemas académicos
- [ ] Notificaciones automáticas

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Sistema de Calculadora de Calificaciones**
- Desarrollado para Universidad de Córdoba
- Versión: 1.0
- Fecha: Noviembre 2025

---

## 💡 Soporte

Si necesitas ayuda o tienes preguntas:

1. Consulta la documentación en la sección "Ayuda" de la aplicación
2. Revisa el archivo `SRS.md` para detalles técnicos
3. Abre un issue en este repositorio

---

**¡Gracias por usar la Calculadora de Calificaciones de la Universidad de Córdoba!** 🎓