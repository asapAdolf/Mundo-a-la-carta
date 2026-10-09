/**
 * empleados.js - Lógica de Negocio y Operaciones CRUD
 * Implementa las validaciones, reglas de negocio y mutaciones del estado.
 */

import { state } from './state.js';

export const empleadosService = {
  /**
   * RN_21 & RN_25 & RN_29 & RN_30 & RN_87: Alta de empleado
   */
  crearEmpleado(datos) {
    if (!state.currentUser.puedeAltasBajas) {
      throw new Error('RN_21: Solo el Gerente de Recursos Humanos puede realizar altas de empleados.');
    }

    // Validar campos obligatorios con asterisco (*)
    const obligatorios = ['nombre', 'telefono', 'area', 'correo', 'puesto', 'claveContrato'];
    for (const campo of obligatorios) {
      if (!datos[campo] || String(datos[campo]).trim() === '') {
        throw new Error(`El campo '${campo}' es obligatorio (*).`);
      }
    }

    // RN_87: El folio es asignado automáticamente por el sistema
    const nuevoFolio = state.consumeNextFolio();

    const nuevoEmpleado = {
      folio: nuevoFolio,
      nombre: datos.nombre.trim(),
      telefono: datos.telefono.trim(),
      area: datos.area,
      correo: datos.correo.trim(),
      puesto: datos.puesto,
      claveContrato: Number(datos.claveContrato) || datos.claveContrato,
      estatus: 'Activo',
      fechaAlta: new Date().toISOString().split('T')[0],
      fechaBaja: null,
      retencionHasta: null
    };

    state.empleados.push(nuevoEmpleado);
    state.selectedEmployeeFolio = nuevoFolio;

    return nuevoEmpleado;
  },

  /**
   * RN_24 & RN_27 & RN_29: Modificar datos de empleado
   */
  modificarEmpleado(folio, datosModificados) {
    if (!state.currentUser.puedeActualizarPermisos) {
      throw new Error('RN_27: Solo el Gerente de Recursos Humanos puede modificar permisos y datos.');
    }

    const empleado = state.empleados.find(e => e.folio === Number(folio));
    if (!empleado) {
      throw new Error('Empleado no encontrado.');
    }

    // RN_24: Los cambios deben ser aprobados por Recursos Humanos (auditados)
    if (datosModificados.nombre) empleado.nombre = datosModificados.nombre.trim();
    if (datosModificados.telefono) empleado.telefono = datosModificados.telefono.trim();
    if (datosModificados.area) empleado.area = datosModificados.area;
    if (datosModificados.correo) empleado.correo = datosModificados.correo.trim();
    if (datosModificados.puesto) empleado.puesto = datosModificados.puesto;
    if (datosModificados.claveContrato) empleado.claveContrato = datosModificados.claveContrato;

    return empleado;
  },

  /**
   * RN_21 & RN_22 & RN_26 & RN_28: Baja definitiva de empleado
   */
  darDeBaja(folio) {
    if (!state.currentUser.puedeAltasBajas) {
      throw new Error('RN_21: Solo el Gerente de Recursos Humanos puede realizar bajas de empleados.');
    }

    const empleado = state.empleados.find(e => e.folio === Number(folio));
    if (!empleado) {
      throw new Error('Empleado no encontrado para procesar baja.');
    }

    // Actualizar estatus y aplicar retención de 5 años
    const hoy = new Date();
    const fechaRetencion = new Date(hoy);
    fechaRetencion.setFullYear(hoy.getFullYear() + 5);

    empleado.estatus = 'Baja';
    empleado.fechaBaja = hoy.toISOString().split('T')[0];
    empleado.retencionHasta = fechaRetencion.toISOString().split('T')[0]; // RN_28

    return empleado;
  },

  /**
   * RN_23 & RN_28: Consultar empleado con validación
   */
  consultarEmpleado(folio) {
    const empleado = state.empleados.find(e => e.folio === Number(folio));
    if (!empleado) return null;

    if (empleado.estatus === 'Baja' && empleado.retencionHasta) {
      const limite = new Date(empleado.retencionHasta);
      if (new Date() > limite) {
        throw new Error('RN_28: El registro ha superado el periodo legal de retención de 5 años.');
      }
    }

    return empleado;
  }
};
