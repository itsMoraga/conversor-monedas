<script setup>
import { ref, onMounted } from 'vue'

// Variables reactivas
const cantidad = ref(1)
const monedaOrigen = ref('USD')
const monedaDestino = ref('EUR')
const resultado = ref(0)
const tasaCambio = ref(0)
const monedas = ref([])
const historial = ref([])
const cargando = ref(false)
const error = ref('')

// Cargar monedas disponibles al iniciar
onMounted(async () => {
  await cargarMonedas()
  cargarHistorial()
})

// API Key
const API_KEY = 'e0cff5baab6eec029dbcb818'

// Obtener lista de monedas desde la API
async function cargarMonedas() {
  try {
    const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`)
    const data = await response.json()
    monedas.value = Object.keys(data.conversion_rates)
  } catch (err) {
    error.value = 'Error al cargar las monedas'
    console.error(err)
  }
}

// Realizar la conversión
async function convertir() {
  if (!cantidad.value || cantidad.value <= 0) {
    error.value = 'Por favor ingresa una cantidad válida'
    return
  }

  cargando.value = true
  error.value = ''

  try {
    const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${monedaOrigen.value}`)
    const data = await response.json()
    
    tasaCambio.value = data.conversion_rates[monedaDestino.value]
    resultado.value = (cantidad.value * tasaCambio.value).toFixed(2)

    // Guardar en historial
    agregarAlHistorial()
  } catch (err) {
    error.value = 'Error al realizar la conversión. Intenta nuevamente.'
    console.error(err)
  } finally {
    cargando.value = false
  }
}

// Agregar conversión al historial
function agregarAlHistorial() {
  const conversion = {
    id: Date.now(),
    fecha: new Date().toLocaleString(),
    cantidad: cantidad.value,
    de: monedaOrigen.value,
    a: monedaDestino.value,
    resultado: resultado.value,
    tasa: tasaCambio.value
  }

  historial.value.unshift(conversion)
  
  // Limitar historial a 10 elementos
  if (historial.value.length > 10) {
    historial.value = historial.value.slice(0, 10)
  }

  // Guardar en localStorage
  localStorage.setItem('historialConversiones', JSON.stringify(historial.value))
}

// Cargar historial desde localStorage
function cargarHistorial() {
  const historialGuardado = localStorage.getItem('historialConversiones')
  if (historialGuardado) {
    historial.value = JSON.parse(historialGuardado)
  }
}

// Limpiar historial
function limpiarHistorial() {
  historial.value = []
  localStorage.removeItem('historialConversiones')
}
</script>

<template>
  <div class="container">
    <h1>Conversor de Monedas</h1>

    <div class="conversor-card">
      <div class="input-group">
        <label>Cantidad</label>
        <input 
          v-model.number="cantidad" 
          type="number" 
          min="0" 
          step="0.01"
          @keyup.enter="convertir"
        />
      </div>

      <div class="input-group">
        <label>De</label>
        <select v-model="monedaOrigen">
          <option v-for="moneda in monedas" :key="moneda" :value="moneda">
            {{ moneda }}
          </option>
        </select>
      </div>

      <div class="input-group">
        <label>A</label>
        <select v-model="monedaDestino">
          <option v-for="moneda in monedas" :key="moneda" :value="moneda">
            {{ moneda }}
          </option>
        </select>
      </div>

      <button @click="convertir" :disabled="cargando">
        {{ cargando ? 'Convirtiendo...' : 'Convertir' }}
      </button>

      <div v-if="error" class="error">{{ error }}</div>

      <div v-if="resultado > 0 && !error" class="resultado">
        <p>{{ cantidad }} {{ monedaOrigen }} = {{ resultado }} {{ monedaDestino }}</p>
        <small>Tasa: 1 {{ monedaOrigen }} = {{ tasaCambio.toFixed(4) }} {{ monedaDestino }}</small>
      </div>
    </div>

    <div v-if="historial.length > 0" class="historial">
      <div class="historial-header">
        <h3>Historial</h3>
        <button @click="limpiarHistorial" class="btn-limpiar">Limpiar</button>
      </div>
      
      <div class="historial-item" v-for="item in historial" :key="item.id">
        <span>{{ item.cantidad }} {{ item.de }} → {{ item.resultado }} {{ item.a }}</span>
        <small>{{ item.fecha }}</small>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 500px;
  margin: 40px auto;
  padding: 20px;
}

h1 {
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: #333;
}

.conversor-card {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

input, select {
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

input:focus, select:focus {
  outline: none;
  border-color: #4CAF50;
}

button {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #45a049;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  margin-top: 15px;
  padding: 10px;
  background: #ffebee;
  color: #c62828;
  border-radius: 4px;
  text-align: center;
}

.resultado {
  margin-top: 20px;
  padding: 15px;
  background: #e8f5e9;
  border-radius: 4px;
  text-align: center;
}

.resultado p {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2e7d32;
  margin: 0 0 5px 0;
}

.resultado small {
  color: #666;
}

.historial {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.historial-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.historial-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.btn-limpiar {
  padding: 6px 12px;
  background: #f44336;
  font-size: 0.85rem;
  width: auto;
}

.btn-limpiar:hover {
  background: #d32f2f;
}

.historial-item {
  padding: 10px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.historial-item span {
  font-weight: 500;
  color: #333;
}

.historial-item small {
  color: #999;
  font-size: 0.8rem;
}
</style>