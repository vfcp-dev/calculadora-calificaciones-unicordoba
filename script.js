// ==========================================
// CALCULADORA DE CALIFICACIONES
// Sistema de gestión académica para Universidad de Córdoba
// ==========================================

class CalculadoraCalificaciones {
    constructor() {
        this.estudiantes = [];
        this.porcentajes = {
            corte1: 30,
            corte2: 30,
            corte3: 40
        };
        this.init();
    }

    // ==========================================
    // INICIALIZACIÓN DEL SISTEMA
    // ==========================================
    init() {
        this.cargarDatos();
        this.configurarEventListeners();
        this.cambiarSeccion('estudiantes');
        this.renderizarEstudiantes();
        this.actualizarPorcentajes();
    }

    // ==========================================
    // GESTIÓN DE DATOS (LOCALSTORAGE)
    // ==========================================
    cargarDatos() {
        try {
            const datosEstudiantes = localStorage.getItem('estudiantes');
            const datosPorcentajes = localStorage.getItem('porcentajes');
            
            if (datosEstudiantes) {
                this.estudiantes = JSON.parse(datosEstudiantes);
            }
            
            if (datosPorcentajes) {
                this.porcentajes = JSON.parse(datosPorcentajes);
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
            this.mostrarToast('Error al cargar datos guardados', 'error');
        }
    }

    guardarDatos() {
        try {
            localStorage.setItem('estudiantes', JSON.stringify(this.estudiantes));
            localStorage.setItem('porcentajes', JSON.stringify(this.porcentajes));
        } catch (error) {
            console.error('Error al guardar datos:', error);
            this.mostrarToast('Error al guardar datos', 'error');
        }
    }

    // ==========================================
    // CONFIGURACIÓN DE EVENT LISTENERS
    // ==========================================
    configurarEventListeners() {
        // Navegación entre secciones
        document.getElementById('btn-estudiantes').addEventListener('click', () => this.cambiarSeccion('estudiantes'));
        document.getElementById('btn-configuracion').addEventListener('click', () => this.cambiarSeccion('configuracion'));
        document.getElementById('btn-ayuda').addEventListener('click', () => this.cambiarSeccion('ayuda'));

        // Navegación de ayuda
        document.querySelectorAll('.help-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => this.cambiarSeccionAyuda(btn.dataset.section));
        });

        // Modal de estudiante
        document.getElementById('btn-agregar-estudiante').addEventListener('click', () => this.abrirModalEstudiante());
        document.getElementById('form-estudiante').addEventListener('submit', (e) => this.guardarEstudiante(e));
        document.getElementById('btn-cancelar').addEventListener('click', () => this.cerrarModal());

        // Configuración de porcentajes
        document.getElementById('form-porcentajes').addEventListener('submit', (e) => this.guardarPorcentajes(e));
        document.querySelectorAll('#form-porcentajes input').forEach(input => {
            input.addEventListener('input', () => this.validarPorcentajes());
        });

        // Carga de archivos
        document.getElementById('btn-cargar-archivo').addEventListener('click', () => {
            document.getElementById('archivo-estudiantes').click();
        });
        document.getElementById('archivo-estudiantes').addEventListener('change', (e) => this.cargarArchivo(e));

        // Acciones de configuración
        document.getElementById('btn-exportar').addEventListener('click', () => this.exportarDatos());
        document.getElementById('btn-limpiar-datos').addEventListener('click', () => this.limpiarDatos());

        // Cerrar modal
        document.querySelector('.close').addEventListener('click', () => this.cerrarModal());
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.cerrarModal();
            }
        });

        // Validación en tiempo real de formularios
        this.configurarValidacionFormularios();
    }

    // ==========================================
    // NAVEGACIÓN ENTRE SECCIONES
    // ==========================================
    cambiarSeccion(seccion) {
        // Ocultar todas las secciones
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

        // Mostrar sección seleccionada
        document.getElementById(`seccion-${seccion}`).classList.add('active');
        document.getElementById(`btn-${seccion}`).classList.add('active');

        // Acciones específicas por sección
        if (seccion === 'estudiantes') {
            this.renderizarEstudiantes();
        } else if (seccion === 'configuracion') {
            this.actualizarPorcentajes();
        } else if (seccion === 'ayuda') {
            // Mostrar la primera subsección de ayuda por defecto
            this.cambiarSeccionAyuda('guia-rapida');
        }
    }

    cambiarSeccionAyuda(subseccion) {
        // Ocultar todas las subsecciones de ayuda
        document.querySelectorAll('.help-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.help-nav-btn').forEach(btn => btn.classList.remove('active'));

        // Mostrar subsección seleccionada
        document.getElementById(`help-${subseccion}`).classList.add('active');
        document.querySelector(`[data-section="${subseccion}"]`).classList.add('active');
    }

    // ==========================================
    // GESTIÓN DE ESTUDIANTES
    // ==========================================
    abrirModalEstudiante(estudiante = null) {
        const modal = document.getElementById('modal-estudiante');
        const titulo = document.getElementById('modal-titulo');
        const form = document.getElementById('form-estudiante');

        if (estudiante) {
            titulo.textContent = 'Editar Estudiante';
            this.llenarFormularioEstudiante(estudiante);
            form.dataset.estudianteId = estudiante.id;
        } else {
            titulo.textContent = 'Agregar Estudiante';
            form.reset();
            delete form.dataset.estudianteId;
        }

        modal.style.display = 'block';
        document.getElementById('nombre-estudiante').focus();
    }

    llenarFormularioEstudiante(estudiante) {
        document.getElementById('nombre-estudiante').value = estudiante.nombre;
        document.getElementById('codigo-estudiante').value = estudiante.codigo;
        document.getElementById('corte1').value = estudiante.corte1 || '';
        document.getElementById('corte2').value = estudiante.corte2 || '';
        document.getElementById('corte3').value = estudiante.corte3 || '';
    }

    guardarEstudiante(e) {
        e.preventDefault();
        
        const form = e.target;
        const datos = new FormData(form);
        
        // Validar datos
        const nombre = datos.get('nombre-estudiante')?.trim();
        const codigo = datos.get('codigo-estudiante')?.trim();
        
        if (!this.validarDatosEstudiante(nombre, codigo, form.dataset.estudianteId)) {
            return;
        }

        const estudiante = {
            id: form.dataset.estudianteId || this.generarId(),
            nombre: nombre,
            codigo: codigo,
            corte1: this.validarNota(document.getElementById('corte1').value),
            corte2: this.validarNota(document.getElementById('corte2').value),
            corte3: this.validarNota(document.getElementById('corte3').value)
        };

        if (form.dataset.estudianteId) {
            // Editar estudiante existente
            const index = this.estudiantes.findIndex(e => e.id === form.dataset.estudianteId);
            this.estudiantes[index] = estudiante;
            this.mostrarToast('Estudiante actualizado correctamente', 'success');
        } else {
            // Agregar nuevo estudiante
            this.estudiantes.push(estudiante);
            this.mostrarToast('Estudiante agregado correctamente', 'success');
        }

        this.guardarDatos();
        this.renderizarEstudiantes();
        this.cerrarModal();
    }

    eliminarEstudiante(id) {
        if (confirm('¿Está seguro de que desea eliminar este estudiante?')) {
            this.estudiantes = this.estudiantes.filter(e => e.id !== id);
            this.guardarDatos();
            this.renderizarEstudiantes();
            this.mostrarToast('Estudiante eliminado correctamente', 'success');
        }
    }

    // ==========================================
    // CÁLCULOS ACADÉMICOS
    // ==========================================
    calcularDefinitiva(estudiante) {
        const { corte1, corte2, corte3 } = estudiante;
        const { corte1: p1, corte2: p2, corte3: p3 } = this.porcentajes;
        
        let definitiva = 0;
        let cortesCompletados = 0;

        if (corte1 !== null && corte1 !== undefined) {
            definitiva += (corte1 * p1) / 100;
            cortesCompletados++;
        }
        if (corte2 !== null && corte2 !== undefined) {
            definitiva += (corte2 * p2) / 100;
            cortesCompletados++;
        }
        if (corte3 !== null && corte3 !== undefined) {
            definitiva += (corte3 * p3) / 100;
            cortesCompletados++;
        }

        return { definitiva, cortesCompletados };
    }

    calcularNotaNecesaria(estudiante, objetivoNota) {
        const { corte1, corte2, corte3 } = estudiante;
        const { corte1: p1, corte2: p2, corte3: p3 } = this.porcentajes;
        
        let acumulado = 0;
        let porcentajeRestante = 0;

        // Calcular acumulado y porcentaje restante
        if (corte1 !== null && corte1 !== undefined) {
            acumulado += (corte1 * p1) / 100;
        } else {
            porcentajeRestante += p1;
        }

        if (corte2 !== null && corte2 !== undefined) {
            acumulado += (corte2 * p2) / 100;
        } else {
            porcentajeRestante += p2;
        }

        if (corte3 !== null && corte3 !== undefined) {
            acumulado += (corte3 * p3) / 100;
        } else {
            porcentajeRestante += p3;
        }

        if (porcentajeRestante === 0) {
            return null; // Todos los cortes están completos
        }

        const notaNecesaria = ((objetivoNota - acumulado) * 100) / porcentajeRestante;
        return Math.max(0, notaNecesaria);
    }

    determinarEstadoEstudiante(estudiante) {
        const { definitiva, cortesCompletados } = this.calcularDefinitiva(estudiante);
        
        if (cortesCompletados === 3) {
            return definitiva >= 3.0 ? 'aprobado' : 'reprobado';
        }

        // Verificar si puede alcanzar 3.0
        const notaNecesaria = this.calcularNotaNecesaria(estudiante, 3.0);
        
        if (notaNecesaria > 5.0) {
            return 'inalcanzable';
        } else if (definitiva >= 3.0) {
            return 'aprobado';
        } else {
            return 'en-progreso';
        }
    }

    // ==========================================
    // RENDERIZADO DE INTERFAZ
    // ==========================================
    renderizarEstudiantes() {
        const container = document.getElementById('lista-estudiantes');
        
        if (this.estudiantes.length === 0) {
            container.innerHTML = `
                <div class="no-estudiantes">
                    <h3>No hay estudiantes registrados</h3>
                    <p>Haga clic en "Agregar Estudiante" para comenzar</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.estudiantes.map(estudiante => this.crearCardEstudiante(estudiante)).join('');
    }

    crearCardEstudiante(estudiante) {
        const { definitiva, cortesCompletados } = this.calcularDefinitiva(estudiante);
        const estado = this.determinarEstadoEstudiante(estudiante);
        const notaPara296 = this.calcularNotaNecesaria(estudiante, 2.96);
        const notaPara50 = this.calcularNotaNecesaria(estudiante, 5.0);

        return `
            <div class="estudiante-card ${estado}" data-id="${estudiante.id}">
                <div class="estudiante-header">
                    <div class="estudiante-info">
                        <h3>${estudiante.nombre}</h3>
                        <div class="estudiante-codigo">Código: ${estudiante.codigo}</div>
                    </div>
                    <div class="estudiante-actions">
                        <button class="btn-icon" onclick="calculadora.abrirModalEstudiante(${JSON.stringify(estudiante).replace(/"/g, '&quot;')})" title="Editar">
                            ✏️
                        </button>
                        <button class="btn-icon delete" onclick="calculadora.eliminarEstudiante('${estudiante.id}')" title="Eliminar">
                            🗑️
                        </button>
                    </div>
                </div>

                <div class="cortes-info">
                    <div class="corte-item">
                        <div class="corte-label">Corte 1 (${this.porcentajes.corte1}%)</div>
                        <div class="corte-valor">${this.formatearNota(estudiante.corte1)}</div>
                    </div>
                    <div class="corte-item">
                        <div class="corte-label">Corte 2 (${this.porcentajes.corte2}%)</div>
                        <div class="corte-valor">${this.formatearNota(estudiante.corte2)}</div>
                    </div>
                    <div class="corte-item">
                        <div class="corte-label">Corte 3 (${this.porcentajes.corte3}%)</div>
                        <div class="corte-valor">${this.formatearNota(estudiante.corte3)}</div>
                    </div>
                </div>

                <div class="definitiva ${estado}">
                    ${cortesCompletados === 3 ? 'Definitiva' : 'Acumulado'}: ${definitiva.toFixed(2)}
                </div>

                ${this.generarPredicciones(estudiante, notaPara296, notaPara50, cortesCompletados)}
            </div>
        `;
    }

    generarPredicciones(estudiante, notaPara296, notaPara50, cortesCompletados) {
        if (cortesCompletados === 3) {
            return '<div class="predicciones">Todas las calificaciones registradas</div>';
        }

        let predicciones = '<div class="predicciones">';
        
        if (notaPara296 <= 5.0) {
            predicciones += `<div class="prediccion-item">📊 Para 2.96: ${notaPara296.toFixed(2)}</div>`;
        } else {
            predicciones += `<div class="prediccion-item">❌ 2.96 inalcanzable</div>`;
        }

        if (notaPara50 <= 5.0) {
            predicciones += `<div class="prediccion-item">🎯 Para 5.0: ${notaPara50.toFixed(2)}</div>`;
        } else {
            predicciones += `<div class="prediccion-item">❌ 5.0 inalcanzable</div>`;
        }

        predicciones += '</div>';
        return predicciones;
    }

    // ==========================================
    // CONFIGURACIÓN DE PORCENTAJES
    // ==========================================
    actualizarPorcentajes() {
        document.getElementById('porcentaje-corte1').value = this.porcentajes.corte1;
        document.getElementById('porcentaje-corte2').value = this.porcentajes.corte2;
        document.getElementById('porcentaje-corte3').value = this.porcentajes.corte3;
        this.validarPorcentajes();
    }

    validarPorcentajes() {
        const p1 = parseInt(document.getElementById('porcentaje-corte1').value) || 0;
        const p2 = parseInt(document.getElementById('porcentaje-corte2').value) || 0;
        const p3 = parseInt(document.getElementById('porcentaje-corte3').value) || 0;
        const total = p1 + p2 + p3;

        const totalElement = document.getElementById('total-porcentaje');
        totalElement.textContent = total;
        
        if (total === 100) {
            totalElement.style.color = 'var(--color-success)';
        } else {
            totalElement.style.color = 'var(--color-danger)';
        }

        return total === 100;
    }

    guardarPorcentajes(e) {
        e.preventDefault();
        
        if (!this.validarPorcentajes()) {
            this.mostrarToast('Los porcentajes deben sumar exactamente 100%', 'error');
            return;
        }

        this.porcentajes = {
            corte1: parseInt(document.getElementById('porcentaje-corte1').value),
            corte2: parseInt(document.getElementById('porcentaje-corte2').value),
            corte3: parseInt(document.getElementById('porcentaje-corte3').value)
        };

        this.guardarDatos();
        this.renderizarEstudiantes();
        this.mostrarToast('Porcentajes actualizados correctamente', 'success');
    }

    // ==========================================
    // CARGA Y EXPORTACIÓN DE ARCHIVOS
    // ==========================================
    cargarArchivo(e) {
        const archivo = e.target.files[0];
        if (!archivo) return;

        const extension = archivo.name.split('.').pop().toLowerCase();
        if (extension === 'csv' || extension === 'txt') {
            // Procesar como CSV
            const reader = new FileReader();
            reader.onload = (evento) => {
                try {
                    const contenido = evento.target.result;
                    const lineas = contenido.split('\n').filter(linea => linea.trim());
                    // Saltar la primera línea si es un encabezado
                    const datosLineas = lineas[0].toLowerCase().includes('nombre') ? lineas.slice(1) : lineas;
                    let estudiantesImportados = 0;
                    let errores = 0;
                    datosLineas.forEach(linea => {
                        const datos = linea.split(',').map(d => d.trim());
                        if (datos.length >= 2) {
                            try {
                                const estudiante = {
                                    id: this.generarId(),
                                    nombre: datos[0],
                                    codigo: datos[1],
                                    corte1: this.validarNota(datos[2]),
                                    corte2: this.validarNota(datos[3]),
                                    corte3: this.validarNota(datos[4])
                                };
                                if (!this.estudiantes.some(e => e.codigo === estudiante.codigo)) {
                                    this.estudiantes.push(estudiante);
                                    estudiantesImportados++;
                                }
                            } catch (error) {
                                errores++;
                            }
                        }
                    });
                    this.guardarDatos();
                    this.renderizarEstudiantes();
                    this.mostrarToast(`${estudiantesImportados} estudiantes importados. ${errores} errores.`, 'success');
                } catch (error) {
                    this.mostrarToast('Error al procesar el archivo', 'error');
                }
            };
            reader.readAsText(archivo);
            e.target.value = '';
        } else if (extension === 'xls' || extension === 'xlsx') {
            // Procesar como Excel
            const reader = new FileReader();
            reader.onload = (evento) => {
                try {
                    const data = new Uint8Array(evento.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    // Leer curso y grupo
                    const curso = XLSX.utils.encode_cell({ c: 0, r: 2 }); // A3
                    const grupo = XLSX.utils.encode_cell({ c: 2, r: 2 }); // C3
                    const nombreCurso = sheet[curso] ? (sheet[curso].v || '').toString().trim() : '';
                    const nombreGrupo = sheet[grupo] ? (sheet[grupo].v || '').toString().trim() : '';

                    // Buscar inicio del listado (A5)
                    let fila = 4; // Fila 5 (0-indexed)
                    let estudiantesImportados = 0;
                    let errores = 0;
                    while (true) {
                        const tipoDoc = sheet[XLSX.utils.encode_cell({ c: 0, r: fila })];
                        const numeroDoc = sheet[XLSX.utils.encode_cell({ c: 1, r: fila })];
                        const apellidosNombres = sheet[XLSX.utils.encode_cell({ c: 2, r: fila })];
                        // Columna 3: guion, Columna 4: correo
                        const correo = sheet[XLSX.utils.encode_cell({ c: 4, r: fila })];
                        if (!tipoDoc || !numeroDoc || !apellidosNombres) break; // Fin del listado
                        try {
                            const estudiante = {
                                id: this.generarId(),
                                nombre: (apellidosNombres.v || '').toString().trim(),
                                codigo: (numeroDoc.v || '').toString().trim(),
                                tipoDoc: (tipoDoc.v || '').toString().trim(),
                                correo: correo ? (correo.v || '').toString().trim() : '',
                                curso: nombreCurso,
                                grupo: nombreGrupo,
                                corte1: null,
                                corte2: null,
                                corte3: null
                            };
                            if (!this.estudiantes.some(e => e.codigo === estudiante.codigo)) {
                                this.estudiantes.push(estudiante);
                                estudiantesImportados++;
                            }
                        } catch (error) {
                            errores++;
                        }
                        fila++;
                    }
                    this.guardarDatos();
                    this.renderizarEstudiantes();
                    this.mostrarToast(`${estudiantesImportados} estudiantes importados de Excel. ${errores} errores.`, 'success');
                } catch (error) {
                    this.mostrarToast('Error al procesar el archivo Excel', 'error');
                }
            };
            reader.readAsArrayBuffer(archivo);
            e.target.value = '';
        } else {
            this.mostrarToast('Formato de archivo no soportado. Usa CSV, XLS o XLSX.', 'error');
        }
    }

    exportarDatos() {
        if (this.estudiantes.length === 0) {
            this.mostrarToast('No hay datos para exportar', 'warning');
            return;
        }

        const csv = [
            'Nombre,Código,Corte1,Corte2,Corte3,Definitiva,Estado',
            ...this.estudiantes.map(e => {
                const { definitiva } = this.calcularDefinitiva(e);
                const estado = this.determinarEstadoEstudiante(e);
                return `${e.nombre},${e.codigo},${e.corte1 || ''},${e.corte2 || ''},${e.corte3 || ''},${definitiva.toFixed(2)},${estado}`;
            })
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `calificaciones_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        this.mostrarToast('Datos exportados correctamente', 'success');
    }

    limpiarDatos() {
        if (confirm('¿Está seguro de que desea eliminar todos los datos? Esta acción no se puede deshacer.')) {
            this.estudiantes = [];
            this.guardarDatos();
            this.renderizarEstudiantes();
            this.mostrarToast('Todos los datos han sido eliminados', 'success');
        }
    }

    // ==========================================
    // VALIDACIONES
    // ==========================================
    validarDatosEstudiante(nombre, codigo, estudianteId) {
        if (!nombre || nombre.length < 2) {
            this.mostrarToast('El nombre debe tener al menos 2 caracteres', 'error');
            return false;
        }

        if (!codigo || codigo.length < 3) {
            this.mostrarToast('El código debe tener al menos 3 caracteres', 'error');
            return false;
        }

        // Verificar código duplicado
        const codigoExiste = this.estudiantes.some(e => 
            e.codigo === codigo && e.id !== estudianteId
        );
        
        if (codigoExiste) {
            this.mostrarToast('Ya existe un estudiante con este código', 'error');
            return false;
        }

        return true;
    }

    validarNota(valor) {
        if (!valor || valor === '') return null;
        
        const nota = parseFloat(valor);
        
        if (isNaN(nota)) return null;
        if (nota < 0) return 0;
        if (nota > 5) return 5;
        
        return Math.round(nota * 100) / 100; // Redondear a 2 decimales
    }

    configurarValidacionFormularios() {
        // Validación en tiempo real para notas
        document.querySelectorAll('#form-estudiante input[type="number"]').forEach(input => {
            input.addEventListener('input', (e) => {
                const valor = parseFloat(e.target.value);
                
                if (isNaN(valor)) return;
                
                if (valor < 0) {
                    e.target.setCustomValidity('La calificación no puede ser negativa');
                    e.target.classList.add('error');
                } else if (valor > 5) {
                    e.target.setCustomValidity('La calificación no puede ser mayor a 5.0');
                    e.target.classList.add('error');
                } else {
                    e.target.setCustomValidity('');
                    e.target.classList.remove('error');
                    e.target.classList.add('success');
                }
            });
        });

        // Validación para campos de texto
        document.querySelectorAll('#form-estudiante input[type="text"]').forEach(input => {
            input.addEventListener('input', (e) => {
                if (e.target.value.trim().length >= 2) {
                    e.target.classList.remove('error');
                    e.target.classList.add('success');
                } else {
                    e.target.classList.add('error');
                    e.target.classList.remove('success');
                }
            });
        });
    }

    // ==========================================
    // UTILIDADES
    // ==========================================
    generarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatearNota(nota) {
        return nota !== null && nota !== undefined ? nota.toFixed(2) : '-';
    }

    cerrarModal() {
        document.getElementById('modal-estudiante').style.display = 'none';
        document.getElementById('form-estudiante').reset();
        
        // Limpiar validaciones
        document.querySelectorAll('#form-estudiante input').forEach(input => {
            input.classList.remove('error', 'success');
            input.setCustomValidity('');
        });
    }

    mostrarToast(mensaje, tipo = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = mensaje;
        toast.className = `toast ${tipo}`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// ==========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ==========================================
let calculadora;

document.addEventListener('DOMContentLoaded', () => {
    calculadora = new CalculadoraCalificaciones();
});

// ==========================================
// MANEJO DE ERRORES GLOBALES
// ==========================================
window.addEventListener('error', (e) => {
    console.error('Error global:', e.error);
    if (calculadora) {
        calculadora.mostrarToast('Ha ocurrido un error inesperado', 'error');
    }
});

// ==========================================
// PREVENIR PÉRDIDA DE DATOS
// ==========================================
window.addEventListener('beforeunload', (e) => {
    if (calculadora && calculadora.estudiantes.length > 0) {
        calculadora.guardarDatos();
    }
});

// ==========================================
// ATAJOS DE TECLADO
// ==========================================
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'n':
                e.preventDefault();
                if (calculadora) calculadora.abrirModalEstudiante();
                break;
            case 's':
                e.preventDefault();
                if (calculadora) calculadora.guardarDatos();
                break;
            case 'e':
                e.preventDefault();
                if (calculadora) calculadora.exportarDatos();
                break;
        }
    }
    
    if (e.key === 'Escape') {
        if (calculadora) calculadora.cerrarModal();
    }
});

// ==========================================
// FUNCIONES DE UTILIDAD EXPORTADAS
// ==========================================
window.CalculadoraUtils = {
    validarNota: (valor) => {
        if (!valor || valor === '') return null;
        const nota = parseFloat(valor);
        if (isNaN(nota)) return null;
        if (nota < 0) return 0;
        if (nota > 5) return 5;
        return Math.round(nota * 100) / 100;
    },
    
    calcularPorcentaje: (valor, porcentaje) => {
        return (valor * porcentaje) / 100;
    },
    
    formatearNota: (nota) => {
        return nota !== null && nota !== undefined ? nota.toFixed(2) : '-';
    }
};