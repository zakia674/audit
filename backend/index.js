const express = require('express');
const cors    = require('cors');
const path    = require('path');
const db      = require('./db');

// Migration douce : ajouter colonne fichier_pdf_path si absente
db.query(`ALTER TABLE fiches_entreprise ADD COLUMN IF NOT EXISTS fichier_pdf_path TEXT`).catch(() => {});
// Migration : ajouter date_fin aux missions
db.query(`ALTER TABLE missions ADD COLUMN IF NOT EXISTS date_fin DATE`).catch(() => {});

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/missions',    require('./routes/missions'));
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/missions',    require('./routes/lettres'));
app.use('/api/missions',    require('./routes/fiches'));
app.use('/api/missions',    require('./routes/fiche_pdf'));
app.use('/api/missions',    require('./routes/architectures'));
app.use('/api/missions',    require('./routes/incidents'));
app.use('/api/missions',    require('./routes/perimetre'));
app.use('/api/missions',    require('./routes/evaluations'));
app.use('/api/missions',    require('./routes/rapport'));
app.use('/api/controles',   require('./routes/controles'));
app.use('/api/evaluations', require('./routes/preuves'));
app.use('/api/incidents',   require('./routes/incidents_item'));
app.use('/api/preuves',     require('./routes/preuves_item'));
app.use('/api/dashboard',  require('./routes/dashboard'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✓ Backend Learn⇒Audit → http://localhost:${PORT}`));
