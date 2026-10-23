/**
 * rules.js - Catálogo de Reglas de Negocio y Direccionamiento de Botones
 * Define las reglas aplicables por pantalla y la matriz de navegación.
 */

export const topBarButtons = [
  { name: 'Empleados', destination: 'Al ABC de empleados' },
  { name: 'Inicio', destination: 'No sé' },
  { name: 'Experiencias', destination: 'No sé' },
  { name: 'Contacto', destination: 'No sé' },
  { name: 'Búsqueda', destination: 'No sé' },
  { name: 'Menú', destination: 'No sé' }
];

export const screenConfigs = {
  crear: {
    code: 'CU_PA_01_Alta_Empleados',
    title: 'Crear <br> empleado',
    rules: [
      { id: 'RN_21', text: 'Solo el Gerente de Recursos Humanos puede realizar altas y bajas de empleados.' },
      { id: 'RN_25', text: 'La contratación de empleados debe cumplir con los requisitos internos.' },
      { id: 'RN_29', text: 'Cada empleado debe tener un rol definido en el sistema.' },
      { id: 'RN_30', text: 'Los empleados no pueden compartir credenciales de acceso.' },
      { id: 'RN_87', text: 'El folio del empleado es generado automáticamente por el sistema al registrar el alta.' }
    ],
    buttons: [
      { name: 'Guardar', destination: 'Procesa el alta del empleado, almacena los datos y direcciona a <strong>Consulta de Empleado (CU_PA_04)</strong>.' },
      { name: 'Regresar', destination: 'Cancela la captura y direcciona a la pantalla principal / <strong>Inicio</strong> del sistema.' },
      { name: 'Subir foto (+)', destination: 'Abre el explorador de archivos local para seleccionar y cargar la foto del empleado.' },
      { name: 'Modificar', destination: 'Direcciona a la pantalla de <strong>Modificar Empleado (CU_PA_02_Modificacion_Empleados)</strong>.' },
      { name: 'Baja', destination: 'Direcciona a la pantalla de <strong>Baja de Empleado (CU_PA_03_Baja_Empleados)</strong>.' },
      { name: 'Consulta', destination: 'Direcciona a la pantalla de <strong>Consulta de Empleado (CU_PA_04_Consulta_Empleados)</strong>.' }
    ]
  },
  modificar: {
    code: 'CU_PA_02_Modificacion_Empleados',
    title: 'Modificar <br> empleado',
    rules: [
      { id: 'RN_24', text: 'Los cambios en los datos de los empleados deben ser aprobados por el departamento de Recursos Humanos.' },
      { id: 'RN_27', text: 'Solo el Gerente de Recursos Humanos puede actualizar permisos de acceso de los empleados.' },
      { id: 'RN_29', text: 'Cada empleado debe tener un rol definido en el sistema.' }
    ],
    buttons: [
      { name: 'Guardar cambios', destination: 'Actualiza los datos modificados en el sistema y direcciona a <strong>Consulta de Empleado (CU_PA_04)</strong>.' },
      { name: 'Regresar', destination: 'Descarta las modificaciones no guardadas y direcciona a <strong>Crear Empleado (CU_PA_01)</strong>.' },
      { name: 'Actualizar foto (+)', destination: 'Abre el explorador de archivos local para sustituir la fotografía del empleado.' },
      { name: 'Crear (+)', destination: 'Direcciona a la pantalla de <strong>Alta de Empleado (CU_PA_01_Alta_Empleados)</strong>.' },
      { name: 'Baja', destination: 'Direcciona a la pantalla de <strong>Baja de Empleado (CU_PA_03_Baja_Empleados)</strong>.' },
      { name: 'Consulta', destination: 'Direcciona a la pantalla de <strong>Consulta de Empleado (CU_PA_04_Consulta_Empleados)</strong>.' }
    ]
  },
  baja: {
    code: 'CU_PA_03_Baja_Empleados',
    title: 'Baja <br> empleado',
    rules: [
      { id: 'RN_21', text: 'Solo el Gerente de Recursos Humanos puede realizar altas y bajas de empleados.' },
      { id: 'RN_22', text: 'Un empleado dado de baja no puede acceder al sistema.' },
      { id: 'RN_26', text: 'La baja de un empleado revoca inmediatamente todos sus accesos al sistema.' },
      { id: 'RN_28', text: 'Los registros de empleados dados de baja deben mantenerse en el sistema durante al menos 5 años.' }
    ],
    buttons: [
      { name: 'Baja', destination: 'Aplica la baja del empleado en el sistema, revoca credenciales y direcciona a confirmación / lista de empleados.' },
      { name: 'Regresar', destination: 'Cancela la operación de baja y regresa a <strong>Crear Empleado (CU_PA_01_Alta_Empleados)</strong>.' },
      { name: 'Crear (+)', destination: 'Direcciona a la pantalla de <strong>Alta de Empleado (CU_PA_01_Alta_Empleados)</strong>.' },
      { name: 'Modificar', destination: 'Direcciona a la pantalla de <strong>Modificar Empleado (CU_PA_02_Modificacion_Empleados)</strong>.' },
      { name: 'Consulta', destination: 'Direcciona a la pantalla de <strong>Consulta de Empleado (CU_PA_04_Consulta_Empleados)</strong>.' }
    ]
  },
  consulta: {
    code: 'CU_PA_04_Consulta_Empleados',
    title: 'Consulta <br> empleado',
    rules: [
      { id: 'RN_23', text: 'La información de los empleados solo puede ser consultada por usuarios con el rol correspondiente.' },
      { id: 'RN_28', text: 'Los registros de empleados dados de baja deben mantenerse en el sistema durante al menos 5 años.' }
    ],
    buttons: [
      { name: 'Regresar', destination: 'Cierra la vista de detalle y direcciona a la pantalla de <strong>Crear Empleado (CU_PA_01_Alta_Empleados)</strong>.' },
      { name: 'Crear (+)', destination: 'Direcciona a la pantalla de <strong>Alta de Empleado (CU_PA_01_Alta_Empleados)</strong>.' },
      { name: 'Modificar', destination: 'Direcciona a la pantalla de <strong>Modificar Empleado (CU_PA_02_Modificacion_Empleados)</strong>.' },
      { name: 'Baja', destination: 'Direcciona a la pantalla de <strong>Baja de Empleado (CU_PA_03_Baja_Empleados)</strong>.' }
    ]
  }
};
