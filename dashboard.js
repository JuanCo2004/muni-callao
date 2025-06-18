//localstore
let chartTiposRacion; // Variable global

function actualizarGraficoTiposRacion(data) {
  const conteo = { desayuno: 0, almuerzo: 0 };
  data.forEach((e) => {
    if (e.tipoDeRacion === "desayuno") conteo.desayuno++;
    if (e.tipoDeRacion === "almuerzo") conteo.almuerzo++;
  });

  if (chartTiposRacion) {
    chartTiposRacion.data.datasets[0].data = [conteo.desayuno, conteo.almuerzo];
    chartTiposRacion.update();
  }
}


document.addEventListener("DOMContentLoaded", () => {
  // Obtener comedores desde localStorage
  const comedores = JSON.parse(localStorage.getItem("comedores")) || [];
  const beneficiarios = JSON.parse(localStorage.getItem("beneficiarios")) || [];
  const entregas = JSON.parse(localStorage.getItem("entregas")) || [];
  // Filtrar solo los comedores activos
  const comedoresActivos = comedores.filter((c) => c.activo === true);
  // Inicializar gráfico una vez
  const ctx = document.getElementById("chart-tipos-racion").getContext("2d");
  chartTiposRacion = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Desayuno", "Almuerzo"],
      datasets: [
        {
          label: "Cantidad entregada",
          data: [0, 0], // valores iniciales
          backgroundColor: ["#fbbf24", "#10b981"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Tipos de Ración Entregadas",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 },
        },
      },
    },
  });

  actualizarGraficoTiposRacion(entregas); // Mostrar datos al inicio

  document.getElementById("apply-filters").addEventListener("click", () => {
    const desde = document.getElementById("filter-fecha-desde").value;
    const hasta = document.getElementById("filter-fecha-hasta").value;
    const tipo = document.getElementById("filter-tipo-racion").value;

    const filtradas = entregas.filter((e) => {
      const fechaEntrega = new Date(e.fecha.split("/").reverse().join("-"));
      const fechaDesde = desde ? new Date(desde) : null;
      const fechaHasta = hasta ? new Date(hasta) : null;

      const cumpleFecha =
        (!fechaDesde || fechaEntrega >= fechaDesde) &&
        (!fechaHasta || fechaEntrega <= fechaHasta);

      const cumpleTipo = !tipo || e.tipoDeRacion === tipo;

      return cumpleFecha && cumpleTipo;
    });

    document.getElementById("total-raciones").textContent = filtradas.length;
    actualizarGraficoTiposRacion(filtradas);
  });

  document.getElementById("clear-filters").addEventListener("click", () => {
    document.getElementById("filter-fecha-desde").value = "";
    document.getElementById("filter-fecha-hasta").value = "";
    document.getElementById("filter-tipo-racion").value = "";
    document.getElementById("total-raciones").textContent = entregas.length;
    actualizarGraficoTiposRacion(entregas);
  });

  // Filtrar entregas de hoy
  const hoy = `${new Date().getDate()}/${new Date().getMonth() + 1
    }/${new Date().getFullYear()}`;

  const entregasHoy = entregas.filter((e) => e.fecha === hoy);
  const totalHoy = entregasHoy.reduce((sum, e) => sum + (e.cantidad || 1), 0);

  // Promedio diario
  const entregasPorFecha = {};
  entregas.forEach((e) => {
    if (!entregasPorFecha[e.fecha]) entregasPorFecha[e.fecha] = 0;
    entregasPorFecha[e.fecha] += e.cantidad || 1;
  });
  const dias = Object.keys(entregasPorFecha).length;
  const totalEntregas = entregas.reduce((sum, e) => sum + (e.cantidad || 1), 0);
  const promedio = dias > 0 ? Math.round(totalEntregas / dias) : 0;

  // Mostrar la cantidad en el KPI
  const kpiComedores = document.getElementById("comedores-activos");
  if (kpiComedores) {
    kpiComedores.textContent = comedoresActivos.length;
  }

  const kpibeneficiarios = document.getElementById("beneficiarios-total");
  if (kpibeneficiarios) {
    kpibeneficiarios.textContent = beneficiarios.length;
  }

  const kpientregas = document.getElementById("total-raciones");
  if (kpientregas) {
    kpientregas.textContent = entregas.length;
  }

  const kpitotalhoy = document.getElementById("entregas-hoy");
  if (kpitotalhoy) {
    kpitotalhoy.textContent = totalHoy;
  }

  const kpiPromedio = document.getElementById("promedio-diario");
  if (kpiPromedio) {
    kpiPromedio.textContent = promedio;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const hoy = new Date().toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }); // Ej: "15 de junio de 2025"

  const comedores = JSON.parse(localStorage.getItem("comedores")) || [];
  const entregas = JSON.parse(localStorage.getItem("entregas")) || [];

  //  Filtrar entregas de hoy
  const entregasHoy = entregas.filter((e) => e.fecha === hoy);

  //  Agrupar por comedor
  const entregasPorComedor = {};
  entregasHoy.forEach((e) => {
    if (!entregasPorComedor[e.comedor]) {
      entregasPorComedor[e.comedor] = 0;
    }
    entregasPorComedor[e.comedor] += e.cantidad;
  });

  //  Ordenar por cantidad entregada (descendente)
  const comedoresActivos = Object.entries(entregasPorComedor).sort(
    (a, b) => b[1] - a[1]
  );

  //const comedores = JSON.parse(localStorage.getItem('comedores')) || [];

  const totalActivos = comedores.filter((c) => c.activo).length;
  const totalInactivos = comedores.filter((c) => !c.activo).length;

  const canvas = document.getElementById("chart-comedores-activos");
  canvas.height = 250;
  const ctx = canvas.getContext("2d");

  // Contar activos e inactivos
  const activos = comedores.filter((c) => c.activo).length;
  const inactivos = comedores.filter((c) => !c.activo).length;

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: [`Activos (${activos})`, `Inactivos (${inactivos})`],
      datasets: [
        {
          data: [totalActivos, totalInactivos],
          backgroundColor: ["#28a745", "#dc3545"], // verde y rojo
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const total = context.dataset.data.reduce(
                (sum, val) => sum + val,
                0
              );
              const valor = context.raw;
              const porcentaje = ((valor / total) * 100).toFixed(1);
              return `${context.label}: ${valor} (${porcentaje}%)`;
            },
          },
        },
        title: {
          display: true,
          text: "Estado de Comedores (Activos vs Inactivos)",
        },
      },
    },
  });

  //  Mostrar tabla de estado de comedores
  const tablaBody = document.getElementById("tabla-comedores-estado");
  tablaBody.innerHTML = ""; // limpiar

  comedores.forEach((comedor) => {
    const entregasComedor = entregasHoy.filter(
      (e) => e.comedor === comedor.nombre
    );
    const entregasHoyCantidad = entregasComedor.reduce(
      (sum, e) => sum + e.cantidad,
      0
    );

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${comedor.nombre}</td>
      <td>${comedor.direccion || "Zona no definida"}</td>
      <td>
        <span class="badge bg-${comedor.activo ? "success" : "secondary"}">
          ${comedor.activo ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td>${entregasHoyCantidad}</td>
    `;
    tablaBody.appendChild(row);
  });
});

// grafico Beneficiarios x Comedor

document.addEventListener("DOMContentLoaded", () => {
  const beneficiarios = JSON.parse(localStorage.getItem("beneficiarios")) || [];

  const conteoPorComedor = {};

  beneficiarios.forEach((b) => {
    if (!conteoPorComedor[b.comedor]) {
      conteoPorComedor[b.comedor] = 0;
    }
    conteoPorComedor[b.comedor]++;
  });

  const nombresComedores = Object.keys(conteoPorComedor);
  const cantidades = Object.values(conteoPorComedor);

  const colores = nombresComedores.map(() => "rgba(54, 162, 235, 0.7)");

  const ctx = document
    .getElementById("chart-beneficiarios-comedor")
    .getContext("2d");
  new Chart(ctx, {
    type: "bar", // ✅ Tipo de gráfico de barras
    data: {
      labels: nombresComedores,
      datasets: [
        {
          label: "Cantidad de Beneficiarios",
          data: cantidades,
          backgroundColor: colores,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Beneficiarios por Comedor",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 },
        },
      },
    },
  });
});

// grafico de racio de beneficiarios por comedor
// ...existing code...

document.addEventListener("DOMContentLoaded", () => {
  // Obtener entregas desde localStorage
  const entregas = JSON.parse(localStorage.getItem("entregas")) || [];

  // Contar tipos de ración
  const conteo = { desayuno: 0, almuerzo: 0 };
  entregas.forEach((e) => {
    if (e.tipoDeRacion === "desayuno") conteo.desayuno++;
    if (e.tipoDeRacion === "almuerzo") conteo.almuerzo++;
  });

  // Crear gráfico de barras
  const ctx = document.getElementById("chart-tipos-racion").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Desayuno", "Almuerzo"],
      datasets: [
        {
          label: "Cantidad entregada",
          data: [conteo.desayuno, conteo.almuerzo],
          backgroundColor: ["#fbbf24", "#10b981"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Tipos de Ración Entregadas",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 },
        },
      },
    },
  });
});