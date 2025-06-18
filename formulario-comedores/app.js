// =======================
// 1️⃣ DOM Elements: Formulario y tabla
// =======================
const formComedor = document.getElementById('formComedor');
const tablaComedores = document.getElementById('tablaComedores');
// Notificación (decorativa pero funcional)
const notificacion = document.getElementById('notificacion');
// Estadísticas
const totalComedores = document.getElementById('totalComedores');
const comedoresActivos = document.getElementById('comedoresActivos');
const capacidadComedoresTotal = document.getElementById('capacidadTotal');
const encargados = document.getElementById('encargados');

// =======================
// 2️⃣ Estado Global
// =======================
let listaComedores = [];

// =======================
// 3️⃣ Utilidades: Notificación y Estadísticas
// =======================
// Función Auxiliar 1
function mostrarNotificacion(mensaje, tipo = 'success') {
  console.log(`Ejecutando mostrarNotificacion:`, mensaje)
  notificacion.className = `mb-6 p-4 rounded-lg text-white ${tipo === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
  notificacion.textContent = mensaje; // Muestra el texto del mensaje
  notificacion.classList.remove('hidden'); // Hace visible el contenedor de notificación
  setTimeout(() => notificacion.classList.add('hidden'), 3000); // Oculta la notificación automáticamente después de 3 segundos
}
// Función Auxiliar 2
function actualizarEstadisticas() {
  totalComedores.textContent = listaComedores.length; // muestra la cantidad de comedores registrados
  comedoresActivos.textContent = listaComedores.filter(c => c.activo).length; // Se asume todos activos
  capacidadComedoresTotal.textContent = listaComedores.reduce((acc, c) => acc + c.capacidad, 0); // Suma todas las capacidades de los comedores registrados
  encargados.textContent = new Set(listaComedores.map(c => c.encargado)).size; // contabiliza la cantidad de encargados
}

// =======================
// 4️⃣ localStorage
// =======================
function guardarEnLocalStorage() {
  localStorage.setItem('comedores', JSON.stringify(listaComedores));
}

function cargarDesdeLocalStorage() {
  const datos = JSON.parse(localStorage.getItem('comedores')) || [];
  listaComedores = datos;
  listaComedores.forEach(agregarFila);
  actualizarEstadisticas();
}

// =======================
// 5️⃣ Renderizar la fila a la tabla
// =======================
function agregarFila(comedor) {
  const fila = document.createElement('tr');
  fila.innerHTML = `
    <td class="px-6 py-4">${comedor.fecha}</td>  
    <td class="px-6 py-4">${comedor.nombre}</td>
    <td class="px-6 py-4">${comedor.direccion}</td>
    <td class="px-6 py-4">${comedor.capacidad}</td>
    <td class="px-6 py-4">${comedor.encargado}</td>
    <td class="px-6 py-4">${comedor.telefono}</td>
    <td class="px-6 py-4">${comedor.email || '-'}</td>
    <td class="px-6 py-4 text-center">
        <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" 
                class="estado-toggle sr-only peer" 
                ${comedor.activo ? 'checked' : ''} 
                name="estado-${comedor.nombre.toLowerCase().replace(/\s+/g, '-')}"
                id="estado-${comedor.nombre.toLowerCase().replace(/\s+/g, '-')}" />
            <div class="w-10 h-5 bg-gray-300 rounded-full shadow-inner relative transition duration-300 peer-checked:bg-green-400">
                <div class="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
            </div>
        </label>
    </td>
    <td class="px-6 py-4 flex items-center justify-center space-x-2">
        <button class="editar-btn text-yellow-500 hover:text-yellow-600" title="Editar">
            <i class="fas fa-edit"></i>
        </button>
        <button class="eliminar-btn text-red-600 hover:text-red-700" title="Eliminar">
            <i class="fas fa-trash-alt"></i>
        </button>
    </td>
  `;
  
  // ========== Evento Eliminar con SweetAlert2 ==========
  const btnEliminar = fila.querySelector('.eliminar-btn');
  btnEliminar.addEventListener('click', () => {
    Swal.fire({
        title: '¿Eliminar comedor?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e3342f',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            tablaComedores.removeChild(fila);
            listaComedores = listaComedores.filter(c => c !== comedor);
            guardarEnLocalStorage(); 
            actualizarEstadisticas();
            mostrarNotificacion('Comedor eliminado', 'success');
        }
    });
  });


  // ========== Evento Editar ==========
  const btnEditar = fila.querySelector('.editar-btn');
  btnEditar.addEventListener('click', function() {
    const celdas = fila.querySelectorAll('td');
    const esEditando = this.textContent === 'Guardar';

    if (!esEditando) {
      // Cambiar a modo edición
      const campos = ['nombre', 'direccion', 'capacidad', 'encargado', 'telefono', 'email'];
      campos.forEach((campo, i) => {
        const valor = celdas[i + 1].textContent;
        celdas[i + 1].innerHTML = `<input class="border px-2 py-1 w-full" type="${campo === 'capacidad' ? 'number' : 'text'}" value="${valor}">`;
      });
      this.textContent = 'Guardar';
      this.classList.replace('bg-yellow-500', 'bg-blue-600');
    } else {
      // Guardar cambios
      const inputs = fila.querySelectorAll('input');
      const valores = [...inputs].map(input => input.value.trim());

      if (!valores[0] || !valores[1] || isNaN(parseInt(valores[2])) || parseInt(valores[2]) <= 0) {
        mostrarNotificacion('Campos inválidos. Verifica los datos.', 'error');
        return;
      }

      // Actualizar objeto comedor
      comedor.nombre = valores[0];
      comedor.direccion = valores[1];
      comedor.capacidad = parseInt(valores[2]);
      comedor.encargado = valores[3];
      comedor.telefono = valores[4];
      comedor.email = valores[5];

      // Reemplazar inputs con texto actualizado
      celdas[1].textContent = comedor.nombre;
      celdas[2].textContent = comedor.direccion;
      celdas[3].textContent = comedor.capacidad;
      celdas[4].textContent = comedor.encargado;
      celdas[5].textContent = comedor.telefono;
      celdas[6].textContent = comedor.email || '-';

      this.textContent = 'Editar';
      this.classList.replace('bg-blue-600', 'bg-yellow-500');

      actualizarEstadisticas();
      guardarEnLocalStorage();
      mostrarNotificacion('Comedor actualizado correctamente', 'success');
    }
  });
  
  // Agregar evento al toggle (activo-inactivo)
  const toggle = fila.querySelector('.estado-toggle');
  
  toggle.addEventListener('change', () => {
    comedor.activo = toggle.checked;
    guardarEnLocalStorage();
    actualizarEstadisticas();
    mostrarNotificacion(
        comedor.activo ? 'Comedor activado' : 'Comedor inactivado',
        'success'
    );
  });


  tablaComedores.appendChild(fila);
}

// =======================
// 6️⃣ Evento de envío del formulario
// =======================
formComedor.addEventListener('submit', function (e) {
  e.preventDefault();
 
  const nombre = document.getElementById("nombreComedor").value.trim();
  const direccion = document.getElementById("direccion").value.trim();
  const capacidad = parseInt(document.getElementById("capacidad").value);
  const encargado = document.getElementById("encargado").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const email = document.getElementById("email").value.trim();
  const fechaRegistro = new Date().toLocaleDateString("es-PE", {
      year: "numeric", month: "long", day: "numeric"
  });

  // Crear el objeto comedor
  const comedor ={
    fecha: fechaRegistro,
    nombre,
    direccion,
    capacidad: parseInt(capacidad),
    encargado,
    telefono,
    email,
    activo: true,
  };

  // Validación para la capacidad del comerdor 
  if (isNaN(comedor.capacidad)) {
    mostrarNotificacion('La capacidad debe ser un número válido mayor a 10.', 'error');
    return;
  }

  // Validación de duplicados
const nombreRepetido = listaComedores.some(c => c.nombre.toLowerCase() === nombre.toLowerCase());
const encargadoRepetido = listaComedores.some(c => c.encargado.toLowerCase() === encargado.toLowerCase());
const telefonoRepetido = listaComedores.some(c => c.telefono === telefono);

if (nombreRepetido) {
  mostrarNotificacion('Ya existe un comedor con ese nombre.', 'error');
  return;
}
if (encargadoRepetido) {
  mostrarNotificacion('Ese encargado ya está asignado a otro comedor.', 'error');
  return;
}
if (telefonoRepetido) {
  mostrarNotificacion('Ese número de teléfono ya está registrado.', 'error');
  return;
}

  // Registrar comedor
  listaComedores.push(comedor); // Agregar al arreglo
  guardarEnLocalStorage(); // los datos se guardarán
  agregarFila(comedor); // mostrarlo en la tabla
  actualizarEstadisticas(); // actualizar estadísticas
  mostrarNotificacion('¡Comedor registrado exitosamente!', 'success'); // notificación de éxito
  formComedor.reset(); // resetear el formulario
});

// =======================
// 7️⃣ Evento para buscar por nombre
// =======================
document.getElementById('buscador').addEventListener('input', function () {
  const termino = this.value.toLowerCase();
  const filas = tablaComedores.querySelectorAll('tr');

  filas.forEach(fila => {
    const nombre = fila.children[1]?.textContent.toLowerCase() || '';
    if (nombre.includes(termino)) {
      fila.style.display = '';
    } else {
      fila.style.display = 'none';
    }
  });
});

// =======================
// 8️⃣ Exportar datos a excel
// =======================
function exportarDatos() {
  if (!listaComedores.length) {
    mostrarNotificacion('No hay comedores para exportar.', 'error');
    return;
  }

  // Define encabezados y estructura de datos
  const data = listaComedores.map(c => ({
    Fecha: c.fecha,
    Nombre: c.nombre,
    Dirección: c.direccion,
    Capacidad: c.capacidad,
    Encargado: c.encargado,
    Teléfono: c.telefono,
    Email: c.email || '-'
  }));

  // Crea una hoja de Excel
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Comedores');

  // Genera el archivo .xlsx
  XLSX.writeFile(workbook, 'comedores.xlsx');

  mostrarNotificacion('Archivo Excel exportado con éxito', 'success');
}

// 9️⃣ Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', () => {
  const comedoresGuardados = JSON.parse(localStorage.getItem('comedores')) || [];
  listaComedores = comedoresGuardados;
  listaComedores.forEach(comedor => agregarFila(comedor));
  actualizarEstadisticas();
});

document.addEventListener('DOMContentLoaded', () => {
  const inputTelefono = document.getElementById('telefono');
  if (inputTelefono) {
    inputTelefono.addEventListener('input', function (e) {
      let valor = e.target.value.replace(/\D/g, '');

      // Forzar que comience con 9
      if (valor && valor[0] !== '9') {
        valor = '9' + valor.slice(1);
      }

      valor = valor.slice(0, 9);

      if (valor.length > 3 && valor.length <= 6) {
        valor = valor.replace(/(\d{3})(\d+)/, '$1-$2');
      } else if (valor.length > 6) {
        valor = valor.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3');
      }

      e.target.value = valor;
    });
  }
});
