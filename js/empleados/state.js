/**
 * state.js - Estado Global de la Aplicación
 * Manejo centralizado del estado, empleados y pantalla activa.
 */

export const state = {
  // Pantalla activa por defecto
  currentScreen: 'crear',

  // Consecutivo para folios automáticos del sistema (RN_87)
  folioSequence: 1004,

  // Usuario autenticado en sesión
  currentUser: {
    nombre: 'Elena Morales',
    rol: 'Gerente de Recursos Humanos',
    puedeAltasBajas: true, // RN_21
    puedeActualizarPermisos: true // RN_27
  },

  // Base de datos de empleados inicial (Mock DB)
  empleados: [
    {
      folio: 1001,
      nombre: 'Carlos Eduardo Ramírez',
      telefono: '5543219876',
      area: 'Administración',
      correo: 'carlos.ramirez@mundoalacarta.com',
      puesto: 'Gerente',
      claveContrato: 8492019,
      estatus: 'Activo', // Activo | Baja
      fechaAlta: '2023-01-15',
      fechaBaja: null,
      retencionHasta: null
    },
    {
      folio: 1002,
      nombre: 'Mariana Gómez Herrera',
      telefono: '5578901234',
      area: 'Ventas',
      correo: 'mariana.gomez@mundoalacarta.com',
      puesto: 'Empleado',
      claveContrato: 9384751,
      estatus: 'Activo',
      fechaAlta: '2023-06-20',
      fechaBaja: null,
      retencionHasta: null
    },
    {
      folio: 1003,
      nombre: 'Roberto Solís Vargas',
      telefono: '5598765432',
      area: 'Administración',
      correo: 'roberto.solis@mundoalacarta.com',
      puesto: 'Empleado',
      claveContrato: 6712390,
      estatus: 'Baja',
      fechaAlta: '2021-03-10',
      fechaBaja: '2024-02-01',
      retencionHasta: '2029-02-01' // 5 años (RN_28)
    }
  ],

  // Empleado seleccionado para Modificar, Baja o Consulta
  selectedEmployeeFolio: 1001,

  // Generador de folio automático para la pantalla Crear (RN_87)
  getNextFolio() {
    return this.folioSequence;
  },

  consumeNextFolio() {
    const assigned = this.folioSequence;
    this.folioSequence += 1;
    return assigned;
  },

  getSelectedEmployee() {
    return this.empleados.find(e => e.folio === Number(this.selectedEmployeeFolio)) || this.empleados[0];
  }
};
