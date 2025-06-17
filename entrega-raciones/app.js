document.addEventListener('DOMContentLoaded', function() {
      const beneficiariosRegistrados = [
        { dni: '12345678', nombre: 'MARIA GARCIA PEREZ' },
        { dni: '23456789', nombre: 'JUAN LOPEZ MARTINEZ' },
        { dni: '34567890', nombre: 'ANA RODRIGUEZ SANCHEZ' },
        { dni: '45678901', nombre: 'CARLOS FERNANDEZ GOMEZ' },
        { dni: '56789012', nombre: 'LUCIA DIAZ RUIZ' },
        { dni: '67890123', nombre: 'PEDRO MARTINEZ HERNANDEZ' },
        { dni: '78901234', nombre: 'SOFIA GONZALEZ JIMENEZ' },
        { dni: '89012345', nombre: 'DAVID SANCHEZ MORENO' },
        { dni: '90123456', nombre: 'ELENA ROMERO ALVAREZ' },
        { dni: '01234567', nombre: 'JORGE NAVARRO BLANCO' }
    ];

    // Verificar beneficiario al enviar el formulario
    document.getElementById('formRaciones').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const dni = document.getElementById('dni').value;
        const nombre = document.getElementById('nombre').value.toUpperCase();
        
        // Buscar coincidencia exacta de DNI y nombre
        const beneficiario = beneficiariosRegistrados.find(b => 
            b.dni === dni && b.nombre === nombre
        );
        
        if (beneficiario) {
            alert('ENTREGADO: Beneficiario registrado encontrado');
        } else {
            alert('USUARIO NO REGISTRADO: Verifique los datos');
        }
    });

    // Opcional: Autocompletar nombre al ingresar DNI
    document.getElementById('dni').addEventListener('blur', function() {
        const dni = this.value;
        if (dni.length === 8) {
            const beneficiario = beneficiariosRegistrados.find(b => b.dni === dni);
            if (beneficiario) {
                document.getElementById('nombre').value = beneficiario.nombre;
            }
        }
    });

    
    // Verificar beneficiario por DNI usando keyup
    document.getElementById('dni').addEventListener('keyup', function() {
        const dni = this.value.trim();
        
        // Solo buscar si tiene 8 dígitos o más
        if (dni.length >= 8) {
            try {
                const beneficiarios = JSON.parse(localStorage.getItem('beneficiarios')) || [];
                const beneficiario = beneficiarios.find(b => b.dni === dni);
                
                if (beneficiario) {
                    // Llenar campos automáticamente
                    const nombreCompleto = `${beneficiario.nombre} ${beneficiario.apellidos}`.toUpperCase();
                    document.getElementById('nombre').value = nombreCompleto;
                    
                    // Establecer comedor
                    const comedorSelect = document.getElementById('comedor');
                    comedorSelect.innerHTML = `<option value="">Seleccione un comedor</option>
                                              <option value="${beneficiario.comedor}" selected>${beneficiario.comedor}</option>`;
                } else {
                    // Limpiar campos si no encuentra beneficiario
                    document.getElementById('nombre').value = '';
                    document.getElementById('comedor').innerHTML = '<option value="">Seleccione un comedor</option>';
                }
            } catch (error) {
                console.error('Error al buscar beneficiario:', error);
            }
        } else {
            // Limpiar campos si DNI es muy corto
            document.getElementById('nombre').value = '';
            document.getElementById('comedor').innerHTML = '<option value="">Seleccione un comedor</option>';
        }
    });

    // Enviar formulario
    document.getElementById('formRaciones').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const dni = document.getElementById('dni').value.trim();
        const nombre = document.getElementById('nombre').value.trim();
        const tipoRacion = document.getElementById('tipoDeRacion').value;
        const comedor = document.getElementById('comedor').value;
        
        // Validaciones básicas
        if (!dni || !nombre || !tipoRacion || !comedor) {
            alert('Por favor, complete todos los campos');
            return;
        }
        
        // Verificar que existe el beneficiario
        try {
            const beneficiarios = JSON.parse(localStorage.getItem('beneficiarios')) || [];
            const beneficiario = beneficiarios.find(b => b.dni === dni);
            
            if (beneficiario) {
                // Guardar entrega
                const entregas = JSON.parse(localStorage.getItem('entregas')) || [];
                
                entregas.push({
                    id: Date.now(),
                    dni: dni,
                    nombre: nombre,
                    tipoDeRacion: tipoRacion,
                    comedor: comedor,
                    fecha: new Date().toLocaleDateString('es-PE'),
                    hora: new Date().toLocaleTimeString('es-PE')
                });
                
                localStorage.setItem('entregas', JSON.stringify(entregas));
                
                alert('✅ ENTREGA REGISTRADA EXITOSAMENTE');
                
                // Actualizar tabla si existe la función
                if (typeof window.actualizarTablaRaciones === 'function') {
                    window.actualizarTablaRaciones();
                }
                
                // Limpiar formulario
                this.reset();
                
            } else {
                alert('❌ DNI no registrado en el sistema');
            }
        } catch (error) {
            alert('❌ Error al procesar la entrega');
            console.error(error);
        }
    });

    // Botón limpiar
    document.getElementById('btnLimpiar').addEventListener('click', function() {
        document.getElementById('formRaciones').reset();
    });

    // Enfocar en DNI al cargar
    document.getElementById('dni').focus();
});