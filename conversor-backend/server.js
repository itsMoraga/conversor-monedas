const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error MongoDB:', err));

const ConversionSchema = new mongoose.Schema({
  fecha: { type: Date, default: Date.now },
  cantidad: Number,
  de: String,
  a: String,
  resultado: Number,
  tasa: Number
});

const Conversion = mongoose.model('Conversion', ConversionSchema);

app.get('/api/conversiones', async (req, res) => {
  try {
    const conversiones = await Conversion.find()
      .sort({ fecha: -1 })
      .limit(10);
    res.json(conversiones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener conversiones' });
  }
});

app.post('/api/conversiones', async (req, res) => {
  try {
    const nuevaConversion = new Conversion(req.body);
    await nuevaConversion.save();
    res.status(201).json(nuevaConversion);
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar conversión' });
  }
});

app.delete('/api/conversiones', async (req, res) => {
  try {
    await Conversion.deleteMany({});
    res.json({ message: 'Historial limpiado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al limpiar historial' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});