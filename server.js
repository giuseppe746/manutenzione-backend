// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Percorsi file e directory
const interventiPath = path.join(__dirname, 'db', 'interventi.json');
const impostazioniPath = path.join(__dirname, 'db', 'impostazioni.json');
const utentiPath = path.join(__dirname, 'db', 'utenti.json');
const archivioFotoDir = path.join(__dirname, 'db', 'archivio_foto');

// ✅ Crea file utenti se non esiste
if (!fs.existsSync(utentiPath)) {
  fs.writeFileSync(utentiPath, '[]', 'utf8');
}

// ✅ Espone le immagini archiviate
app.use('/archivio', express.static(archivioFotoDir));

// 🔹 Multer per immagini
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(archivioFotoDir)) {
      fs.mkdirSync(archivioFotoDir, { recursive: true });
    }
    cb(null, archivioFotoDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// 🔸 GET utenti
app.get('/utenti', (req, res) => {
  fs.readFile(utentiPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Errore lettura utenti');
    res.json(JSON.parse(data || '[]'));
  });
});

// 🔸 POST utenti
app.post('/utenti', (req, res) => {
  const utenti = req.body;
  fs.writeFile(utentiPath, JSON.stringify(utenti, null, 2), 'utf8', (err) => {
    if (err) return res.status(500).send('Errore salvataggio utenti');
    res.status(200).json({ message: 'Utenti salvati' });
  });
});

// 🔸 GET interventi
app.get('/interventi', (req, res) => {
  fs.readFile(interventiPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Errore lettura interventi');
    res.json(JSON.parse(data || '[]'));
  });
});

// 🔸 POST interventi
app.post('/interventi', (req, res) => {
  const nuovo = req.body;
  fs.readFile(interventiPath, 'utf8', (err, data) => {
    let interventi = [];
    if (!err && data) interventi = JSON.parse(data);
    interventi.push(nuovo);
    fs.writeFile(interventiPath, JSON.stringify(interventi, null, 2), (err) => {
      if (err) return res.status(500).send('Errore salvataggio intervento');
      res.status(200).json({ message: 'Intervento salvato' });
    });
  });
});

// 🔸 GET impostazioni
app.get('/impostazioni', (req, res) => {
  fs.readFile(impostazioniPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Errore lettura impostazioni');
    res.json(JSON.parse(data || '{}'));
  });
});

// 🔸 POST impostazioni
app.post('/impostazioni', (req, res) => {
  fs.writeFile(impostazioniPath, JSON.stringify(req.body, null, 2), (err) => {
    if (err) return res.status(500).send('Errore salvataggio impostazioni');
    res.status(200).json({ message: 'Impostazioni salvate' });
  });
});

// 🔸 POST upload archivio
app.post('/upload-archivio', upload.array('foto'), (req, res) => {
  const savedFiles = req.files.map(file => file.filename);
  res.status(200).json({ savedFiles });
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`✅ Server attivo su http://localhost:${PORT}`);
});
