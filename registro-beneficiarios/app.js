// Sistema de Registro de Beneficiarios - Municipalidad del Callao
// Array para almacenar beneficiarios
let beneficiarios = [];
let editandoIndex = -1;

// Lista de comedores disponibles
let comedores = [];

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', function() {
    cargarComedoresDesdeStorage();
    cargarBeneficiariosGuardados();
    cargarComedores();
    actualizarEstadisticas();
    configurarBuscador();
    
    // Configurar formulario
    document.getElementById('formRegistro').addEventListener('submit', registrarBeneficiario);
});

//Cargar comedores desde LocalStorage:
function cargarComedoresDesdeStorage() {
    try {
        const comedoresGuardados = localStorage.getItem('comedores');
        if (comedoresGuardados) {
            const listaComedores = JSON.parse(comedoresGuardados);
            // Solo incluir comedores activos
            comedores = listaComedores
                .filter(comedor => comedor.activo)
                .map(comedor => comedor.nombre);
        } else {
            comedores = [];
        }
        console.log('Comedores cargados:', comedores);
    } catch (error) {
        console.error('Error al cargar comedores:', error);
        comedores = [];
    }
}

//Cargar comedores en el select
function cargarComedores() {
    const selectComedor = document.getElementById('comedor');
    
    // Limpiar opciones existentes (excepto la primera)
    while (selectComedor.children.length > 1) {
        selectComedor.removeChild(selectComedor.lastChild);
    }
    
    if (comedores.length === 0) {
        // Si no hay comedores, mostrar mensaje
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No hay comedores disponibles';
        option.disabled = true;
        selectComedor.appendChild(option);
    } else{
        // Agregar comedores al select
        comedores.forEach(comedor => {
            const option = document.createElement('option');
            option.value = comedor;
            option.textContent = comedor;
            selectComedor.appendChild(option);
        });
    }
    
    
    
    console.log(`Se cargaron ${comedores.length} comedores en el select`);
}

// Registrar nuevo beneficiario
function registrarBeneficiario(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const beneficiario = {
        dni: formData.get('dni'),
        nombre: formData.get('nombre'),
        apellidos: formData.get('apellidos'),
        fechaNacimiento: formData.get('fechaNacimiento'),
        genero: formData.get('genero'),
        direccion: formData.get('direccion'),
        telefono: formData.get('telefono'),
        estadoCivil: formData.get('estadoCivil'),
        numeroHijos: parseInt(formData.get('numeroHijos')),
        condicion: formData.get('condicion'),
        comedor: formData.get('comedor'),
        fechaRegistro: new Date().toISOString().split('T')[0]
    };
    
    // Validar DNI único
    if (editandoIndex === -1) {
        // Nuevo registro - verificar DNI único
        if (beneficiarios.some(b => b.dni === beneficiario.dni)) {
            mostrarNotificacion('El DNI ya está registrado', 'error');
            return;
        }
    } else {
        // Editando registro existente - verificar DNI único excepto el registro actual
        if (beneficiarios.some((b, index) => b.dni === beneficiario.dni && index !== editandoIndex)) {
            mostrarNotificacion('El DNI ya está registrado por otro beneficiario', 'error');
            return;
        }
    }
    
    // Validar campos requeridos
    if (!validarCampos(beneficiario)) {
        mostrarNotificacion('Por favor complete todos los campos obligatorios', 'error');
        return;
    }
    
    if (editandoIndex >= 0) {
        // Editando beneficiario existente
        beneficiarios[editandoIndex] = beneficiario;
        mostrarNotificacion('Beneficiario actualizado correctamente', 'success');
        editandoIndex = -1;
    } else {
        // Nuevo beneficiario
        beneficiarios.push(beneficiario);
        mostrarNotificacion('Beneficiario registrado correctamente', 'success');
    }
    
    // Guardar en localStorage
    guardarBeneficiarios();
    
    // Actualizar interfaz
    actualizarTabla();
    actualizarEstadisticas();
    limpiarFormulario();
}

