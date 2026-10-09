/**
 * ui.js - Renderizado y Manipulación del DOM
 * Control de pantallas, sincronización de formularios, widgets flotantes y modales.
 */

import { state } from './state.js';
import { screenConfigs, topBarButtons } from './rules.js';

export const ui = {
  // Estado de apertura de los widgets flotantes
  isRnWidgetOpen: true,
  isButtonsWidgetOpen: true,

  /**
   * Cambia de pantalla activa y actualiza títulos, cabeceras y widgets
   */
  switchScreen(screenKey, btnElement = null) {
    state.currentScreen = screenKey;
    const config = screenConfigs[screenKey];
    if (!config) return;

    // 1. Título dinámico
    const titleEl = document.getElementById('main-title');
    if (titleEl) titleEl.innerHTML = config.title;

    // 2. Leyendas del código de caso de uso (CU_PA)
    const cuHeaderEl = document.getElementById('screen-cu-code');
    const cuBodyEl = document.getElementById('screen-cu-code-body');
    if (cuHeaderEl) cuHeaderEl.textContent = config.code;
    if (cuBodyEl) cuBodyEl.textContent = config.code;

    // 3. Estilos de botones de navegación lateral
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.className = 'nav-btn hover:text-orange-500 p-3 rounded-full transition hover:scale-105';
    });

    const activeBtn = btnElement || document.querySelector(`.nav-btn[data-screen="${screenKey}"]`);
    if (activeBtn) {
      activeBtn.className = 'nav-btn text-orange-500 bg-orange-100 p-3 rounded-full shadow-sm hover:scale-105 transition';
    }

    // 4. Mostrar/ocultar contenedores de pantalla
    ['crear-screen', 'modificar-screen', 'baja-screen', 'consulta-screen'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });

    const currentScreenEl = document.getElementById(`${screenKey}-screen`);
    if (currentScreenEl) currentScreenEl.classList.add('active');

    // 5. Ajustar controles de foto y etiquetas
    const photoBtn = document.getElementById('photo-upload-btn');
    const photoLabel = document.getElementById('photo-label');
    const folioBadge = document.getElementById('folio-display-badge');

    if (screenKey === 'crear') {
      if (photoBtn) photoBtn.style.display = 'flex';
      if (photoLabel) photoLabel.innerText = 'Subir foto del empleado';
      if (folioBadge) folioBadge.textContent = state.getNextFolio();
    } else {
      const emp = state.getSelectedEmployee();
      if (folioBadge) folioBadge.textContent = emp ? emp.folio : '---';

      if (screenKey === 'modificar') {
        if (photoBtn) photoBtn.style.display = 'flex';
        if (photoLabel) photoLabel.innerText = 'Actualizar foto';
        this.fillModificarForm(emp);
      } else if (screenKey === 'baja') {
        if (photoBtn) photoBtn.style.display = 'none';
        if (photoLabel) photoLabel.innerText = 'Foto del empleado';
        this.fillBajaView(emp);
      } else if (screenKey === 'consulta') {
        if (photoBtn) photoBtn.style.display = 'none';
        if (photoLabel) photoLabel.innerText = 'Foto del empleado';
        this.fillConsultaView(emp);
      }
    }

    // 6. Actualizar Widgets flotantes
    this.renderRnWidget(config.rules);
    this.renderButtonsWidget(config.buttons);
    this.updateEmployeeSelector();
  },

  /**
   * Carga los datos en el formulario de Modificar
   */
  fillModificarForm(emp) {
    if (!emp) return;
    const form = document.getElementById('form-modificar');
    if (!form) return;

    form.nombre.value = emp.nombre || '';
    form.telefono.value = emp.telefono || '';
    form.area.value = emp.area || '';
    form.correo.value = emp.correo || '';
    form.puesto.value = emp.puesto || '';
    form.claveContrato.value = emp.claveContrato || '';
  },

  /**
   * Carga los datos en la vista de Baja
   */
  fillBajaView(emp) {
    if (!emp) return;
    document.getElementById('baja-nombre').textContent = emp.nombre || 's(150)';
    document.getElementById('baja-telefono').textContent = emp.telefono || 's(12)';
    document.getElementById('baja-area').textContent = emp.area || 's(50)';
    document.getElementById('baja-correo').textContent = emp.correo || 's(50)';
    document.getElementById('baja-puesto').textContent = emp.puesto || 's(50)';
    document.getElementById('baja-clave').textContent = emp.claveContrato || 'int(10)';
  },

  /**
   * Carga los datos en la vista de Consulta
   */
  fillConsultaView(emp) {
    if (!emp) return;
    document.getElementById('consulta-nombre').textContent = emp.nombre || 's(150)';
    document.getElementById('consulta-telefono').textContent = emp.telefono || 's(12)';
    document.getElementById('consulta-area').textContent = emp.area || 's(50)';
    document.getElementById('consulta-correo').textContent = emp.correo || 's(50)';
    document.getElementById('consulta-puesto').textContent = emp.puesto || 's(50)';
    document.getElementById('consulta-clave').textContent = emp.claveContrato || 'int(10)';
  },

  /**
   * Renderiza el cuadro verde flotante de Reglas de Negocio
   */
  renderRnWidget(rules = []) {
    const listEl = document.getElementById('screen-rn-list');
    const countEl = document.getElementById('screen-rn-count');

    if (countEl) {
      countEl.textContent = `${rules.length} regla${rules.length !== 1 ? 's' : ''}`;
    }

    if (listEl) {
      listEl.innerHTML = rules.map(r => `
        <div class="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-emerald-200 shadow-xs hover:bg-emerald-50/50 transition-colors">
          <span class="bg-emerald-600 text-white font-mono font-bold text-xs px-2 py-0.5 rounded shadow-xs shrink-0 tracking-wide">${r.id}</span>
          <span class="text-xs text-gray-800 font-medium leading-relaxed">${r.text}</span>
        </div>
      `).join('');
    }
  },

  /**
   * Renderiza el cuadro azul flotante de Direccionamiento de Botones
   */
  renderButtonsWidget(screenButtons = []) {
    const listEl = document.getElementById('screen-buttons-list');
    const countEl = document.getElementById('screen-buttons-count');
    const allButtons = [...topBarButtons, ...screenButtons];

    if (countEl) {
      countEl.textContent = `${allButtons.length} botones`;
    }

    if (listEl) {
      listEl.innerHTML = allButtons.map(b => `
        <div class="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-blue-200 shadow-xs hover:bg-blue-50/50 transition-colors">
          <span class="bg-blue-600 text-white font-semibold text-xs px-2.5 py-0.5 rounded shadow-xs shrink-0 tracking-wide">
            ${b.name}
          </span>
          <span class="text-xs text-gray-800 font-medium leading-relaxed">${b.destination}</span>
        </div>
      `).join('');
    }
  },

  /**
   * Actualiza el selector de empleado activo para pruebas en vivo
   */
  updateEmployeeSelector() {
    const selector = document.getElementById('active-employee-select');
    if (!selector) return;

    selector.innerHTML = state.empleados.map(emp => `
      <option value="${emp.folio}" ${emp.folio === Number(state.selectedEmployeeFolio) ? 'selected' : ''}>
        Folio ${emp.folio}: ${emp.nombre} (${emp.estatus})
      </option>
    `).join('');
  },

  /**
   * Colapsa o expande el widget de Reglas de Negocio
   */
  toggleRnWidget() {
    this.isRnWidgetOpen = !this.isRnWidgetOpen;
    const body = document.getElementById('rn-widget-body');
    const arrow = document.getElementById('rn-widget-arrow');
    if (body && arrow) {
      if (this.isRnWidgetOpen) {
        body.classList.remove('hidden');
        arrow.classList.remove('rotate-180');
      } else {
        body.classList.add('hidden');
        arrow.classList.add('rotate-180');
      }
    }
  },

  /**
   * Colapsa o expande el widget de Direccionamiento de Botones
   */
  toggleButtonsWidget() {
    this.isButtonsWidgetOpen = !this.isButtonsWidgetOpen;
    const body = document.getElementById('buttons-widget-body');
    const arrow = document.getElementById('buttons-widget-arrow');
    if (body && arrow) {
      if (this.isButtonsWidgetOpen) {
        body.classList.remove('hidden');
        arrow.classList.remove('rotate-180');
      } else {
        body.classList.add('hidden');
        arrow.classList.add('rotate-180');
      }
    }
  },

  /**
   * Muestra mensaje flotante tipo Toast
   */
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fa-solid ${type === 'success' ? 'fa-circle-check text-emerald-600' : type === 'error' ? 'fa-circle-xmark text-red-600' : 'fa-circle-info text-orange-500'}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  /**
   * Abre el modal de confirmación de Baja
   */
  openBajaModal(onConfirm) {
    const modal = document.getElementById('baja-modal');
    const emp = state.getSelectedEmployee();
    const nameEl = document.getElementById('modal-employee-name');
    if (nameEl && emp) nameEl.textContent = `${emp.nombre} (Folio ${emp.folio})`;

    if (modal) modal.classList.add('open');

    const confirmBtn = document.getElementById('modal-confirm-baja-btn');
    const cancelBtn = document.getElementById('modal-cancel-baja-btn');

    const handleConfirm = () => {
      this.closeBajaModal();
      confirmBtn.removeEventListener('click', handleConfirm);
      onConfirm();
    };

    confirmBtn.onclick = handleConfirm;
    cancelBtn.onclick = () => this.closeBajaModal();
  },

  closeBajaModal() {
    const modal = document.getElementById('baja-modal');
    if (modal) modal.classList.remove('open');
  }
};
