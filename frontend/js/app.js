/* ═══════════════════════════════════════════
   ESENCIA BELLEZA v4 · app.js
═══════════════════════════════════════════ */

const API_URL   = window.APP_CONFIG?.apiUrl || 'https://esencia-belleza-api.onrender.com';
const WA_NUMBER = '526644301178';
const ADMIN_KEY = 'EsenciaBelleza2024';
const ADMIN_PWD = 'esencia2024'; // ← cambia esta contraseña

let carrito       = [];
let serviciosData = [];
let catActiva     = 'todos';
let tipoAgenda    = 'junto';
let todasCitas    = [];
let adminClicks   = 0;
let adminTimer;

// ── Datos beneficios ─────────────────────────
const BENEFICIOS = {
  relajante: {
    emoji: '🤲',
    bg: 'linear-gradient(135deg,#f9a8d4,#fbcfe8)',
    titulo: 'Masaje Relajante',
    desc: 'El estrés diario acumula tensión en tus músculos, afecta tu sueño, tu humor y tu salud. Un masaje relajante libera endorfinas, mejora la circulación y te devuelve al equilibrio natural de tu cuerpo.',
    bullets: ['Reduce el cortisol (hormona del estrés)', 'Mejora la calidad del sueño desde la primera sesión', 'Alivia dolores musculares y tensión cervical', 'Activa la circulación sanguínea', 'Tu mente descansa cuando tu cuerpo lo hace'],
    serviciosCat: 'masajes',
    filtro: s => s.nombre.toLowerCase().includes('relajante')
  },
  linfatico: {
    emoji: '💧',
    bg: 'linear-gradient(135deg,#a5f3fc,#67e8f9)',
    titulo: 'Masaje Linfático',
    desc: 'Tu sistema linfático filtra toxinas y combate inflamaciones. Estimularlo reduce la retención de líquidos, mejora el sistema inmune y te da una energía renovada. Ideal post-operatorio o para eliminar hinchazón.',
    bullets: ['Elimina toxinas y líquidos retenidos', 'Reduce inflamación visible en días', 'Fortalece el sistema inmunológico', 'Recomendado después de cirugías estéticas', 'Mejora la textura de la piel'],
    filtro: s => s.nombre.toLowerCase().includes('linfático') || s.nombre.toLowerCase().includes('linfatico')
  },
  reductivo: {
    emoji: '🔥',
    bg: 'linear-gradient(135deg,#fde68a,#fbbf24)',
    titulo: 'Masaje Reductivo',
    desc: 'Activa la quema de grasa localizada y mejora el tono muscular. Cada sesión moldea tu silueta y reactiva áreas de difícil acceso con técnicas de presión profunda. Resultados visibles desde la primera cita.',
    bullets: ['Reduce medidas en zonas específicas', 'Activa la termogénesis local', 'Mejora la firmeza de la piel', 'Rompe fibrosis y nódulos de grasa', 'Complemento ideal de tu rutina fitness'],
    filtro: s => s.nombre.toLowerCase().includes('reductivo')
  },
  facial: {
    emoji: '✨',
    bg: 'linear-gradient(135deg,#d8b4fe,#c084fc)',
    titulo: 'Facial Profundo',
    desc: 'La contaminación, el maquillaje y el estrés obstruyen tus poros a diario. Una limpieza facial profunda desintoxica, hidrata y rejuvenece tu piel desde adentro. Tu rostro merece atención profesional.',
    bullets: ['Limpieza y extracción profesional de poros', 'Hidratación profunda con activos premium', 'Reduce manchas y marcas de acné', 'Estimula la producción de colágeno', 'Piel radiante visible desde el primer tratamiento'],
    filtro: s => s.categoria === 'facial'
  },
  unas: {
    emoji: '💅',
    bg: 'linear-gradient(135deg,#bbf7d0,#86efac)',
    titulo: 'Uñas & Pedicure',
    desc: 'Tus manos y pies son tu presentación al mundo. Uñas perfectas transmiten confianza, cuidado y elegancia. El detalle que completa tu imagen y te hace sentir completa de pies a manos.',
    bullets: ['Uñas acrílicas de larga duración', 'Pedicure con exfoliación e hidratación', 'Diseños personalizados únicos', 'Esmaltado profesional que no se desprende', 'El lujo que mereces a un precio accesible'],
    filtro: s => s.categoria === 'unas'
  },
  cabello: {
    emoji: '💇',
    bg: 'linear-gradient(135deg,#fecaca,#f87171)',
    titulo: 'Tintes & Tratamientos',
    desc: 'Tu cabello es tu corona. Tonos vibrantes, baños de color y tratamientos restauradores devuelven vida y brillo a cada hebra. Un color que te identifica, un cabello que te enamora.',
    bullets: ['Coloración con productos premium de calidad', 'Baños de color que hidratan mientras pigmentan', 'Tratamientos para cabello dañado o seco', 'Técnicas: balayage, babylights, dimensiones 3D', 'Resultado profesional duradero'],
    filtro: s => s.categoria === 'cabello'
  }
};

