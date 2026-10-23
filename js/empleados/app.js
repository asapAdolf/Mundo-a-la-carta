/**
 * app.js - Punto de Entrada del Proyecto JavaScript
 * Inicializa controladores de eventos, formularios y navegación.
 */

import { state } from './state.js';
import { ui } from './ui.js';
import { empleadosService } from './empleados.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar pantalla inicial (Crear empleado)
  ui.switchScreen('crear');

  // 2. Eventos de navegación lateral (botones con iconos)
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetScreen = btn.getAttribute('data-screen');
      if (targetScreen) {
        ui.switchScreen(targetScreen, btn);
      }
    });
  });

  // 3. Evento del selector de empleado activo (para pruebas de Modificar/Baja/Consulta)
  const employeeSelector = document.getElementById('active-employee-select');
  if (employeeSelector) {
    employeeSelector.addEventListener('change', (e) => {
      state.selectedEmployeeFolio = Number(e.target.value);
      ui.switchScreen(state.currentScreen);
    });
  }

  // 4. Formulario de ALTA (Crear Empleado)
  const formCrear = document.getElementById('form-crear');
  if (formCrear) {
    formCrear.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const formData = {
          nombre: formCrear.nombre.value,
          telefono: formCrear.telefono.value,
          area: formCrear.area.value,
          correo: formCrear.correo.value,
          puesto: formCrear.puesto.value,
          claveContrato: formCrear.claveContrato.value
        };

        const nuevo = empleadosService.crearEmpleado(formData);
        ui.showToast(`¡Empleado creado con éxito! Folio generado: ${nuevo.folio}`, 'success');

        // Limpiar formulario y direccionar a Consulta (CU_PA_04)
        formCrear.reset();
        ui.switchScreen('consulta');
      } catch (err) {
        ui.showToast(err.message, 'error');
      }
    });
  }

  // Botón Regresar de pantalla Crear -> Direcciona a Inicio
  const btnRegresarCrear = document.getElementById('btn-regresar-crear');
  if (btnRegresarCrear) {
    btnRegresarCrear.addEventListener('click', () => {
      ui.showToast('Regresando a Inicio...', 'info');
      if (formCrear) formCrear.reset();
    });
  }

  // 5. Formulario de MODIFICAR (Guardar Cambios)
  const formModificar = document.getElementById('form-modificar');
  if (formModificar) {
    formModificar.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const formData = {
          nombre: formModificar.nombre.value,
          telefono: formModificar.telefono.value,
          area: formModificar.area.value,
          correo: formModificar.correo.value,
          puesto: formModificar.puesto.value,
          claveContrato: formModificar.claveContrato.value
        };

        empleadosService.modificarEmpleado(state.selectedEmployeeFolio, formData);
        ui.showToast('Cambios aprobados por RRHH y guardados con éxito', 'success');

        // Direccionar a Consulta (CU_PA_04)
        ui.switchScreen('consulta');
      } catch (err) {
        ui.showToast(err.message, 'error');
      }
    });
  }

  // Botón Regresar de pantalla Modificar -> Direcciona a Crear Empleado (CU_PA_01)
  const btnRegresarModificar = document.getElementById('btn-regresar-modificar');
  if (btnRegresarModificar) {
    btnRegresarModificar.addEventListener('click', () => {
      ui.switchScreen('crear');
      ui.showToast('Modificación cancelada. Regresando a Crear empleado.', 'info');
    });
  }

  // 6. Pantalla BAJA (Botón 'Baja' con confirmación modal)
  const btnBaja = document.getElementById('btn-ejecutar-baja');
  if (btnBaja) {
    btnBaja.addEventListener('click', () => {
      ui.openBajaModal(() => {
        try {
          const emp = empleadosService.darDeBaja(state.selectedEmployeeFolio);
          ui.showToast(`Baja definitiva procesada. Credenciales revocadas. Folio ${emp.folio}`, 'success');
          ui.switchScreen('consulta');
        } catch (err) {
          ui.showToast(err.message, 'error');
        }
      });
    });
  }

  // Botón Regresar de pantalla Baja -> Direcciona a Crear Empleado (CU_PA_01)
  const btnRegresarBaja = document.getElementById('btn-regresar-baja');
  if (btnRegresarBaja) {
    btnRegresarBaja.addEventListener('click', () => {
      ui.switchScreen('crear');
    });
  }

  // 7. Pantalla CONSULTA (Botón Regresar) -> Direcciona a Crear Empleado (CU_PA_01)
  const btnRegresarConsulta = document.getElementById('btn-regresar-consulta');
  if (btnRegresarConsulta) {
    btnRegresarConsulta.addEventListener('click', () => {
      ui.switchScreen('crear');
    });
  }

  // 8. Toggles para widgets flotantes
  const headerRn = document.getElementById('rn-widget-header');
  if (headerRn) {
    headerRn.addEventListener('click', () => ui.toggleRnWidget());
  }

  const headerButtons = document.getElementById('buttons-widget-header');
  if (headerButtons) {
    headerButtons.addEventListener('click', () => ui.toggleButtonsWidget());
  }

  // 9. Clic en botones de la barra superior (Demostración de direccionamiento)
  document.querySelectorAll('[data-top-nav]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const target = el.getAttribute('data-top-nav');
      if (target === 'empleados') {
        ui.switchScreen('crear');
        ui.showToast('Navegando al ABC de empleados', 'info');
      } else {
        ui.showToast(`Dirección de ${target}: "No sé"`, 'info');
      }
    });
  });
});
