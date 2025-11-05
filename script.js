// ==========================================
// CALCULADORA DE CALIFICACIONES
// Sistema de gestión académica para Universidad de Córdoba
// ==========================================

class CalculadoraCalificaciones {
    constructor() {
        this.estudiantes = [];
        this.porcentajes = {
            corte1: 33,
            corte2: 33,
            corte3: 34
        };
        this.configuracion = {
            notaAprobacion: 3.0,
            decimales: 2,
            temaOscuro: false,
            autoGuardado: true,
            vistaDefecto: 'list',
            notificarRiesgo: true
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
    // GESTIÓN DE DATOS Y CONFIGURACIÓN
    // ==========================================
    
    aplicarConfiguracion() {
        // Aplicar tema
        document.body.classList.toggle('tema-oscuro', this.configuracion.temaOscuro);
        
        // Aplicar vista por defecto
        const filtroVista = document.getElementById('filtro-vista-estudiantes');
        if (filtroVista) {
            filtroVista.value = this.configuracion.vistaDefecto;
        }
        
        // Actualizar elementos de configuración
        document.getElementById('nota-aprobacion').value = this.configuracion.notaAprobacion;
        document.getElementById('decimales').value = this.configuracion.decimales;
        document.getElementById('auto-guardado').checked = this.configuracion.autoGuardado;
        document.getElementById('notificar-riesgo').checked = this.configuracion.notificarRiesgo;
    }
    
    guardarConfiguracion() {
        try {
            localStorage.setItem('configuracion', JSON.stringify(this.configuracion));
            this.mostrarToast('Configuración guardada correctamente', 'success');
        } catch (error) {
            console.error('Error al guardar configuración:', error);
            this.mostrarToast('Error al guardar la configuración', 'error');
        }
    }

    cargarConfiguracion() {
        try {
            const configGuardada = localStorage.getItem('configuracion');
            if (configGuardada) {
                this.configuracion = { ...this.configuracion, ...JSON.parse(configGuardada) };
            }
            this.aplicarConfiguracion();
        } catch (error) {
            console.error('Error al cargar configuración:', error);
        }
    }

    verificarEstudiantesRiesgo() {
        if (!this.configuracion.notificarRiesgo) return;

        this.estudiantes.forEach(estudiante => {
            const { definitiva } = this.calcularDefinitiva(estudiante);
            const estado = this.determinarEstadoEstudiante(estudiante);
            
            if (estado === 'reprobado' || (estado === 'en-progreso' && definitiva < 2.0)) {
                this.mostrarToast(
                    `¡Alerta! ${estudiante.nombre} está en riesgo académico`,
                    'warning'
                );
            }
        });
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
        document.getElementById('btn-configuracion').addEventListener('click', () => {
            this.cambiarSeccion('configuracion');
            this.actualizarInfoSistema();
        });
        document.getElementById('btn-ayuda').addEventListener('click', () => this.cambiarSeccion('ayuda'));

        // Configuración de respaldos
        document.getElementById('btn-backup').addEventListener('click', () => this.crearRespaldo());
        
        // Drop zone para archivos
        const dropZone = document.getElementById('drop-zone');
        if (dropZone) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
            });

            dropZone.addEventListener('dragenter', () => dropZone.classList.add('drag-over'));
            dropZone.addEventListener('dragover', () => dropZone.classList.add('drag-over'));
            dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
            dropZone.addEventListener('drop', () => dropZone.classList.remove('drag-over'));
            
            dropZone.addEventListener('drop', (e) => {
                const files = e.dataTransfer.files;
                if (files.length) {
                    document.getElementById('archivo-estudiantes').files = files;
                    this.mostrarVistaPrevia(files[0]);
                }
            });
        }