const CAT_LABELS = {
  masajes:'🤲 Masajes', facial:'✨ Facial',
  unas:'💅 Uñas', cabello:'💇 Cabello'
};

const SERVICIOS_LOCAL = [
  {id:1,categoria:'masajes',nombre:'Masaje Relajante',descripcion:'Libera tensión y estrés. Tu cuerpo merece descanso.',precio_min:300,precio_max:300,horario_especial:'L-V 10am-7pm · S-D 10am-5pm'},
  {id:2,categoria:'masajes',nombre:'Masaje Reductivo',descripcion:'Moldea tu figura y activa la circulación.',precio_min:400,precio_max:400,horario_especial:'L-V 10am-7pm · S-D 10am-5pm'},
  {id:3,categoria:'masajes',nombre:'Masaje Linfático',descripcion:'Elimina toxinas y reduce retención de líquidos.',precio_min:400,precio_max:400,horario_especial:'L-V 10am-7pm · S-D 10am-5pm'},
  {id:4,categoria:'facial',nombre:'Facial Profundo',descripcion:'Limpieza profunda, extracción y nutrición.',precio_min:450,precio_max:450,horario_especial:'L-V 10am-7pm'},
  {id:5,categoria:'facial',nombre:'Eliminación de Verrugas',descripcion:'Procedimiento seguro y efectivo.',precio_min:350,precio_max:350,horario_especial:'L-V 9am-7pm'},
  {id:6,categoria:'unas',nombre:'Uñas Acrílicas',descripcion:'Extensiones con acabado profesional. ¡Chicas $350!',precio_min:350,precio_max:350,horario_especial:'L-V 6pm-9pm · S-D 10am-5pm'},
  {id:7,categoria:'unas',nombre:'Pedicure',descripcion:'Exfoliación, hidratación y esmaltado perfecto.',precio_min:350,precio_max:350,horario_especial:'L-V 6pm-9pm · S-D 10am-5pm'},
  {id:8,categoria:'cabello',nombre:'Tinte Color Sólido',descripcion:'Un solo tono parejo de raíz a puntas.',precio_min:480,precio_max:900,horario_especial:'L-V 10am-7pm · S 10am-5pm'},
  {id:9,categoria:'cabello',nombre:'Retoque (incluye Baño de Color)',descripcion:'Retoca tu raíz con el mismo tono.',precio_min:480,precio_max:900,horario_especial:'L-V 10am-7pm · S 10am-5pm'},
  {id:10,categoria:'cabello',nombre:'Retoque con Decoloración',descripcion:'Para tonos rubios o aclarados.',precio_min:810,precio_max:1620,horario_especial:'L-V 10am-7pm · S 10am-5pm'},
  {id:11,categoria:'cabello',nombre:'Baño de Color (Gloss)',descripcion:'Hidrata y da brillo con pigmento semipermanente.',precio_min:250,precio_max:400,horario_especial:'L-V 10am-7pm · S 10am-5pm'},
  {id:12,categoria:'cabello',nombre:'Baño de Color + Tratamiento Esencial',descripcion:'Gloss + tratamiento nutritivo.',precio_min:520,precio_max:750,horario_especial:'L-V 10am-7pm · S 10am-5pm'},
  {id:13,categoria:'cabello',nombre:'Baño de Color + Tratamiento Profundo',descripcion:'Para cabellos dañados que necesitan restauración.',precio_min:680,precio_max:950,horario_especial:'L-V 10am-7pm · S 10am-5pm'},
];

