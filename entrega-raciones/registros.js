// registros.js - Solo manejo de visualización (SIN guardar entregas)
document.addEventListener('DOMContentLoaded', function() {
    // 1. Obtener elementos del DOM
    const tabla = document.getElementById('tablaRaciones');
    
    // 2. Cargar registros existentes
    let entregas = JSON.parse(localStorage.getItem('entregas')) || [];
    
    // 3. Función para actualizar la tabla
    function actualizarTabla() {
        tabla.innerHTML = '';
        
        if (entregas.length === 0) {
            tabla.innerHTML = `
                <tr id="filaVacia">
                    <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                        <i class="fas fa-inbox text-4xl mb-4 text-gray-300 animate-bounce-custom"></i>
                        <p class="text-lg mb-2">No hay entregas registradas</p>
                    </td>
                </tr>`;
            return;
        }
        
        entregas.forEach((entrega, index) => {
            const fila = document.createElement('tr');
            fila.className = 'hover:bg-gray-50 transition-colors';
            fila.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${index + 1}</td>
                <td class="px-6 py-4 whitespace-nowrap">${entrega.dni}</td>
                <td class="px-6 py-4">${entrega.nombre}</td>
                <td class="px-6 py-4 whitespace-nowrap">${entrega.fecha}</td>
                <td class="px-6 py-4 whitespace-nowrap">${entrega.hora}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                        entrega.tipoDeRacion === 'desayuno' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-green-100 text-green-800'
                    }">
                        ${entrega.tipoDeRacion.charAt(0).toUpperCase() + entrega.tipoDeRacion.slice(1)}
                    </span>
                </td>
                <td class="px-6 py-4">${entrega.comedor}</td>
                <td class="px-6 py-4 whitespace-nowrap no-print">
                    <button data-id="${entrega.id}" class="btn-eliminar text-red-500 hover:text-red-700 mr-3">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>`;
            tabla.appendChild(fila);
        });
    }

    // 4. Función para refrescar datos desde localStorage
    function refrescarDatos() {
        entregas = JSON.parse(localStorage.getItem('entregas')) || [];
        actualizarTabla();
    }

    // 5. Función para eliminar entrega
    function eliminarEntrega(id) {
        const confirmacion = confirm('¿Está seguro de que desea eliminar esta entrega?');
        
        if (confirmacion) {
            // Filtrar entregas para eliminar la seleccionada
            entregas = entregas.filter(entrega => entrega.id !== parseInt(id));
            
            // Guardar en localStorage
            localStorage.setItem('entregas', JSON.stringify(entregas));
            
            // Actualizar tabla
            actualizarTabla();
            
            // Mostrar mensaje de confirmación
            alert('✅ Entrega eliminada correctamente');
        }
    }

    // 6. Event listener para botones de eliminar (delegación de eventos)
    tabla.addEventListener('click', function(e) {
        // Verificar si se hizo clic en un botón de eliminar o su icono
        const btnEliminar = e.target.closest('.btn-eliminar');
        
        if (btnEliminar) {
            const id = btnEliminar.getAttribute('data-id');
            eliminarEntrega(id);
        }
    });

    // 7. Cargar datos al iniciar
    actualizarTabla();
    
    // 8. Actualizar tabla cada vez que cambie localStorage (opcional)
    window.addEventListener('storage', refrescarDatos);
    
    // 9. Función pública para actualizar tabla (llamar desde otros archivos)
    window.actualizarTablaRaciones = refrescarDatos;
});

// Función para exportar a PDF
document.getElementById('btnExportar').addEventListener('click', function() {
    // Obtener datos actualizados
    const entregas = JSON.parse(localStorage.getItem('entregas')) || [];
    
    // Configuración del PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Título del documento
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text('Reporte de Entregas de Raciones', 105, 15, null, null, 'center');
    
    // Fecha de generación
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-PE')}`, 160, 25);
    
    // Datos de la tabla
    const headers = [
        "#", 
        "DNI", 
        "Beneficiario", 
        "Fecha", 
        "Hora", 
        "Tipo", 
        "Comedor"
    ];
    
    const data = entregas.map((entrega, index) => [
        index + 1,
        entrega.dni,
        entrega.nombre,
        entrega.fecha,
        entrega.hora,
        entrega.tipoDeRacion.toUpperCase(),
        entrega.comedor
    ]);
    
    // Configuración de la tabla
    doc.autoTable({
        head: [headers],
        body: data,
        startY: 40,
        styles: {
            fontSize: 8,
            cellPadding: 2,
            valign: 'middle'
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240]
        },
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 25 },
            2: { cellWidth: 50 },
            3: { cellWidth: 25 },
            4: { cellWidth: 20 },
            5: { cellWidth: 25 },
            6: { cellWidth: 40 }
        },
        margin: { top: 40 }
    });
    
    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${pageCount}`, 105, 285, null, null, 'center');
        doc.text('Municipalidad Provincial del Callao - Sistema de Raciones', 105, 290, null, null, 'center');
    }
    
    // Guardar el PDF
    doc.save(`Reporte_Entregas_${new Date().toISOString().slice(0,10)}.pdf`);
});