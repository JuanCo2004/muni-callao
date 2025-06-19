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
        
        const beneficiario = beneficiariosRegistrados.find(b => 
            b.dni === dni && b.nombre === nombre
        );
        
        if (beneficiario) {
            alert('ENTREGADO: Beneficiario registrado encontrado');
        } else {
            alert('USUARIO NO REGISTRADO: Verifique los datos');
        }
    });

    // Autocompletar nombre y comedor al ingresar DNI
   // Autocompletar nombre y comedor al ingresar DNI
document.getElementById('dni').addEventListener('blur', function() {
    const dni = this.value.trim(); // Elimina espacios
    if (dni.length === 8) {
        // Buscar beneficiario por DNI
        const beneficiario = beneficiariosRegistrados.find(b => b.dni === dni);
        if (beneficiario) {
            document.getElementById('nombre').value = beneficiario.nombre;
        } else {
            document.getElementById('nombre').value = ''; // Limpiar si no hay coincidencia
        }

        // Buscar si hay entrega previa y autocompletar comedor
        const entregasGuardadas = JSON.parse(localStorage.getItem('entregas')) || [];
        const ultimaEntrega = entregasGuardadas.find(e => e.dni === dni);
        if (ultimaEntrega) {
            document.getElementById('comedor').value = ultimaEntrega.comedor;
        } else {
            document.getElementById('comedor').value = ''; // Limpiar si no hay coincidencia
        }
    }
});


}); // ← ¡CIERRE FALTANTE!
