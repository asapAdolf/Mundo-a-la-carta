let subtotal = 0;

function switchScreen(screen) {
  document.querySelectorAll('.screen-content').forEach(function (el) {
    el.classList.remove('active');
  });

  document.querySelectorAll('.nav-btn').forEach(function (btn) {
    btn.className = 'nav-btn p-3 rounded-full hover:text-orange-500';
  });

  var titles = {
    venta: 'Vender <br> souvenirs',
    efectivo: 'Cobro en <br> efectivo',
    tarjeta: 'Cobro con <br> tarjeta'
  };
  document.getElementById('main-title').innerHTML = titles[screen];
  document.getElementById(screen + '-screen').classList.add('active');

  if (screen === 'venta') {
    document.getElementById('btn-venta').className =
      'nav-btn p-3 rounded-full text-orange-500 bg-orange-100 shadow-sm';
  }
  if (screen === 'efectivo') {
    document.getElementById('btn-efectivo').className =
      'nav-btn p-3 rounded-full text-orange-500 bg-orange-100 shadow-sm';
    document.getElementById('total-efectivo').textContent = subtotal.toFixed(2);
  }
  if (screen === 'tarjeta') {
    document.getElementById('btn-tarjeta').className =
      'nav-btn p-3 rounded-full text-orange-500 bg-orange-100 shadow-sm';
    document.getElementById('total-tarjeta').textContent = subtotal.toFixed(2);
  }
}

function calcularMontos() {
  var precio = Number(document.getElementById('souvenir').value) || 0;
  var cant = Number(document.getElementById('cantidad').value) || 0;
  subtotal = precio * cant;
  document.getElementById('precio-unitario').textContent = precio.toFixed(2);
  document.getElementById('subtotal').textContent = subtotal.toFixed(2);
}

function calcularCambio() {
  var recibido = Number(document.getElementById('monto-recibido').value) || 0;
  var cambio = recibido - subtotal;
  document.getElementById('cambio').textContent = (cambio >= 0 ? cambio : 0).toFixed(2);
}

function irACobro(tipo) {
  var cliente = document.getElementById('cliente').value.trim();
  if (!cliente) {
    alert('Ingresa el nombre del cliente');
    return;
  }
  if (subtotal <= 0) {
    alert('Selecciona un souvenir y una cantidad');
    return;
  }
  switchScreen(tipo);
}

function cobrarEfectivo() {
  var recibido = Number(document.getElementById('monto-recibido').value) || 0;
  if (recibido < subtotal) {
    alert('Monto insuficiente. Faltan $' + (subtotal - recibido).toFixed(2));
    return;
  }
  var cambio = recibido - subtotal;
  alert(
    '¡Cobro en efectivo exitoso!\n' +
    'Total: $' + subtotal.toFixed(2) + '\n' +
    'Recibido: $' + recibido.toFixed(2) + '\n' +
    'Cambio: $' + cambio.toFixed(2) + '\n\n' +
    'Ticket: Emitida'
  );
  reiniciar();
}

function cobrarTarjeta() {
  var titular = document.getElementById('titular').value.trim();
  var num = document.getElementById('num-tarjeta').value.trim();
  var venc = document.getElementById('vencimiento').value.trim();
  var cvv = document.getElementById('cvv').value.trim();

  if (!titular || !num || !venc || !cvv) {
    alert('Completa todos los datos de la tarjeta');
    return;
  }

  var aprobado = Math.random() > 0.2;
  if (aprobado) {
    var auth = 'AUT-' + Math.floor(Math.random() * 900000 + 100000);
    alert(
      '¡Pago APROBADO!\n' +
      'Titular: ' + titular + '\n' +
      'Total: $' + subtotal.toFixed(2) + '\n' +
      'Autorización: ' + auth + '\n\n' +
      'Ticket: Emitida'
    );
    reiniciar();
  } else {
    alert('Pago DECLINADO. Intenta de nuevo o cambia de método.');
  }
}

function reiniciar() {
  subtotal = 0;
  document.getElementById('cliente').value = '';
  document.getElementById('souvenir').value = '';
  document.getElementById('cantidad').value = 1;
  document.getElementById('precio-unitario').textContent = '0.00';
  document.getElementById('subtotal').textContent = '0.00';
  document.getElementById('monto-recibido').value = '';
  document.getElementById('cambio').textContent = '0.00';
  document.getElementById('titular').value = '';
  document.getElementById('num-tarjeta').value = '';
  document.getElementById('vencimiento').value = '';
  document.getElementById('cvv').value = '';
  switchScreen('venta');
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('souvenir').addEventListener('change', calcularMontos);
  document.getElementById('cantidad').addEventListener('input', calcularMontos);
  document.getElementById('monto-recibido').addEventListener('input', calcularCambio);
  switchScreen('venta');
});