// ══════════════════════════════════════════════
// NAVEGACIÓN POR TABS
// ══════════════════════════════════════════════
function mostrarTab(tab) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const page = document.getElementById(`page-${tab}`);
  if (page) page.classList.add('active');
  const btn = document.querySelector(`.tab[data-tab="${tab}"]`);
  if (btn) btn.classList.add('active');
  window.scrollTo(0, 0);
  if (tab === 'servicios' && serviciosData.length === 0) cargarServicios();
}

// ══════════════════════════════════════════════
// PETALS
// ══════════════════════════════════════════════
function crearPetalos() {
  const c = document.getElementById('petals');
  const cols = ['rgba(201,151,122,.5)','rgba(232,196,176,.6)','rgba(212,168,67,.4)','rgba(122,153,130,.4)','rgba(249,168,212,.5)'];
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    const sz = Math.random() * 10 + 6;
    p.style.cssText = `left:${Math.random()*100}%;width:${sz}px;height:${sz}px;background:${cols[Math.floor(Math.random()*cols.length)]};animation-duration:${Math.random()*12+10}s;animation-delay:${Math.random()*15}s;border-radius:${Math.random()>.5?'50% 0 50% 0':'50% 50% 0 50%'}`;
    c.appendChild(p);
  }
}

// ══════════════════════════════════════════════
// TOPBAR SCROLL
// ══════════════════════════════════════════════
function initTopbar() {
  window.addEventListener('scroll', () => {
    document.getElementById('topbar').classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ══════════════════════════════════════════════
// SERVICIOS
// ══════════════════════════════════════════════
async function cargarServicios() {
  try {
    const r = await fetch(`${API_URL}/api/servicios`, { signal: AbortSignal.timeout(5000) });
    if (r.ok) { const { data } = await r.json(); serviciosData = data; }
    else serviciosData = SERVICIOS_LOCAL;
  } catch { serviciosData = SERVICIOS_LOCAL; }
  renderServicios();
}

function renderServicios() {
  const grid = document.getElementById('serviciosGrid');
  const lista = catActiva === 'todos' ? serviciosData : serviciosData.filter(s => s.categoria === catActiva);
  if (!lista.length) { grid.innerHTML = '<div class="loading">Sin servicios en esta categoría</div>'; return; }
  grid.innerHTML = lista.map(s => {
    const sel = carrito.some(c => c.id === s.id);
    const precio = s.precio_min === s.precio_max ? `$${s.precio_min}` : `$${s.precio_min}–$${s.precio_max}`;
    return `<div class="s-card ${sel?'selected':''}" id="sc-${s.id}">
      <div class="s-cat">${CAT_LABELS[s.categoria]||s.categoria}</div>
      <div class="s-name">${s.nombre}</div>
      <div class="s-desc">${s.descripcion}</div>
      <div class="s-horario">🕐 ${s.horario_especial||'Consultar'}</div>
      <div class="s-footer">
        <div class="s-price">${precio}<small> MXN</small></div>
        <button class="btn-add ${sel?'on':''}" id="ba-${s.id}" onclick="toggleServicio(${s.id})">
          <span class="ico">${sel?'✕':'+'}</span>${sel?'Quitar':'Agregar'}
        </button>
      </div>
    </div>`;
  }).join('');
}

function toggleServicio(id) {
  const s = serviciosData.find(x => x.id === id);
  if (!s) return;
  const idx = carrito.findIndex(c => c.id === id);
  if (idx === -1) { carrito.push(s); toast(`✿ ${s.nombre} agregado`); }
  else { carrito.splice(idx,1); toast('Eliminado del carrito'); }
  actualizarBadge();
  renderServicios();
}

function actualizarBadge() {
  const badge = document.getElementById('cartBadge');
  const bar   = document.getElementById('carritoBar');
  if (!carrito.length) { badge.style.display='none'; bar.style.display='none'; return; }
  badge.style.display='flex'; badge.textContent=carrito.length;
  bar.style.display='flex';
  document.getElementById('barCount').textContent=`${carrito.length} servicio${carrito.length>1?'s':''}`;
  document.getElementById('barTotal').textContent=`desde $${carrito.reduce((s,c)=>s+c.precio_min,0)}`;
}

// ══════════════════════════════════════════════
// MODAL CARRITO
// ══════════════════════════════════════════════
function abrirCarrito() {
  if (!carrito.length) { toast('Agrega al menos un servicio 🌸'); mostrarTab('servicios'); return; }
  document.getElementById('carritoOverlay').classList.add('active');
  document.getElementById('modalCarrito').classList.add('active');
  document.body.style.overflow='hidden';
  document.getElementById('paso1').style.display='block';
  document.getElementById('paso2').style.display='none';
  renderCarrito();
}

function cerrarCarrito() {
  document.getElementById('carritoOverlay').classList.remove('active');
  document.getElementById('modalCarrito').classList.remove('active');
  document.body.style.overflow='';
}

function renderCarrito() {
  const items = document.getElementById('carritoItems');
  items.innerHTML = carrito.map(s => {
    const p = s.precio_min===s.precio_max?`$${s.precio_min}`:`desde $${s.precio_min}`;
    return `<div class="c-item">
      <div class="c-item-info"><strong>${s.nombre}</strong><small>${s.horario_especial||''}</small></div>
      <div class="c-item-r">
        <span class="c-price">${p}</span>
        <button class="btn-remove" onclick="quitarItem(${s.id})">✕</button>
      </div>
    </div>`;
  }).join('');
  document.getElementById('modalTotal').textContent=`desde $${carrito.reduce((s,c)=>s+c.precio_min,0)} MXN`;
}

function quitarItem(id) {
  carrito = carrito.filter(c=>c.id!==id);
  actualizarBadge(); renderCarrito(); renderServicios();
  if (!carrito.length) cerrarCarrito();
}

function irPaso2() {
  document.getElementById('paso1').style.display='none';
  document.getElementById('paso2').style.display='block';
  const manana = new Date(); manana.setDate(manana.getDate()+1);
  const minDate = manana.toISOString().split('T')[0];
  document.getElementById('inputFecha').min = minDate;
  renderFechasSeparadas(minDate);
}

function renderFechasSeparadas(minDate) {
  const container = document.getElementById('fechasSeparadas');
  if (!container) return;
  if (tipoAgenda === 'separado' && carrito.length > 1) {
    container.style.display = 'block';
    container.innerHTML = `
      <p style="font-size:.78rem;color:var(--muted);margin-bottom:.75rem;text-align:center">
        Elige la fecha preferida para cada servicio:
      </p>
      ${carrito.map((s,i) => `
        <div class="field">
          <label>${s.nombre}</label>
          <input type="date" id="fechaSep-${i}" min="${minDate}"/>
        </div>
      `).join('')}
    `;
    document.getElementById('fechaUnica').style.display = 'none';
  } else {
    container.style.display = 'none';
    document.getElementById('fechaUnica').style.display = 'block';
  }
}

async function enviarWsp() {
  const nombre   = document.getElementById('inputNombre').value.trim();
  const telefono = document.getElementById('inputTelefono').value.trim();
  const notas    = document.getElementById('inputNotas').value.trim();
  if (!nombre)   { toast('Ingresa tu nombre 🌸'); return; }
  if (!telefono) { toast('Ingresa tu WhatsApp 📱'); return; }

  const meses=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const fmtFecha = f => { if(!f) return 'Flexible'; const[y,m,d]=f.split('-'); return `${d} de ${meses[m-1]} ${y}`; };

  // Recoger fechas según tipo
  let fechaPrincipal = '';
  let serviciosConFecha = [];

  if (tipoAgenda === 'separado' && carrito.length > 1) {
    serviciosConFecha = carrito.map((s,i) => ({
      ...s,
      fecha: document.getElementById(`fechaSep-${i}`)?.value || ''
    }));
  } else {
    fechaPrincipal = document.getElementById('inputFecha').value;
    serviciosConFecha = carrito.map(s => ({...s, fecha: fechaPrincipal}));
  }

  try {
    await fetch(`${API_URL}/api/citas`,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({nombre,telefono,
        servicios:serviciosConFecha.map(s=>({id:s.id,nombre:s.nombre,precio:s.precio_min,fecha:s.fecha})),
        fecha_preferida:fechaPrincipal||serviciosConFecha[0]?.fecha||null,
        notas,tipo_agenda:tipoAgenda})});
  } catch {}

  // Armar mensaje WhatsApp
  let svcsLineas;
  if (tipoAgenda === 'separado' && carrito.length > 1) {
    svcsLineas = serviciosConFecha.map(s =>
      `   ✿ ${s.nombre} — $${s.precio_min} MXN\n      📅 Fecha: ${fmtFecha(s.fecha)}`
    );
  } else {
    svcsLineas = carrito.map(s => `   ✿ ${s.nombre} — $${s.precio_min} MXN`);
  }

  const msg = [
    `🌸 *¡Hola! Quiero agendar en Esencia Belleza* 🌸`,``,
    `👤 *Nombre:* ${nombre}`,`📱 *WhatsApp:* ${telefono}`,``,
    `💆 *Servicios:*`,
    ...svcsLineas,``,
    `💰 *Total estimado:* desde $${carrito.reduce((s,c)=>s+c.precio_min,0)} MXN`,``,
    tipoAgenda==='junto'
      ? `📅 *Todo el mismo día* — ${fmtFecha(fechaPrincipal)}`
      : carrito.length===1
        ? `📅 Fecha: ${fmtFecha(serviciosConFecha[0]?.fecha)}`
        : `🗓️ *En días separados* (fechas arriba)`,
    notas?`📝 Notas: ${notas}`:'',``,
    `_Enviado desde esenciabelleza.onrender.com_ ✿`
  ].filter(l=>l!==undefined).join('\n');

  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`,'_blank');
  cerrarCarrito(); carrito=[]; actualizarBadge(); renderServicios();
  toast('¡Mensaje listo! Te confirmamos en breve 🌸');
}

// ══════════════════════════════════════════════
// MODAL BENEFICIO (con servicios para agendar)
// ══════════════════════════════════════════════
function abrirBeneficio(key) {
  const b = BENEFICIOS[key];
  if (!b) return;
  document.getElementById('beneficioOverlay').classList.add('active');
  document.getElementById('modalBeneficio').classList.add('active');
  document.body.style.overflow='hidden';

  document.getElementById('beneficioImg').style.background = b.bg;
  document.getElementById('beneficioImg').innerHTML = `<span style="font-size:5rem">${b.emoji}</span>`;

  // Filtrar servicios relacionados
  const relacionados = serviciosData.length
    ? serviciosData.filter(s => b.filtro ? b.filtro(s) : s.categoria === key)
    : SERVICIOS_LOCAL.filter(s => b.filtro ? b.filtro(s) : s.categoria === key);

  const svcsHtml = relacionados.length ? `
    <p class="b-servicios-titulo">Servicios disponibles</p>
    <div class="b-servicios-list">
      ${relacionados.map(s => {
        const sel = carrito.some(c=>c.id===s.id);
        const precio = s.precio_min===s.precio_max?`$${s.precio_min}`:`$${s.precio_min}–$${s.precio_max}`;
        return `<div class="b-servicio-item ${sel?'selected':''}" id="bsi-${s.id}">
          <div class="b-servicio-info">
            <strong>${s.nombre}</strong>
            <small>🕐 ${s.horario_especial||'Consultar'}</small>
          </div>
          <span class="b-servicio-precio">${precio}</span>
          <button class="b-add-btn ${sel?'on':''}" id="bab-${s.id}" onclick="toggleDesdeBeneficio(${s.id})">
            ${sel?'✕':'+'}
          </button>
        </div>`;
      }).join('')}
    </div>
    <button class="btn-primary full" onclick="cerrarBeneficio();mostrarTab('servicios');setTimeout(abrirCarrito,300)">
      Ver mi selección →
    </button>` : '';

  document.getElementById('beneficioBody').innerHTML = `
    <h2>${b.titulo}</h2>
    <p class="b-desc">${b.desc}</p>
    <ul class="b-bullets">${b.bullets.map(bl=>`<li>${bl}</li>`).join('')}</ul>
    ${svcsHtml}
  `;
}

function toggleDesdeBeneficio(id) {
  toggleServicio(id);
  // Actualizar botón dentro del modal
  const btn = document.getElementById(`bab-${id}`);
  const item = document.getElementById(`bsi-${id}`);
  if (btn) {
    const sel = carrito.some(c=>c.id===id);
    btn.textContent = sel?'✕':'+';
    btn.classList.toggle('on', sel);
    item?.classList.toggle('selected', sel);
  }
}

function cerrarBeneficio() {
  document.getElementById('beneficioOverlay').classList.remove('active');
  document.getElementById('modalBeneficio').classList.remove('active');
  document.body.style.overflow='';
}

// ══════════════════════════════════════════════
// FILTROS CATEGORÍA
// ══════════════════════════════════════════════
function initPills() {
  document.querySelectorAll('.pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pill').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      catActiva = btn.dataset.cat;
      renderServicios();
    });
  });
}

// ══════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════
let toastT;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),3000);
}

// ══════════════════════════════════════════════
// ADMIN PANEL
// ══════════════════════════════════════════════
function adminClick() {
  adminClicks++;
  clearTimeout(adminTimer);
  adminTimer = setTimeout(()=>adminClicks=0, 2000);
  if (adminClicks >= 5) { adminClicks=0; abrirAdminLogin(); }
}

function abrirAdminLogin() {
  document.getElementById('adminOverlay').classList.add('active');
  document.getElementById('modalAdminLogin').classList.add('active');
  document.body.style.overflow='hidden';
  setTimeout(()=>document.getElementById('adminPass').focus(),300);
}

function cerrarAdmin() {
  document.getElementById('adminOverlay').classList.remove('active');
  document.getElementById('modalAdminLogin').classList.remove('active');
  document.getElementById('modalAdminPanel').classList.remove('active');
  document.body.style.overflow='';
  document.getElementById('adminPass').value='';
  document.getElementById('adminErr').style.display='none';
}

function verificarAdmin() {
  if (document.getElementById('adminPass').value === ADMIN_PWD) {
    document.getElementById('modalAdminLogin').classList.remove('active');
    document.getElementById('modalAdminPanel').classList.add('active');
    cargarCitas();
  } else {
    document.getElementById('adminErr').style.display='block';
    document.getElementById('adminPass').value='';
    document.getElementById('adminPass').focus();
  }
}

async function cargarCitas() {
  document.getElementById('adminCitas').innerHTML='<div class="admin-loading">Cargando citas... 🌸</div>';
  try {
    const r = await fetch(`${API_URL}/api/citas`,{headers:{'x-admin-key':ADMIN_KEY}});
    const {data} = await r.json();
    todasCitas = data||[];
    filtrarCitas(); renderStats();
  } catch {
    document.getElementById('adminCitas').innerHTML='<div class="admin-empty">⚠️ No se pudo conectar. Verifica el backend.</div>';
  }
}

function renderStats() {
  const t=todasCitas.length, p=todasCitas.filter(c=>c.estado==='pendiente').length,
        cf=todasCitas.filter(c=>c.estado==='confirmada').length,
        hoy=new Date().toISOString().split('T')[0],
        h=todasCitas.filter(c=>c.fecha_preferida?.startsWith(hoy)).length;
  document.getElementById('adminStats').innerHTML=
    `<div class="stat-chip">📋 Total: <strong>${t}</strong></div>
     <div class="stat-chip">⏳ Pendientes: <strong>${p}</strong></div>
     <div class="stat-chip">✅ Confirmadas: <strong>${cf}</strong></div>
     <div class="stat-chip">📅 Hoy: <strong>${h}</strong></div>`;
}

function filtrarCitas() {
  const f=document.getElementById('adminFiltro').value;
  const lista=f==='todas'?todasCitas:todasCitas.filter(c=>c.estado===f);
  renderCitas(lista);
}

function renderCitas(citas) {
  const el=document.getElementById('adminCitas');
  if (!citas?.length){el.innerHTML='<div class="admin-empty">🌸 No hay citas aquí</div>';return;}
  const meses=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  el.innerHTML=citas.map(c=>{
    const svcs=Array.isArray(c.servicios)?c.servicios:(typeof c.servicios==='string'?JSON.parse(c.servicios):[]);
    const fecha=c.fecha_preferida?(()=>{const[y,m,d]=c.fecha_preferida.split('T')[0].split('-');return `${d} ${meses[m-1]} ${y}`;})():'Sin fecha';
    const creado=new Date(c.created_at).toLocaleDateString('es-MX',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
    const total=svcs.reduce((s,sv)=>s+(sv.precio||0),0);
    const wsp=c.telefono.replace(/\D/g,'');
    const wspNum=wsp.startsWith('52')?wsp:`52${wsp}`;
    const rec=encodeURIComponent(`🌸 Hola ${c.nombre}! Te recordamos tu cita mañana en *Esencia Belleza* ✿\n\n📋 Servicios: ${svcs.map(s=>s.nombre).join(', ')}\n📅 Fecha: ${fecha}\n\n¡Te esperamos! Cualquier cambio avísanos 💕`);
    return `<div class="cita-card">
      <div class="cita-top">
        <div><div class="cita-nombre">${c.nombre}</div><div style="font-size:.7rem;color:var(--muted)">Agendó: ${creado}</div></div>
        <span class="cita-cuando">📅 ${fecha}</span>
      </div>
      <div class="cita-mid">
        <div class="cita-tel">📱 <a href="https://wa.me/${wspNum}" target="_blank">${c.telefono}</a></div>
        <div class="cita-svcs">${svcs.map(s=>`<span>✿ ${s.nombre}</span>`).join('')}</div>
        <div class="cita-tipo">${c.tipo_agenda==='junto'?'📅 Mismo día':'🗓️ Días separados'}${total?` · $${total} MXN`:''}</div>
        ${c.notas?`<div class="cita-nota">📝 "${c.notas}"</div>`:''}
      </div>
      <div class="cita-bot">
        <span class="e-badge e-${c.estado}">${c.estado}</span>
        ${c.estado!=='confirmada'?`<button class="btn-conf" onclick="cambiarEstado(${c.id},'confirmada')">✓ Confirmar</button>`:''}
        ${c.estado!=='cancelada'?`<button class="btn-canc" onclick="cambiarEstado(${c.id},'cancelada')">✕ Cancelar</button>`:''}
        <a class="btn-rec" href="https://wa.me/${wspNum}?text=${rec}" target="_blank">💬 Recordatorio</a>
      </div>
    </div>`;
  }).join('');
}

async function cambiarEstado(id,estado) {
  try {
    await fetch(`${API_URL}/api/citas/${id}`,{method:'PUT',
      headers:{'Content-Type':'application/json','x-admin-key':ADMIN_KEY},
      body:JSON.stringify({estado})});
    await cargarCitas();
    toast(estado==='confirmada'?'✅ Cita confirmada':'✕ Cita cancelada');
  } catch { toast('Error al actualizar'); }
}

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  crearPetalos();
  initTopbar();
  initPills();
  cargarServicios();
  mostrarTab('inicio');
});