        // Navegación de ayuda
        document.querySelectorAll('.help-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.cambiarSeccionAyuda(btn.dataset.section));
        });

        // Modal de estudiante
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
        document.querySelectorAll('.section').forEach(s => {
            s.classList.remove('active');
            s.hidden = true;
        });
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });

        // Mostrar sección seleccionada
        const seccionSeleccionada = document.getElementById(`seccion-${seccion}`);
        const botonSeleccionado = document.getElementById(`btn-${seccion}`);
        
        if (seccionSeleccionada && botonSeleccionado) {
            seccionSeleccionada.classList.add('active');
            seccionSeleccionada.hidden = false;
            botonSeleccionado.classList.add('active');
            botonSeleccionado.setAttribute('aria-selected', 'true');

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
    }

    cambiarSeccionAyuda(subseccion) {
        // Ocultar todas las subsecciones de ayuda
        document.querySelectorAll('.help-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.help-tab-btn').forEach(btn => btn.classList.remove('active'));

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
        document.getElementById('correo-estudiante').value = estudiante.correo || '';
        document.getElementById('grupo-estudiante').value = estudiante.grupo || '';
        document.getElementById('corte1').value = estudiante.corte1 || '';
        document.getElementById('corte2').value = estudiante.corte2 || '';
        document.getElementById('corte3').value = estudiante.corte3 || '';
        document.getElementById('bonificacion').value = estudiante.bonificacion || '';
        document.getElementById('comentarios').value = estudiante.comentarios || '';
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
            correo: document.getElementById('correo-estudiante').value.trim(),
            grupo: document.getElementById('grupo-estudiante').value.trim(),
            corte1: this.validarNota(document.getElementById('corte1').value),
            corte2: this.validarNota(document.getElementById('corte2').value),
            corte3: this.validarNota(document.getElementById('corte3').value),
            bonificacion: this.validarNota(document.getElementById('bonificacion').value),
            comentarios: document.getElementById('comentarios').value.trim()
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
        const { corte1, corte2, corte3, bonificacion } = estudiante;
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
        
        // Agregar bonificación a la definitiva
        if (bonificacion !== null && bonificacion !== undefined && bonificacion > 0) {
            definitiva += parseFloat(bonificacion);
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
        const filtroVista = document.getElementById('filtro-vista-estudiantes');
        // Por defecto, mostrar lista si no hay filtro
        let modo = 'list';
        if (filtroVista) {
            modo = filtroVista.value;
        } else if (container && container.className === 'estudiantes-grid') {
            modo = 'cards';
        }

        if (filtroVista && filtroVista.value !== modo) {
            filtroVista.value = modo;
        }

        // Dar foco al tab de estudiantes
        document.getElementById('btn-estudiantes').focus();

        if (this.estudiantes.length === 0) {
            container.innerHTML = `
                <div class="no-estudiantes">
                    <h3>No hay estudiantes registrados</h3>
                    <p>Haga clic en "Agregar Estudiante" para comenzar</p>
                </div>
            `;
            return;
        }

        if (modo === 'list') {
            container.className = 'estudiantes-list';
            container.innerHTML = this.crearTablaEstudiantes();
        } else {
            container.className = 'estudiantes-grid';
            container.innerHTML = this.estudiantes.map(estudiante => this.crearCardEstudiante(estudiante)).join('');
        }
    }

    crearTablaEstudiantes() {
        // Crear tabla de estudiantes
        let html = `
            <table class="tabla-estudiantes">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Corte 1 (33%)</th>
                    <th>Corte 2 (33%)</th>
                    <th>Corte 3 (34%)</th>
                    <th>+ Bonificación</th>
                    <th>Definitiva</th>
                    <th>Comentarios</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>`;
        for (const estudiante of this.estudiantes) {
            const { definitiva } = this.calcularDefinitiva(estudiante);
            const bonificacionNota = estudiante.bonificacion || '';
            
            html += `<tr data-id="${estudiante.id}">
                <td>${estudiante.codigo || ''}</td>
                <td>${estudiante.nombre || ''}</td>
                <td>${estudiante.correo || ''}</td>
                <td><input type="number" min="0" max="5" step="0.01" value="${estudiante.corte1 || ''}" 
                    onchange="calculadora.actualizarNotaEstudiante('${estudiante.id}', 'corte1', this.value)"
                    class="nota-input"></td>
                <td><input type="number" min="0" max="5" step="0.01" value="${estudiante.corte2 || ''}"
                    onchange="calculadora.actualizarNotaEstudiante('${estudiante.id}', 'corte2', this.value)"
                    class="nota-input"></td>
                <td><input type="number" min="0" max="5" step="0.01" value="${estudiante.corte3 || ''}"
                    onchange="calculadora.actualizarNotaEstudiante('${estudiante.id}', 'corte3', this.value)"
                    class="nota-input"></td>
                <td class="bonificacion-cell">
                    <input type="number" min="0" max="5" step="0.01" value="${bonificacionNota}" 
                        id="bonif-${estudiante.id}"
                        class="nota-input bonif-input" placeholder="0.00">
                    <button class="btn-guardar-bonif" onclick="calculadora.guardarBonificacion('${estudiante.id}')" title="Guardar bonificación">💾</button>
                </td>
                <td>${definitiva.toFixed(2)}</td>
                <td class="comentarios" title="${estudiante.comentarios || ''}">${estudiante.comentarios ? '📝' : ''}</td>
                <td>
                    <button class="btn-icon delete" onclick='calculadora.eliminarEstudiante("${estudiante.id}")' title="Eliminar">🗑️</button>
                </td>
            </tr>`;
        }
        html += '</tbody></table>';
        return html;
    }
    // ...existing code...
    // En init, agregar listener para el filtro de vista
    init() {
        this.cargarDatos();
        this.configurarEventListeners();
        // Establecer la vista por defecto en 'lista'
        setTimeout(() => {
            const filtro = document.getElementById('filtro-vista-estudiantes');
            if (filtro) {
                filtro.value = 'list';
                filtro.addEventListener('change', () => this.renderizarEstudiantes());
            }
            this.cambiarSeccion('estudiantes');
            this.renderizarEstudiantes();
        }, 300);
        this.actualizarPorcentajes();
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
    // CONFIGURACIÓN DEL SISTEMA
    // ==========================================
    actualizarPorcentajes() {
        // Cargar porcentajes guardados
        document.getElementById('porcentaje-corte1').value = this.porcentajes.corte1;
        document.getElementById('porcentaje-corte2').value = this.porcentajes.corte2;
        document.getElementById('porcentaje-corte3').value = this.porcentajes.corte3;
        
        // Cargar otras configuraciones
        document.getElementById('nota-aprobacion').value = localStorage.getItem('notaAprobacion') || '3.0';
        document.getElementById('decimales').value = localStorage.getItem('decimales') || '2';
        
        // Actualizar información del sistema
        this.actualizarInfoSistema();
        this.validarPorcentajes();
    }

    actualizarInfoSistema() {
        // Actualizar último respaldo
        const ultimoRespaldo = localStorage.getItem('ultimoRespaldo');
        document.getElementById('ultimo-respaldo').textContent = 
            ultimoRespaldo ? new Date(ultimoRespaldo).toLocaleString() : 'No hay respaldo';

        // Calcular espacio usado
        const espacioUsado = (
            new Blob([JSON.stringify(localStorage)]).size / 1024
        ).toFixed(2);
        document.getElementById('espacio-usado').textContent = `${espacioUsado} KB`;

        // Mostrar total de estudiantes
        document.getElementById('total-estudiantes').textContent = 
            this.estudiantes.length;
    }

    validarPorcentajes() {
        const p1 = parseInt(document.getElementById('porcentaje-corte1').value) || 0;
        const p2 = parseInt(document.getElementById('porcentaje-corte2').value) || 0;
        const p3 = parseInt(document.getElementById('porcentaje-corte3').value) || 0;
        const total = p1 + p2 + p3;

        const totalElement = document.getElementById('total-porcentaje');
        const validationElement = document.getElementById('total-validation');
        totalElement.textContent = total;
        
        if (total === 100) {
            totalElement.style.color = 'var(--color-success)';
            validationElement.classList.remove('show');
        } else {
            totalElement.style.color = 'var(--color-danger)';
            validationElement.classList.add('show');
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
    // GESTIÓN DE RESPALDOS Y ARCHIVOS
    // ==========================================
    
    crearRespaldo() {
        try {
            const datos = {
                estudiantes: this.estudiantes,
                porcentajes: this.porcentajes,
                configuracion: {
                    notaAprobacion: parseFloat(document.getElementById('nota-aprobacion').value),
                    decimales: parseInt(document.getElementById('decimales').value)
                },
                fecha: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `respaldo_calificaciones_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            localStorage.setItem('ultimoRespaldo', new Date().toISOString());
            this.actualizarInfoSistema();
            this.mostrarToast('Respaldo creado correctamente', 'success');
        } catch (error) {
            console.error('Error al crear respaldo:', error);
            this.mostrarToast('Error al crear el respaldo', 'error');
        }
    }

    mostrarVistaPrevia(file) {
        const preview = document.getElementById('upload-preview');
        const filename = document.getElementById('preview-filename');
        
        if (preview && filename) {
            filename.textContent = file.name;
            preview.style.display = 'block';
        }
        
        // Configurar botón de cancelar
        document.getElementById('btn-cancel-upload')?.addEventListener('click', () => {
            document.getElementById('archivo-estudiantes').value = '';
            preview.style.display = 'none';
        });
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
    // ACTUALIZACIÓN DE NOTAS
    // ==========================================
    actualizarNotaEstudiante(id, campo, valor) {
        const estudiante = this.estudiantes.find(e => e.id === id);
        if (estudiante) {
            estudiante[campo] = this.validarNota(valor);
            this.guardarDatos();
            
            // Actualizar solo la definitiva en la fila
            const fila = document.querySelector(`tr[data-id="${id}"]`);
            if (fila) {
                const { definitiva } = this.calcularDefinitiva(estudiante);
                const celdaDefinitiva = fila.querySelector('td:nth-child(8)');
                if (celdaDefinitiva) {
                    celdaDefinitiva.textContent = definitiva.toFixed(2);
                }
            }
        }
    }
    
    guardarBonificacion(id) {
        const inputBonif = document.getElementById(`bonif-${id}`);
        if (inputBonif) {
            const valor = inputBonif.value;
            this.actualizarNotaEstudiante(id, 'bonificacion', valor);
            this.mostrarToast('Bonificación guardada correctamente', 'success');
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
    // REPORTES Y ESTADÍSTICAS
    // ==========================================
    
    generarEstadisticas() {
        const stats = {
            total: this.estudiantes.length,
            aprobados: 0,
            reprobados: 0,
            enRiesgo: 0,
            promedioGeneral: 0,
            mejorPromedio: 0,
            peorPromedio: 5.0,
            distribucionNotas: {
                excelente: 0, // 4.5 - 5.0
                bueno: 0,     // 4.0 - 4.4
                aceptable: 0, // 3.0 - 3.9
                deficiente: 0 // 0.0 - 2.9
            }
        };

        let sumaDefinitivas = 0;

        this.estudiantes.forEach(estudiante => {
            const { definitiva } = this.calcularDefinitiva(estudiante);
            const estado = this.determinarEstadoEstudiante(estudiante);

            // Actualizar contadores
            if (estado === 'aprobado') stats.aprobados++;
            if (estado === 'reprobado') stats.reprobados++;
            if (estado === 'en-progreso' && definitiva < 2.0) stats.enRiesgo++;

            // Actualizar promedio y extremos
            sumaDefinitivas += definitiva;
            stats.mejorPromedio = Math.max(stats.mejorPromedio, definitiva);
            stats.peorPromedio = Math.min(stats.peorPromedio, definitiva);

            // Clasificar en distribución
            if (definitiva >= 4.5) stats.distribucionNotas.excelente++;
            else if (definitiva >= 4.0) stats.distribucionNotas.bueno++;
            else if (definitiva >= 3.0) stats.distribucionNotas.aceptable++;
            else stats.distribucionNotas.deficiente++;
        });

        // Calcular promedio general
        stats.promedioGeneral = stats.total > 0 ? sumaDefinitivas / stats.total : 0;

        return stats;
    }

    generarReporteHTML() {
        const stats = this.generarEstadisticas();
        return `
            <div class="reporte-estadisticas">
                <h3>Resumen Estadístico</h3>
                
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${stats.total}</div>
                        <div class="stat-label">Total Estudiantes</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${stats.aprobados}</div>
                        <div class="stat-label">Aprobados</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${stats.reprobados}</div>
                        <div class="stat-label">Reprobados</div>
                    </div>
                    <div class="stat-item warning">
                        <div class="stat-value">${stats.enRiesgo}</div>
                        <div class="stat-label">En Riesgo</div>
                    </div>
                </div>

                <div class="promedios-section">
                    <div class="promedio-item">
                        <span class="label">Promedio General:</span>
                        <span class="value">${stats.promedioGeneral.toFixed(2)}</span>
                    </div>
                    <div class="promedio-item">
                        <span class="label">Mejor Promedio:</span>
                        <span class="value">${stats.mejorPromedio.toFixed(2)}</span>
                    </div>
                    <div class="promedio-item">
                        <span class="label">Peor Promedio:</span>
                        <span class="value">${stats.peorPromedio.toFixed(2)}</span>
                    </div>
                </div>

                <div class="distribucion-notas">
                    <h4>Distribución de Notas</h4>
                    <div class="barra-distribucion">
                        <div class="barra excelente" style="width: ${(stats.distribucionNotas.excelente/stats.total*100)||0}%">
                            <span class="etiqueta">Excelente (${stats.distribucionNotas.excelente})</span>
                        </div>
                        <div class="barra bueno" style="width: ${(stats.distribucionNotas.bueno/stats.total*100)||0}%">
                            <span class="etiqueta">Bueno (${stats.distribucionNotas.bueno})</span>
                        </div>
                        <div class="barra aceptable" style="width: ${(stats.distribucionNotas.aceptable/stats.total*100)||0}%">
                            <span class="etiqueta">Aceptable (${stats.distribucionNotas.aceptable})</span>
                        </div>
                        <div class="barra deficiente" style="width: ${(stats.distribucionNotas.deficiente/stats.total*100)||0}%">
                            <span class="etiqueta">Deficiente (${stats.distribucionNotas.deficiente})</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ==========================================
    // EXPORTACIÓN DE REPORTES
    // ==========================================

    exportarReporteCSV() {
        const estudiantes = this.estudiantes;
        const headers = ['Código', 'Nombre', 'Correo', 'Grupo', 'Corte 1', 'Corte 2', 'Corte 3', 'Bonificación', 'Definitiva', 'Estado'];
        
        // Crear el contenido CSV
        let csvContent = headers.join(',') + '\n';
        
        estudiantes.forEach(estudiante => {
            const { definitiva } = this.calcularDefinitiva(estudiante);
            const estado = this.determinarEstadoEstudiante(estudiante);
            
            const row = [
                estudiante.codigo,
                estudiante.nombre,
                estudiante.correo,
                estudiante.grupo,
                estudiante.corte1,
                estudiante.corte2,
                estudiante.corte3,
                estudiante.bonificacion,
                definitiva.toFixed(2),
                estado
            ];
            
            // Escapar campos que puedan contener comas
            const escapedRow = row.map(field => {
                if (field && field.toString().includes(',')) {
                    return `"${field}"`;
                }
                return field;
            });
            
            csvContent += escapedRow.join(',') + '\n';
        });
        
        // Crear blob y descargar
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'reporte_calificaciones.csv');
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    exportarReportePDF() {
        const stats = this.generarEstadisticas();
        const estudiantes = this.estudiantes;
        
        // Configurar el documento PDF
        const docDefinition = {
            content: [
                { text: 'Reporte de Calificaciones', style: 'header' },
                { text: new Date().toLocaleDateString(), alignment: 'right', margin: [0, 0, 0, 20] },
                
                // Resumen estadístico
                {
                    text: 'Resumen Estadístico',
                    style: 'subheader',
                    margin: [0, 0, 0, 10]
                },
                {
                    columns: [
                        [
                            { text: `Total Estudiantes: ${stats.total}` },
                            { text: `Aprobados: ${stats.aprobados}` },
                            { text: `Reprobados: ${stats.reprobados}` }
                        ],
                        [
                            { text: `Promedio General: ${stats.promedioGeneral.toFixed(2)}` },
                            { text: `Mejor Promedio: ${stats.mejorPromedio.toFixed(2)}` },
                            { text: `Peor Promedio: ${stats.peorPromedio.toFixed(2)}` }
                        ]
                    ],
                    columnGap: 20,
                    margin: [0, 0, 0, 20]
                },
                
                // Lista detallada de estudiantes
                {
                    text: 'Detalle por Estudiante',
                    style: 'subheader',
                    margin: [0, 0, 0, 10]
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
                        body: [
                            ['Código', 'Nombre', 'Definitiva', 'Estado', 'Grupo', 'Correo']
                        ]
                    }
                }
            ],
            styles: {
                header: {
                    fontSize: 22,
                    bold: true,
                    margin: [0, 0, 0, 10]
                },
                subheader: {
                    fontSize: 16,
                    bold: true,
                    margin: [0, 10, 0, 5]
                }
            },
            defaultStyle: {
                fontSize: 10
            }
        };
        
        // Agregar filas de estudiantes
        estudiantes.forEach(estudiante => {
            const { definitiva } = this.calcularDefinitiva(estudiante);
            const estado = this.determinarEstadoEstudiante(estudiante);
            
            docDefinition.content[4].table.body.push([
                estudiante.codigo,
                estudiante.nombre,
                definitiva.toFixed(2),
                estado,
                estudiante.grupo,
                estudiante.correo
            ]);
        });
        
        // Generar y descargar el PDF
        pdfMake.createPdf(docDefinition).download('reporte_calificaciones.pdf');
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