/* ═══════════════════════════════════════════════════════════
   ESENCIA BELLEZA · app.js
   Cart, API, WhatsApp, Animations, Petals
═══════════════════════════════════════════════════════════ */

// ─── Config ───────────────────────────────────────────────
const API_URL = window.APP_CONFIG?.apiUrl || 'https://esencia-belleza-api.onrender.com';
const WA_NUMBER = '526633227770';

// ─── State ────────────────────────────────────────────────
let carrito = [];
let serviciosData = [];
let categoriaActiva = 'todos';
let tipoAgenda = 'junto';

// ═══════════════════════════════════════════════════════════
// PÉTALO PARTICLES
// ═══════════════════════════════════════════════════════════
function crearPetalos() {
  const container = document.getElementById('petals');
  const colores = [
    'rgba(201,151,122,0.5)',
    'rgba(232,196,176,0.6)',
    'rgba(212,168,67,0.4)',
    'rgba(122,153,130,0.4)',
    'rgba(249,168,212,0.5)',
  ];

  for (let i = 0; i < 18; i++) {
    const petal = document.createElement('div');
    petal.className = 'petal';
    const color = colores[Math.floor(Math.random() * colores.length)];
    const size = Math.random() * 10 + 6;
    petal.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      animation-duration: ${Math.random() * 12 + 10}s;
      animation-delay: ${Math.random() * 15}s;
      border-radius: ${Math.random() > 0.5 ? '50% 0 50% 0' : '50% 50% 0 50%'};
    `;
    container.appendChild(petal);
  }
}

// ═══════════════════════════════════════════════════════════
// NAV SCROLL
// ═══════════════════════════════════════════════════════════
function initNav() {
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
}

function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
}

// ═══════════════════════════════════════════════════════════
// SCROLL REVEAL
// ═══════════════════════════════════════════════════════════
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(el => {
      if (el.isIntersecting) {
        el.target.classList.add('visible');
        observer.unobserve(el.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ═══════════════════════════════════════════════════════════
// SERVICIOS — cargar desde API o fallback local
// ═══════════════════════════════════════════════════════════
const SERVICIOS_LOCAL = [
  { id:1, categoria:'masajes', nombre:'Masaje Relajante', descripcion:'Libera tensión y estrés. Tu cuerpo merece descanso profundo.', precio_min:300, precio_max:300, horario_especial:'L-V 10am-7pm · S-D 10am-5pm' },
  { id:2, categoria:'masajes', nombre:'Masaje Reductivo', descripcion:'Moldea tu figura y activa la circulación. Resultados desde la primera sesión.', precio_min:400, precio_max:400, horario_especial:'L-V 10am-7pm · S-D 10am-5pm' },
  { id:3, categoria:'masajes', nombre:'Masaje Linfático', descripcion:'Elimina toxinas y reduce retención de líquidos. Ideal post-operatorio.', precio_min:400, precio_max:400, horario_especial:'L-V 10am-7pm · S-D 10am-5pm' },
  { id:4, categoria:'facial', nombre:'Facial Profundo', descripcion:'Limpieza profunda, extracción y nutrición. Tu piel renovada.', precio_min:450, precio_max:450, horario_especial:'L-V 10am-7pm' },
  { id:5, categoria:'facial', nombre:'Eliminación de Verrugas', descripcion:'Procedimiento seguro y efectivo para remover verrugas.', precio_min:350, precio_max:350, horario_especial:'L-V 9am-7pm' },
  { id:6, categoria:'unas', nombre:'Uñas Acrílicas', descripcion:'Extensiones perfectas con acabado profesional. ¡Chicas desde $350!', precio_min:350, precio_max:350, horario_especial:'L-V 6pm-9pm · S-D 10am-5pm' },
  { id:7, categoria:'unas', nombre:'Pedicure', descripcion:'Exfoliación, hidratación y esmaltado perfecto para tus pies.', precio_min:350, precio_max:350, horario_especial:'L-V 6pm-9pm · S-D 10am-5pm' },
  { id:8, categoria:'cabello', nombre:'Tinte Color Sólido', descripcion:'Un solo tono parejo de raíz a puntas. Renueva tu color.', precio_min:480, precio_max:900, horario_especial:'L-V 10am-7pm · S 10am-5pm' },
  { id:9, categoria:'cabello', nombre:'Retoque (incluye Baño de Color)', descripcion:'Retoca tu raíz con el mismo tono y finaliza con brillo total.', precio_min:480, precio_max:900, horario_especial:'L-V 10am-7pm · S 10am-5pm' },
  { id:10, categoria:'cabello', nombre:'Retoque con Decoloración', descripcion:'Para quienes mantienen tonos rubios o aclarados.', precio_min:810, precio_max:1620, horario_especial:'L-V 10am-7pm · S 10am-5pm' },
  { id:11, categoria:'cabello', nombre:'Baño de Color (Gloss)', descripcion:'Hidrata y da brillo intenso con pigmento semipermanente.', precio_min:250, precio_max:400, horario_especial:'L-V 10am-7pm · S 10am-5pm' },
  { id:12, categoria:'cabello', nombre:'Baño de Color + Tratamiento Esencial', descripcion:'Gloss + tratamiento nutritivo. Cabello suave y brillante.', precio_min:520, precio_max:750, horario_especial:'L-V 10am-7pm · S 10am-5pm' },
  { id:13, categoria:'cabello', nombre:'Baño de Color + Tratamiento Profundo', descripcion:'Para cabellos dañados que necesitan restauración completa.', precio_min:680, precio_max:950, horario_especial:'L-V 10am-7pm · S 10am-5pm' },
];

const CAT_LABELS = {
  masajes: '🤲 Masajes',
  facial: '✨ Facial',
  unas: '💅 Uñas',
  cabello: '💇 Cabello',
};

async function cargarServicios() {
  try {
    const res = await fetch(`${API_URL}/api/servicios`, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const { data } = await res.json();
      serviciosData = data;
    } else {
      serviciosData = SERVICIOS_LOCAL;
    }
  } catch {
    serviciosData = SERVICIOS_LOCAL;
  }
  renderServicios();
}

function renderServicios() {
  const grid = document.getElementById('serviciosGrid');
  const filtrados = categoriaActiva === 'todos'
    ? serviciosData
    : serviciosData.filter(s => s.categoria === categoriaActiva);

  if (filtrados.length === 0) {
    grid.innerHTML = '<div class="loading-spinner">No hay servicios en esta categoría</div>';
    return;
  }

  grid.innerHTML = filtrados.map((s, i) => {
    const enCarrito = carrito.some(c => c.id === s.id);
    const precio = s.precio_min === s.precio_max
      ? `$${s.precio_min}`
      : `$${s.precio_min} – $${s.precio_max}`;

    return `
    <div class="servicio-card ${enCarrito ? 'en-carrito' : ''} reveal"
         style="animation-delay:${i * 0.05}s"
         id="card-${s.id}">
      <div class="servicio-cat-tag">${CAT_LABELS[s.categoria] || s.categoria}</div>
      <div class="servicio-nombre">${s.nombre}</div>
      <div class="servicio-desc">${s.descripcion}</div>
      <div class="servicio-horario">🕐 ${s.horario_especial || 'Consultar horario'}</div>
      <div class="servicio-footer">
        <div class="servicio-precio">
          ${precio}
          <small>MXN</small>
        </div>
        <button class="btn-agregar ${enCarrito ? 'added' : ''}"
                onclick="toggleCarrito(${s.id})"
                id="btn-${s.id}">
          <span class="icon">${enCarrito ? '✕' : '+'}</span>
          ${enCarrito ? 'Quitar' : 'Agregar'}
        </button>
      </div>
    </div>`;
  }).join('');

  // Re-observe reveal elements
  initReveal();
}

// ═══════════════════════════════════════════════════════════
// CARRITO
// ═══════════════════════════════════════════════════════════
function toggleCarrito(id) {
  const servicio = serviciosData.find(s => s.id === id);
  if (!servicio) return;

  const idx = carrito.findIndex(c => c.id === id);
  if (idx === -1) {
    carrito.push(servicio);
    mostrarToast(`✿ ${servicio.nombre} agregado`);
  } else {
    carrito.splice(idx, 1);
    mostrarToast(`Eliminado del carrito`);
  }

  actualizarBadge();
  renderServicios();
}

function actualizarBadge() {
  const badge = document.getElementById('cartBadge');
  const flotante = document.getElementById('carritoFlotante');
  const count = document.getElementById('carritoCount');
  const total = document.getElementById('carritoTotal');

  if (carrito.length === 0) {
    badge.style.display = 'none';
    flotante.style.display = 'none';
    return;
  }

  badge.style.display = 'flex';
  badge.textContent = carrito.length;
  flotante.style.display = 'flex';

  const precioTotal = carrito.reduce((sum, s) => sum + s.precio_min, 0);
  count.textContent = `${carrito.length} servicio${carrito.length > 1 ? 's' : ''}`;
  total.textContent = `desde $${precioTotal}`;
}

function abrirCarrito() {
  if (carrito.length === 0) {
    mostrarToast('Agrega al menos un servicio primero 🌸');
    document.getElementById('servicios').scrollIntoView({ behavior: 'smooth' });
    return;
  }
  document.getElementById('modalOverlay').classList.add('active');
  document.getElementById('modalCarrito').classList.add('active');
  document.body.style.overflow = 'hidden';
  renderCarritoModal();
  // Mostrar paso 1
  document.getElementById('paso1').style.display = 'block';
  document.getElementById('paso2').style.display = 'none';
}

function cerrarCarrito() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.getElementById('modalCarrito').classList.remove('active');
  document.body.style.overflow = '';
}

function renderCarritoModal() {
  const items = document.getElementById('carritoItems');
  const total = document.getElementById('modalTotal');

  if (carrito.length === 0) {
    items.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem">Tu carrito está vacío</p>';
    total.textContent = '$0 MXN';
    return;
  }

  items.innerHTML = carrito.map(s => {
    const precio = s.precio_min === s.precio_max ? `$${s.precio_min}` : `desde $${s.precio_min}`;
    return `
    <div class="carrito-item">
      <div class="carrito-item-info">
        <strong>${s.nombre}</strong>
        <small>${s.horario_especial || ''}</small>
      </div>
      <div style="display:flex;align-items:center;gap:0.5rem">
        <span class="carrito-item-precio">${precio}</span>
        <button class="btn-quitar" onclick="quitarItem(${s.id})">✕</button>
      </div>
    </div>`;
  }).join('');

  const precioTotal = carrito.reduce((sum, s) => sum + s.precio_min, 0);
  total.textContent = `desde $${precioTotal} MXN`;
}

function quitarItem(id) {
  carrito = carrito.filter(c => c.id !== id);
  actualizarBadge();
  renderCarritoModal();
  renderServicios();
  if (carrito.length === 0) cerrarCarrito();
}

function irPaso2() {
  if (carrito.length === 0) return;
  document.getElementById('paso1').style.display = 'none';
  document.getElementById('paso2').style.display = 'block';
  // Set min date to tomorrow
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  document.getElementById('inputFecha').min = manana.toISOString().split('T')[0];
}

function seleccionarTipo(tipo) {
  tipoAgenda = tipo;
  document.getElementById('optJunto').querySelector('.agenda-card').style.borderColor =
    tipo === 'junto' ? 'var(--rose)' : '';
  document.getElementById('optSeparado').querySelector('.agenda-card').style.borderColor =
    tipo === 'separado' ? 'var(--rose)' : '';
}

// ═══════════════════════════════════════════════════════════
// WHATSAPP
// ═══════════════════════════════════════════════════════════
async function enviarWsp() {
  const nombre = document.getElementById('inputNombre').value.trim();
  const telefono = document.getElementById('inputTelefono').value.trim();
  const fecha = document.getElementById('inputFecha').value;
  const notas = document.getElementById('inputNotas').value.trim();

  if (!nombre) { mostrarToast('Por favor ingresa tu nombre 🌸'); return; }
  if (!telefono) { mostrarToast('Por favor ingresa tu WhatsApp 📱'); return; }

  // Guardar en base de datos
  try {
    await fetch(`${API_URL}/api/citas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre, telefono,
        servicios: carrito.map(s => ({ id: s.id, nombre: s.nombre, precio: s.precio_min })),
        fecha_preferida: fecha || null,
        notas,
        tipo_agenda: tipoAgenda
      })
    });
  } catch { /* continuar aunque falle el guardado */ }

  // Armar mensaje WhatsApp
  const tipoTexto = tipoAgenda === 'junto'
    ? '📅 *Todo el mismo día*'
    : '🗓️ *En días separados*';

  const serviciosList = carrito.map(s => {
    const precio = s.precio_min === s.precio_max ? `$${s.precio_min}` : `desde $${s.precio_min}`;
    return `   ✿ ${s.nombre} — ${precio} MXN`;
  }).join('\n');

  const precioTotal = carrito.reduce((sum, s) => sum + s.precio_min, 0);

  const fechaTexto = fecha
    ? `📅 Fecha preferida: ${formatFecha(fecha)}`
    : '📅 Fecha: Flexible (me pueden sugerir)';

  const notasTexto = notas ? `\n📝 Notas: ${notas}` : '';

  const mensaje = [
    `🌸 *¡Hola! Quiero agendar una cita en Esencia Belleza* 🌸`,
    ``,
    `👤 *Nombre:* ${nombre}`,
    `📱 *WhatsApp:* ${telefono}`,
    ``,
    `💆 *Servicios que deseo:*`,
    serviciosList,
    ``,
    `💰 *Total estimado:* desde $${precioTotal} MXN`,
    ``,
    tipoTexto,
    fechaTexto,
    notasTexto,
    ``,
    `_Mensaje enviado desde esenciabellezasalon.com_ ✿`,
  ].filter(l => l !== undefined).join('\n');

  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');

  // Limpiar
  cerrarCarrito();
  carrito = [];
  actualizarBadge();
  renderServicios();
  mostrarToast('¡Mensaje listo! Te confirmamos en breve 🌸');
}

function formatFecha(fechaStr) {
  const [y, m, d] = fechaStr.split('-');
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${d} de ${meses[parseInt(m)-1]} ${y}`;
}

// ═══════════════════════════════════════════════════════════
// CATEGORY FILTERS
// ═══════════════════════════════════════════════════════════
function initFiltros() {
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      categoriaActiva = btn.dataset.cat;
      renderServicios();
    });
  });
}

// ═══════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════
let toastTimeout;
function mostrarToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  crearPetalos();
  initNav();
  initFiltros();
  cargarServicios();
  initReveal();

  // Add reveal to section elements
  setTimeout(() => {
    document.querySelectorAll(
      '.beneficio-card, .info-card, .servicio-card, .frase-section'
    ).forEach(el => el.classList.add('reveal'));
    initReveal();
  }, 500);
});