// Validar campos obligatorios
function validarCampos(beneficiario) {
    const camposObligatorios = ['dni', 'nombre', 'apellidos', 'fechaNacimiento', 'genero', 'direccion', 'telefono', 'estadoCivil', 'comedor'];
    return camposObligatorios.every(campo => beneficiario[campo] && beneficiario[campo].toString().trim() !== '');
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo) {
    const notificacion = document.getElementById('notificacion');
    notificacion.className = `mb-6 p-4 rounded-lg ${tipo === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`;
    notificacion.textContent = mensaje;
    notificacion.classList.remove('hidden');
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
        notificacion.classList.add('hidden');
    }, 5000);
}

// Actualizar tabla de beneficiarios
function actualizarTabla() {
    const tbody = document.getElementById('tablaBeneficiarios');
    const noHayDatos = document.getElementById('noHayDatos');
    
    if (beneficiarios.length === 0) {
        tbody.innerHTML = '';
        noHayDatos.classList.remove('hidden');
        return;
    }
    
    noHayDatos.classList.add('hidden');
    
    tbody.innerHTML = beneficiarios.map((beneficiario, index) => `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 font-medium">${beneficiario.dni}</td>
            <td class="px-4 py-3">${beneficiario.nombre} ${beneficiario.apellidos}</td>
            <td class="px-4 py-3 hidden sm:table-cell">${calcularEdad(beneficiario.fechaNacimiento)} años</td>
            <td class="px-4 py-3 hidden md:table-cell">
                <span class="inline-flex items-center">
                    <i class="fas fa-${beneficiario.genero === 'mujer' ? 'venus text-pink-600' : 'mars text-blue-600'} mr-1"></i>
                    ${beneficiario.genero.charAt(0).toUpperCase() + beneficiario.genero.slice(1)}
                </span>
            </td>
            <td class="px-4 py-3 hidden lg:table-cell">${beneficiario.direccion}</td>
            <td class="px-4 py-3">${beneficiario.telefono}</td>
            <td class="px-4 py-3 text-sm">${beneficiario.comedor}</td>
            <td class="px-4 py-3">
                <div class="flex space-x-2">
                    <button onclick="editarBeneficiario(${index})" 
                            class="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                            title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="eliminarBeneficiario(${index})" 
                            class="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                            title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Calcular edad
function calcularEdad(fechaNacimiento) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = nacimiento.getMonth();
    
    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    
    return edad;
}

// Actualizar estadísticas
function actualizarEstadisticas() {
    const total = beneficiarios.length;
    const mujeres = beneficiarios.filter(b => b.genero === 'mujer').length;
    const hombres = beneficiarios.filter(b => b.genero === 'hombre').length;
    const madresSolteras = beneficiarios.filter(b => 
        b.genero === 'mujer' && 
        (b.estadoCivil === 'soltero' || b.estadoCivil === 'divorciado' || b.estadoCivil === 'viudo') && 
        b.numeroHijos > 0
    ).length;
    
    document.getElementById('totalBeneficiarios').textContent = total;
    document.getElementById('totalMujeres').textContent = mujeres;
    document.getElementById('totalHombres').textContent = hombres;
}

// Editar beneficiario
function editarBeneficiario(index) {
    const beneficiario = beneficiarios[index];
    editandoIndex = index;
    
    // Llenar formulario con datos del beneficiario
    document.getElementById('dni').value = beneficiario.dni;
    document.getElementById('nombre').value = beneficiario.nombre;
    document.getElementById('apellidos').value = beneficiario.apellidos;
    document.getElementById('fechaNacimiento').value = beneficiario.fechaNacimiento;
    document.querySelector(`input[name="genero"][value="${beneficiario.genero}"]`).checked = true;
    document.getElementById('direccion').value = beneficiario.direccion;
    document.getElementById('telefono').value = beneficiario.telefono;
    document.getElementById('estadoCivil').value = beneficiario.estadoCivil;
    document.getElementById('numeroHijos').value = beneficiario.numeroHijos;
    document.getElementById('condicion').value = beneficiario.condicion;
    document.getElementById('comedor').value = beneficiario.comedor;
    
    // Scroll al formulario
    document.getElementById('formRegistro').scrollIntoView({ behavior: 'smooth' });
    
    mostrarNotificacion('Editando beneficiario. Modifique los datos y guarde los cambios.', 'success');
}

// Eliminar beneficiario
function eliminarBeneficiario(index) {
    if (confirm('¿Está seguro de que desea eliminar este beneficiario?')) {
        beneficiarios.splice(index, 1);
        guardarBeneficiarios();
        actualizarTabla();
        actualizarEstadisticas();
        mostrarNotificacion('Beneficiario eliminado correctamente', 'success');
    }
}

// Limpiar formulario
function limpiarFormulario() {
    document.getElementById('formRegistro').reset();
    editandoIndex = -1;
    document.getElementById('notificacion').classList.add('hidden');
}

// Configurar buscador
function configurarBuscador() {
    const buscador = document.getElementById('buscador');
    buscador.addEventListener('input', function() {
        const termino = this.value.toLowerCase();
        const filas = document.querySelectorAll('#tablaBeneficiarios tr');
        
        filas.forEach(fila => {
            const texto = fila.textContent.toLowerCase();
            if (texto.includes(termino)) {
                fila.style.display = '';
            } else {
                fila.style.display = 'none';
            }
        });
    });
}

// Exportar datos
function exportarDatos() {
    if (beneficiarios.length === 0) {
        mostrarNotificacion('No hay datos para exportar', 'error');
        return;
    }
    
    const csv = convertirACSV(beneficiarios);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `beneficiarios_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Convertir array a CSV
function convertirACSV(array) {
    const encabezados = [
        'DNI', 'Nombres', 'Apellidos', 'Fecha Nacimiento', 'Edad', 'Género',
        'Dirección', 'Teléfono', 'Estado Civil', 'Número Hijos', 'Condición',
        'Comedor Asignado', 'Fecha Registro'
    ];
    
    const filas = array.map(beneficiario => [
        beneficiario.dni,
        beneficiario.nombre,
        beneficiario.apellidos,
        beneficiario.fechaNacimiento,
        calcularEdad(beneficiario.fechaNacimiento),
        beneficiario.genero,
        beneficiario.direccion,
        beneficiario.telefono,
        beneficiario.estadoCivil,
        beneficiario.numeroHijos,
        beneficiario.condicion,
        beneficiario.comedor,
        beneficiario.fechaRegistro
    ]);
    
    return [encabezados, ...filas]
        .map(fila => fila.map(campo => `"${campo}"`).join(','))
        .join('\n');
}

// Guardar beneficiarios en localStorage
function guardarBeneficiarios() {
    try {
        localStorage.setItem('beneficiarios', JSON.stringify(beneficiarios));
        console.log('Datos guardados (simulado):', beneficiarios);
    } catch (error) {
        console.error('Error al guardar datos:', error);
        mostrarNotificacion('Error al guardar los datos', 'error');
    }
}

// Cargar beneficiarios desde localStorage
function cargarBeneficiariosGuardados() {
    try {
        const datosGuardados = localStorage.getItem('beneficiarios');
        if (datosGuardados) {
            beneficiarios = JSON.parse(datosGuardados);
            actualizarTabla();
            actualizarEstadisticas();
            console.log('Beneficiarios cargados desde localStorage:', beneficiarios);
        }
    } catch (error) {
        console.error('Error al cargar datos:', error);
        mostrarNotificacion('Error al cargar los datos guardados', 'error');
    }
}

function actualizarComedoresDisponibles() {
    cargarComedoresDesdeStorage();
    cargarComedores();
    mostrarNotificacion('Lista de comedores actualizada', 'success');
}

// Validación en tiempo real del DNI
document.addEventListener('DOMContentLoaded', function() {
    const dniInput = document.getElementById('dni');
    if (dniInput) {
        dniInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '').substring(0, 8);
        });
    }
    
    const telefonoInput = document.getElementById('telefono');
    if (telefonoInput) {
        telefonoInput.addEventListener('input', function() {
            let valor = this.value.replace(/[^0-9]/g, '');
            if (valor.length >= 3 && valor.length <= 6) {
                valor = valor.substring(0, 3) + '-' + valor.substring(3);
            } else if (valor.length > 6) {
                valor = valor.substring(0, 3) + '-' + valor.substring(3, 6) + '-' + valor.substring(6, 9);
            }
            this.value = valor;
        });
    }
});

// Función para navegación (referenciada en el HTML)
function navegarA(seccion) {
    console.log(`Navegando a: ${seccion}`);
}