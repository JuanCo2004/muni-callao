//localstore

document.addEventListener('DOMContentLoaded', () => {
  // Obtener comedores desde localStorage
  const comedores = JSON.parse(localStorage.getItem('comedores')) || [];
  const beneficiarios = JSON.parse(localStorage.getItem('beneficiarios'))  || [];
  // Filtrar solo los comedores activos
  const comedoresActivos = comedores.filter(c => c.activo === true);
  

  // Mostrar la cantidad en el KPI
  const kpiComedores  = document.getElementById('comedores-activos');
  if (kpiComedores ) {
    kpiComedores .textContent = comedoresActivos.length;
  } 

 const kpibeneficiarios  = document.getElementById('beneficiarios-total');
  if (kpibeneficiarios ) {
    kpibeneficiarios .textContent = beneficiarios.length;
  }

  

});









document.addEventListener('DOMContentLoaded', () => {
  const hoy = new Date().toLocaleDateString('es-PE', {
    day: 'numeric', month: 'long', year: 'numeric'
  }); // Ej: "15 de junio de 2025"

  const comedores = JSON.parse(localStorage.getItem('comedores')) || [];
  const entregas = JSON.parse(localStorage.getItem('entregas')) || [];

  //  Filtrar entregas de hoy
  const entregasHoy = entregas.filter(e => e.fecha === hoy);

  //  Agrupar por comedor
  const entregasPorComedor = {};
  entregasHoy.forEach(e => {
    if (!entregasPorComedor[e.comedor]) {
      entregasPorComedor[e.comedor] = 0;
    }
    entregasPorComedor[e.comedor] += e.cantidad;
  });

  //  Ordenar por cantidad entregada (descendente)
  const comedoresActivos = Object.entries(entregasPorComedor)
    .sort((a, b) => b[1] - a[1]);

  //const comedores = JSON.parse(localStorage.getItem('comedores')) || [];

const totalActivos = comedores.filter(c => c.activo).length;
const totalInactivos = comedores.filter(c => !c.activo).length;

const canvas = document.getElementById('chart-comedores-activos');
canvas.height = 250;
const ctx = canvas.getContext('2d');

// Contar activos e inactivos
const activos = comedores.filter(c => c.activo).length;
const inactivos = comedores.filter(c => !c.activo).length;

new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: [`Activos (${activos})`, `Inactivos (${inactivos})`],
    datasets: [{
      data: [totalActivos, totalInactivos],
      backgroundColor: ['#28a745', '#dc3545'] // verde y rojo
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const valor = context.raw;
            const porcentaje = ((valor / total) * 100).toFixed(1);
            return `${context.label}: ${valor} (${porcentaje}%)`;
          }
        }
      },
      title: {
        display: true,
        text: 'Estado de Comedores (Activos vs Inactivos)'
      }
    }
  }

  
});



  

  //  Mostrar tabla de estado de comedores
  const tablaBody = document.getElementById('tabla-comedores-estado');
  tablaBody.innerHTML = ''; // limpiar

  comedores.forEach(comedor => {
    const entregasComedor = entregasHoy.filter(e => e.comedor === comedor.nombre);
    const entregasHoyCantidad = entregasComedor.reduce((sum, e) => sum + e.cantidad, 0);

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${comedor.nombre}</td>
      <td>${comedor.direccion || 'Zona no definida'}</td>
      <td>
        <span class="badge bg-${comedor.activo ? 'success' : 'secondary'}">
          ${comedor.activo ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td>${entregasHoyCantidad}</td>
    `;
    tablaBody.appendChild(row);
  });
});



// grafico Beneficiarios x Comedor

document.addEventListener('DOMContentLoaded', () => {
  const beneficiarios = JSON.parse(localStorage.getItem('beneficiarios')) || [];

  const conteoPorComedor = {};

  beneficiarios.forEach(b => {
    if (!conteoPorComedor[b.comedor]) {
      conteoPorComedor[b.comedor] = 0;
    }
    conteoPorComedor[b.comedor]++;
  });

  const nombresComedores = Object.keys(conteoPorComedor);
  const cantidades = Object.values(conteoPorComedor);

  const colores = nombresComedores.map(() => 'rgba(54, 162, 235, 0.7)');

  const ctx = document.getElementById('chart-beneficiarios-comedor').getContext('2d');
  new Chart(ctx, {
    type: 'bar', // ✅ Tipo de gráfico de barras
    data: {
      labels: nombresComedores,
      datasets: [{
        label: 'Cantidad de Beneficiarios',
        data: cantidades,
        backgroundColor: colores
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Beneficiarios por Comedor'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      }
    }
  });
});
