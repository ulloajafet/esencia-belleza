require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Database ────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-key']
}));
app.options('*', cors());
app.use(express.json());

// ─── Init DB ─────────────────────────────────────────────────
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS citas (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        telefono VARCHAR(20) NOT NULL,
        servicios JSONB NOT NULL,
        fecha_preferida DATE,
        notas TEXT,
        tipo_agenda VARCHAR(20) DEFAULT 'junto',
        estado VARCHAR(20) DEFAULT 'pendiente',
        recordatorio_enviado BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS servicios (
        id SERIAL PRIMARY KEY,
        categoria VARCHAR(50) NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        precio_min INTEGER,
        precio_max INTEGER,
        duracion_min INTEGER,
        horario_especial TEXT,
        disponible BOOLEAN DEFAULT TRUE
      );
    `);
    console.log('✅ Base de datos inicializada');
  } finally {
    client.release();
  }
}

// ─── Seed servicios ──────────────────────────────────────────
async function seedServicios() {
  const count = await pool.query('SELECT COUNT(*) FROM servicios');
  if (parseInt(count.rows[0].count) > 0) return;

  const servicios = [
    // Tintes & Cabello
    ['cabello', 'Tinte Color Sólido', 'Un solo tono parejo de raíz a puntas. Renueva tu color y da vida a tu cabello.', 480, 900, 90, 'L-V 10am-7pm, S 10am-5pm'],
    ['cabello', 'Retoque (incluye Baño de Color)', 'Retoca tu raíz con el mismo tono y finaliza con brillo total.', 480, 900, 75, 'L-V 10am-7pm, S 10am-5pm'],
    ['cabello', 'Retoque con Decoloración', 'Para quienes mantienen tonos rubios o aclarados.', 810, 1620, 120, 'L-V 10am-7pm, S 10am-5pm'],
    ['cabello', 'Baño de Color (Gloss)', 'Hidrata y da brillo intenso a tu cabello con pigmento semipermanente.', 250, 400, 45, 'L-V 10am-7pm, S 10am-5pm'],
    ['cabello', 'Baño de Color + Tratamiento Esencial', 'Gloss + tratamiento nutritivo para cabello suave y brillante.', 520, 750, 60, 'L-V 10am-7pm, S 10am-5pm'],
    ['cabello', 'Baño de Color + Tratamiento Profundo', 'Para cabellos dañados que necesitan restauración completa.', 680, 950, 75, 'L-V 10am-7pm, S 10am-5pm'],
    // Masajes
    ['masajes', 'Masaje Relajante', 'Libera tensión y estrés acumulado. Tu cuerpo merece descanso.', 300, 300, 60, 'L-V 10am-7pm, S-D 10am-5pm'],
    ['masajes', 'Masaje Reductivo', 'Moldea tu figura y activa la circulación. Resultados desde la primera sesión.', 400, 400, 60, 'L-V 10am-7pm, S-D 10am-5pm'],
    ['masajes', 'Masaje Linfático', 'Elimina toxinas y reduce la retención de líquidos. Ideal post-operatorio.', 400, 400, 60, 'L-V 10am-7pm, S-D 10am-5pm'],
    // Facial
    ['facial', 'Facial Profundo', 'Limpieza profunda, extracción y nutrición. Tu piel, renovada.', 450, 450, 75, 'L-V 10am-7pm'],
    ['facial', 'Eliminación de Verrugas', 'Procedimiento seguro y efectivo para remover verrugas.', 350, 350, 45, 'L-V 9am-7pm'],
    // Uñas
    ['unas', 'Uñas Acrílicas', 'Extensiones perfectas con acabado profesional. ¡Chicas $350!', 350, 350, 90, 'L-V 6pm-9pm, S-D 10am-5pm'],
    ['unas', 'Pedicure', 'Cuida tus pies con exfoliación, hidratación y esmaltado perfecto.', 350, 350, 60, 'L-V 6pm-9pm, S-D 10am-5pm'],
  ];

  for (const s of servicios) {
    await pool.query(
      'INSERT INTO servicios (categoria, nombre, descripcion, precio_min, precio_max, duracion_min, horario_especial) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      s
    );
  }
  console.log('✅ Servicios sembrados');
}

// ─── Routes ──────────────────────────────────────────────────

// GET servicios
app.get('/api/servicios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM servicios WHERE disponible = TRUE ORDER BY categoria, id');
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Error al obtener servicios' });
  }
});

// POST crear cita
app.post('/api/citas', async (req, res) => {
  const { nombre, telefono, servicios, fecha_preferida, notas, tipo_agenda } = req.body;
  if (!nombre || !telefono || !servicios || servicios.length === 0) {
    return res.status(400).json({ ok: false, error: 'Nombre, teléfono y servicios son requeridos' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO citas (nombre, telefono, servicios, fecha_preferida, notas, tipo_agenda)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nombre, telefono, JSON.stringify(servicios), fecha_preferida || null, notas || '', tipo_agenda || 'junto']
    );
    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Error al crear cita' });
  }
});

// GET todas las citas (admin)
app.get('/api/citas', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: 'No autorizado' });
  }
  try {
    const result = await pool.query('SELECT * FROM citas ORDER BY created_at DESC');
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Error al obtener citas' });
  }
});

// PUT actualizar estado cita
app.put('/api/citas/:id', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: 'No autorizado' });
  }
  const { estado } = req.body;
  try {
    const result = await pool.query(
      'UPDATE citas SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, req.params.id]
    );
    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Error al actualizar cita' });
  }
});

// GET citas pendientes para recordatorio (las de mañana)
app.get('/api/recordatorios', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: 'No autorizado' });
  }
  try {
    const result = await pool.query(`
      SELECT * FROM citas
      WHERE fecha_preferida = CURRENT_DATE + INTERVAL '1 day'
        AND estado = 'confirmada'
        AND recordatorio_enviado = FALSE
    `);
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Error al obtener recordatorios' });
  }
});

// PUT marcar recordatorio como enviado
app.put('/api/recordatorios/:id/enviado', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: 'No autorizado' });
  }
  try {
    await pool.query('UPDATE citas SET recordatorio_enviado = TRUE WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Error' });
  }
});

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── Start ───────────────────────────────────────────────────
initDB().then(() => seedServicios()).then(() => {
  app.listen(PORT, () => console.log(`🌸 Esencia Belleza API corriendo en puerto ${PORT}`));
}).catch(console.error);
