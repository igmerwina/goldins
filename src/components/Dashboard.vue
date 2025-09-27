<template>
  <v-container fluid>
    <v-row>
      
      <v-col cols="12" sm="12" md="10" lg="9" xl="8">
        
        <v-card class="mb-4 elevation-4" rounded="lg">
          <v-card-title class="text-h6 d-flex justify-space-between align-center py-3">
            <div>
              <div class="text-caption text-medium-emphasis">Halo, <strong>{{ user.name || user.phone }}</strong></div>
              <div class="text-subtitle-2 font-weight-bold">Portofolio Emas</div>
            </div>
            <v-chip color="secondary" label>No HP: {{ user.phone }}</v-chip>
          </v-card-title>

          <v-divider></v-divider>

          <v-card-text>
            <v-row align="center" justify="space-between" class="mb-4">
              <v-col cols="12" sm="4" class="py-1">
                <div class="text-caption text-medium-emphasis">Total Emas Fisik</div>
                <div class="text-h4 font-weight-black text-primary">{{ totalGold.toFixed(2) }} gr</div>
              </v-col>
              <v-col cols="12" sm="5" class="py-1">
                <div class="text-caption text-medium-emphasis">Senilai Nominal</div>
                <div class="text-h5 font-weight-black text-secondary">Rp {{ totalPorto }}</div>
              </v-col>
              <v-col cols="12" sm="3" class="text-sm-right py-1">
                <div class="text-caption text-medium-emphasis">Harga Jual Hari Ini <br/></br>{{ latestDate }}</div>
                <div class="text-subtitle-1 font-weight-bold">Rp {{ latestPriceFormatted }}</div>
              </v-col>
            </v-row>
            
            <v-divider class="my-3"></v-divider>

            <v-row justify="space-between">
              <v-col cols="6" class="py-1">
                <div class="text-caption text-medium-emphasis">Harga Rata-rata Beli /gram</div>
                <div class="text-subtitle-1 font-weight-bold">Rp {{ avgPriceFormatted }}</div>
              </v-col>
              <v-col cols="6" class="text-right py-1">
                <div class="text-caption text-medium-emphasis">Potensi Profit</div>
                <div :class="['text-h6 font-weight-black', potentialProfit >= 0 ? 'text-success' : 'text-error']">
                  Rp {{ potentialProfitFormatted }}
                </div>
                <div class="text-caption text-medium-emphasis">({{ profitPercent }})</div>
              </v-col>
            </v-row>
            
            <br>
            <v-divider></v-divider>

            <v-row class="mt-1">
              <v-col cols="12">
                <div class="text-caption text-medium-emphasis mb-2">Komposisi Emas (per Merk)</div>
                <div class="d-flex justify-center align-center" style="height: 250px;">
                  <canvas id="donutChart"></canvas>
                </div>
                <div class="mt-4">
                  <v-row>
                    <v-col v-for="brand in donutBrands" :key="brand" cols="12" sm="4" class="mb-2">
                      <div class="font-weight-bold">{{ brand }}</div>
                      <div class="text-caption">Gram: <b>{{ donutData[brand].gram.toFixed(2) }}</b> gr</div>
                      <div class="text-caption">Senilai: <b>Rp {{ numberWithCommas(donutData[brand].nominal) }}</b></div>
                    </v-col>
                  </v-row>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card class="mb-4 elevation-4" rounded="lg">
          <v-card-title class="text-subtitle-1 font-weight-bold">Tambah Transaksi</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="addTransaction">
              <v-row>
                <v-col cols="12" sm="6" md="3">
                  <v-select
                    v-model="transaction.type"
                    :items="['beli', 'jual']"
                    label="Jenis"
                    variant="outlined"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-select
                    v-model="transaction.brand"
                    :items="['Galeri24', 'Antam', 'UBS']"
                    label="Merk"
                    variant="outlined"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="5">
                  <v-text-field
                    v-model="transaction.date"
                    label="Tanggal"
                    type="date"
                    variant="outlined"
                    required
                    :min="'1900-01-01'"
                    :max="today"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" sm="6" md="5">
                  <v-select
                    v-model.number="transaction.denom"
                    :items="[0.1, 0.2, 0.5, 1, 2, 5, 10, 25, 50, 100]"
                    label="Denominasi (g)"
                    variant="outlined"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model.number="transaction.count"
                    label="Jumlah Keping"
                    type="number"
                    min="1"
                    variant="outlined"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="3" class="d-flex align-center">
                  <div class="text-subtitle-1 font-weight-bold">Total: {{ (transaction.denom * transaction.count).toFixed(2) }} gr</div>
                </v-col>
              </v-row>
              <v-row v-if="isBackdate(transaction.date)">
                <v-col cols="12" sm="8" md="6">
                  <v-text-field
                    v-model="transaction.manualPrice"
                    label="Harga Beli Emas"
                    placeholder="Masukkan harga beli"
                    :rules="[
                      v => !!v || 'Harga wajib diisi',
                      v => {
                        const digits = v ? v.toString().replace(/[^\d]/g, '') : '';
                        return /^\d{1,12}$/.test(digits) || 'Nominal hanya angka, max 12 digit';
                      }
                    ]"
                    maxlength="20"
                    clearable
                    prepend-inner-icon="mdi-cash"
                    variant="outlined"
                    type="text"
                    inputmode="numeric"
                    :formatter="formatRupiah"
                    :model-value="formatRupiah(transaction.manualPrice)"
                    @update:model-value="val => transaction.manualPrice = unformatRupiah(val)"
                  ></v-text-field>
                </v-col>
              </v-row>
              
              <v-card-actions class="justify-end px-0">
                <v-btn variant="tonal" color="primary" type="submit" size="large" :disabled="!transaction.date || transaction.count < 1">
                  <v-icon start>mdi-content-save</v-icon> Simpan Transaksi
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>

        <v-card class="mb-4 elevation-4" rounded="lg">
          <v-card-title class="text-subtitle-1 font-weight-bold">Grafik Harga Emas</v-card-title>
          <v-card-text>
            
            <v-row>
              <v-col cols="12">
                <div class="text-caption text-medium-emphasis mb-2">Perubahan Harga Emas (7 Hari)</div>
                <div class="d-flex justify-center align-center" style="height: 250px;">
                    <canvas id="lineChart"></canvas>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card class="mb-4 elevation-4" rounded="lg">
          <v-card-title class="text-subtitle-1 d-flex justify-space-between align-center">
            Riwayat Transaksi
            <span class="text-caption text-medium-emphasis">{{ transactions.length }} transaksi</span>
          </v-card-title>
          
          <v-divider></v-divider>

          <v-card-text v-if="transactions.length === 0" class="text-center text-medium-emphasis">
            Tidak ada portofolio — tambahkan transaksi untuk melihat ringkasan.
          </v-card-text>
          
          <v-list v-else dense>
            <v-list-item v-for="tx in transactions" :key="tx.id" :class="tx.type === 'beli' ? 'bg-green-lighten-5' : 'bg-red-lighten-5'">
              <template v-slot:prepend>
                <v-icon :color="tx.type === 'beli' ? 'primary' : 'error'">
                    {{ tx.type === 'beli' ? 'mdi-arrow-up-circle-outline' : 'mdi-arrow-down-circle-outline' }}
                </v-icon>
              </template>
              
              <v-list-item-title class="font-weight-bold">
                {{ tx.brand }} • {{ tx.type.toUpperCase() }}
                <span class="text-caption font-weight-regular ml-2 text-medium-emphasis">{{ tx.date }}</span>
              </v-list-item-title>
              
              <v-list-item-subtitle>
                {{ tx.denom }} g × {{ tx.count }} keping
              </v-list-item-subtitle>
              
              <template v-slot:append>
                <div class="text-right">
                  <div class="font-weight-black text-subtitle-1">{{ (tx.denom * tx.count).toFixed(2) }} gr</div>
                  <v-chip size="small" :color="brandColor(tx.brand)" label>{{ tx.brand }}</v-chip>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      
      <!-- <v-col cols="12" md="4">
        <v-card class="mb-4 elevation-4" rounded="lg">
          <v-card-title class="text-subtitle-1 font-weight-bold">Status Data & Aksi</v-card-title>
          <v-card-text>
            <div class="mb-3">
              <div class="text-caption text-medium-emphasis">Total Emas</div>
              <div class="text-h6 font-weight-black text-primary">{{ totalGold.toFixed(2) }} gr</div>
            </div>
            
            <div class="mb-3">
              <div class="text-caption text-medium-emphasis">Harga Jual /gram Terakhir</div>
              <div class="text-subtitle-1 font-weight-bold">Rp {{ latestPriceFormatted }}</div>
              <div class="text-caption text-medium-emphasis">Tanggal: {{ latestDate }}</div>
            </div>
            
            <v-divider class="my-3"></v-divider>

            <div class="mb-3">
                <div class="text-caption text-medium-emphasis">API Status Harga</div>
                <v-chip :color="apiStatus === 'ok' ? 'success' : 'warning'" size="small" label>{{ apiStatus }}</v-chip>
            </div>
            
            <v-btn color="error" variant="outlined" block @click="clearAll" class="mt-4" prepend-icon="mdi-delete-sweep">
              Hapus Semua Data
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col> -->
    </v-row>
  </v-container>
  <v-alert
    v-if="showWelcome"
    type="success"
    class="welcome-fade center-popup"
    border="start"
    prominent
    elevation="10"
  >
    Selamat datang, <b>{{ welcomeName }}</b>!
  </v-alert>
  <v-alert
    v-if="showError"
    type="error"
    class="welcome-fade center-popup"
    border="start"
    prominent
    elevation="10"
  >
    {{ errorMsg }}
  </v-alert>
  <v-alert
    v-if="showSuccess"
    type="success"
    class="welcome-fade center-popup"
    border="start"
    prominent
    elevation="10"
  >
    Data transaksi berhasil disimpan!
  </v-alert>
</template>

<script setup>
import { ref, onMounted, computed, defineProps } from 'vue';
import axios from 'axios';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend, LineController, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js';
import { supabase } from '../lib/SupabaseClient';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend, LineController, LineElement, PointElement, CategoryScale, LinearScale);

const props = defineProps({
  user: Object
});

const transaction = ref({ date: new Date().toISOString().split('T')[0], type: 'beli', brand: 'Galeri24', denom: 1, count: 1 });
const transactions = ref([]);
const priceHistory = ref([]);
const latestPrice = ref(0);
const latestDate = ref('-');
const apiStatus = ref('idle');
let donutChartInstance = null;
let lineChartInstance = null;

const BRAND_COLORS = { Galeri24: '#0B6B3A', Antam: '#C69C2F', UBS: '#6B6B6B' };

const welcomeName = ref('');
const showWelcome = ref(false);
const showError = ref(false);
const errorMsg = ref('');
const showSuccess = ref(false);

const today = new Date().toISOString().split('T')[0];

onMounted(async () => {
  await fetchTransactionsFromSupabase();
  await fetchLatestPrice();
  await fetchPriceChart();
  drawDonut();
  drawLine();
  // Cek jika ada nama dari localStorage (hasil login)
  const raw = localStorage.getItem('pg_user');
  if (raw) {
    const u = JSON.parse(raw);
    if (u && u.name) {
      welcomeName.value = u.name;
      showWelcome.value = true;
      // Sembunyikan popup setelah 3 detik
      setTimeout(() => { showWelcome.value = false; }, 2000);
    }
  }
});

// --- Data & Persistence Functions ---
function loadLocal() {
  const txRaw = localStorage.getItem('pg_tx');
  transactions.value = txRaw ? JSON.parse(txRaw) : [];
  const phRaw = localStorage.getItem('pg_price_history');
  priceHistory.value = phRaw ? JSON.parse(phRaw) : [];
}

function saveLocal() { 
    localStorage.setItem('pg_tx', JSON.stringify(transactions.value));
}

async function addTransaction() {
  if (!transaction.value.manualPrice && isBackdate(transaction.value.date)) {
    showError.value = true;
    errorMsg.value = 'Harga Beli Emas wajib diisi untuk tanggal lampau!';
    return;
  }
  const tx = { 
    ...transaction.value, 
    id: Date.now(),
    pricePerGram: latestPrice.value, 
  };
  transactions.value.unshift(tx);
  saveLocal();
  drawDonut();

  // Integrasi Supabase: simpan ke table transaction
  try {
    let price;
    if (isBackdate(tx.date)) {
      price = parseInt(tx.manualPrice.toString().replace(/\D/g, ''), 10) || 0;
    } else {
      price = latestPrice.value * 100;
    }
    const total_price = price * tx.count;
    const { error } = await supabase.from('transactions').insert([
      {
        user_phone: props.user.phone,
        type: tx.type,
        brand: tx.brand,
        denom: tx.denom,
        count: tx.count,
        date: tx.date,
        price: price,
        total_price: total_price
      }
    ]);
    if (error) {
      throw error;
    }
    // Sinkronisasi otomatis: fetch ulang transaksi dari Supabase
    await fetchTransactionsFromSupabase();
    // Notif sukses dan reset field
    showSuccess.value = true;
    setTimeout(() => {
      showSuccess.value = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1000);
    transaction.value = { date: new Date().toISOString().split('T')[0], type: 'beli', brand: 'Galeri24', denom: 1, count: 1 };
  } catch (e) {
    showError.value = true;
    errorMsg.value = 'Gagal simpan ke database!';
  }

  // Reset form dengan tanggal baru
  transaction.value = { date: new Date().toISOString().split('T')[0], type: 'beli', brand: 'Galeri24', denom: 1, count: 1 };
}

function clearAll() { 
  if (!confirm('Hapus semua data transaksi dan histori harga?')) return;
  transactions.value = [];
  priceHistory.value = []; 
  localStorage.removeItem('pg_tx'); 
  localStorage.removeItem('pg_price_history');
  drawDonut();
  drawLine();
}

function brandColor(b) { 
    return BRAND_COLORS[b] || '#999'; 
}

// --- API Functions ---
// NOTE: These API calls will only work if the application is running in an environment 
// that can proxy the `/api/prices` endpoint to the actual Pegadaian API.
async function fetchLatestPrice() {
  apiStatus.value = 'loading';
  try {
    // Assuming /api/prices/savings is a proxy to the Pegadaian API
    const res = await axios.get('/api/prices/savings', { timeout: 7000 });
    
    if (res && res.data && res.data.data) {
      const d = res.data.data;
      // Use hargaJual (Sell Price) as the market price
      latestPrice.value = Number(d.hargaJual) || Number(d.hargaBeli) || 0; 
      latestDate.value = d.tglBerlaku || '-';
      apiStatus.value = 'ok';
    } else {
      apiStatus.value = 'no-data';
    }
  } catch (err) {
    console.warn('fetchLatestPrice failed', err && err.message);
    apiStatus.value = 'failed';
  }
}

async function fetchPriceChart() {
  try {
    // Assuming /api/prices/chart is a proxy to the Pegadaian chart API
    const res = await axios.get('/api/prices/chart?interval=7&isRequest=true', { timeout: 7000 });
    
    if (res?.data?.data?.priceList) {
      priceHistory.value = res.data.data.priceList.map(p => ({ 
        date: p.lastUpdate ? p.lastUpdate.split(' ')[0] : (p.lastUpdate || ''), 
        price: Number(p.hargaJual) 
      })).filter(p => p.price > 0);
      localStorage.setItem('pg_price_history', JSON.stringify(priceHistory.value));
    }
  } catch (err) {
    console.warn('fetchPriceChart failed', err && err.message);
  }
}

async function fetchTransactionsFromSupabase() {
  if (props.user && props.user.phone) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_phone', props.user.phone)
      .order('date', { ascending: false });
    if (!error && data) {
      transactions.value = data;
    }
  }
}

// --- Computed Properties ---
function numberWithCommas(x) { 
    if(x == null || isNaN(x)) return '-'; 
    return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); 
}

const totalGold = computed(() => 
  transactions.value.reduce((s, t) => s + (Number(t.denom) * Number(t.count) * (t.type === 'beli' ? 1 : -1)), 0)
);

const avgPrice = computed(() => {
  // Ambil hanya transaksi beli
  const buys = transactions.value.filter(t => t.type === 'beli' && t.total_price > 0 && t.denom > 0);
  if (buys.length === 0) return latestPrice.value || 0;
  // sum(total_price) / sum(denom*100)
  const sumTotal = buys.reduce((s, t) => s + Number(t.total_price), 0);
  const sumGram = buys.reduce((s, t) => s + (Number(t.denom) * Number(t.count) * 100), 0);
  return sumGram > 0 ? Math.round(sumTotal / sumGram) : 0;
});

const totalPorto = computed(() => 
    numberWithCommas(latestPrice.value * totalGold.value * 100)
);
const avgPriceFormatted = computed(() => 
    numberWithCommas(avgPrice.value)
);
const latestPriceFormatted = computed(() => 
    numberWithCommas(latestPrice.value)
);

const potentialProfit = computed(() => 
    Math.round(((latestPrice.value) - (avgPrice.value)) * totalGold.value)
);

const potentialProfitFormatted = computed(() => 
    numberWithCommas(potentialProfit.value)
);

const profitPercent = computed(() => { 
    const avg = avgPrice.value || 1; 
    const p = Math.round(((latestPrice.value || 0) - avg) / avg * 100); 
    return `${p}%`; 
});

const donutData = computed(() => {
  const result = {};
  transactions.value
    .filter(t => t.type === 'beli')
    .forEach(t => {
      const b = t.brand || 'Other';
      if (!result[b]) result[b] = { gram: 0, nominal: 0 };
      result[b].gram += Number(t.denom) * Number(t.count);
      // Nominal = gram * harga terakhir (per gram) * 100
      result[b].nominal += Number(t.denom) * Number(t.count) * latestPrice.value * 100;
    });
  return result;
});
const donutBrands = computed(() => Object.keys(donutData.value));

// --- Chart Functions ---
function drawDonut() {
  const ctx = document.getElementById('donutChart');
  if (!ctx) return;
  
  const groups = {};
  transactions.value
    .filter(t => t.type === 'beli') // Only count gold owned (beli)
    .forEach(t => { 
        const b = t.brand || 'Other'; 
        groups[b] = (groups[b] || 0) + (Number(t.denom) * Number(t.count)); 
    });
    
  const labels = Object.keys(groups);
  const data = labels.map(l => groups[l]);
  const colors = labels.map(l => BRAND_COLORS[l] || '#999');

  const config = {
    type: 'doughnut',
    data: {
      labels: labels.length > 0 ? labels : ['No Data'], 
      datasets: [{ 
        data: labels.length > 0 ? data : [1], 
        backgroundColor: labels.length > 0 ? colors : ['#e6f6ec'] 
      }] 
    },
    options: { 
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
            legend: { 
                position: 'right' 
            } 
        } 
    }
  };

  if (donutChartInstance) {
    donutChartInstance.data.labels = config.data.labels;
    donutChartInstance.data.datasets[0].data = config.data.datasets[0].data;
    donutChartInstance.data.datasets[0].backgroundColor = config.data.datasets[0].backgroundColor;
    donutChartInstance.update();
  } else {
    donutChartInstance = new Chart(ctx, config);
  }
}

function drawLine() {
  const ctx = document.getElementById('lineChart');
  if (!ctx) return;
  
  const labels = priceHistory.value.map(p => p.date);
  const data = priceHistory.value.map(p => p.price);

  const config = {
    type: 'line',
    data: { 
        labels: labels.length > 0 ? labels : ['-'], 
        datasets: [{ 
            label: 'Harga Jual /gram (Rp)', 
            data: data.length > 0 ? data : [0], 
            borderColor: BRAND_COLORS.Galeri24,
            backgroundColor: BRAND_COLORS.Galeri24,
            tension: 0, // garis tajam (tidak melengkung)
            pointRadius: 5,
            fill: true,
        }] 
    },
    options: { 
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
            legend: { display: false },
            tooltip: { callbacks: { label: (context) => `Rp ${numberWithCommas(context.raw)}` } }
        }, 
        scales: { 
            y: { beginAtZero: false, ticks: { callback: (value) => `Rp ${numberWithCommas(value)}` } },
            x: { reverse: false }
        } 
    }
  };

  if (lineChartInstance) {
    lineChartInstance.data.labels = config.data.labels;
    lineChartInstance.data.datasets[0].data = config.data.datasets[0].data;
    lineChartInstance.data.datasets[0].backgroundColor = config.data.datasets[0].backgroundColor;
    lineChartInstance.data.datasets[0].borderColor = config.data.datasets[0].borderColor;
    lineChartInstance.data.datasets[0].fill = config.data.datasets[0].fill;
    lineChartInstance.data.datasets[0].tension = config.data.datasets[0].tension;
    lineChartInstance.update();
  } else {
    lineChartInstance = new Chart(ctx, config);
  }
}

function isBackdate(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  const input = new Date(dateStr);
  today.setHours(0,0,0,0);
  input.setHours(0,0,0,0);
  return input < today;
}

function formatRupiah(value) {
  if (!value) return '';
  const num = value.toString().replace(/[^\d]/g, '');
  return 'Rp ' + num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function unformatRupiah(value) {
  return value ? value.toString().replace(/[^\d]/g, '') : '';
}
</script>

<style scoped>
.welcome-fade {
  opacity: 1;
  animation: fadeInOut 3s cubic-bezier(0.4,0,0.2,1);
}
.center-popup {
  position: fixed;
  top: 10%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  min-width: 300px;
  max-width: 90vw;
  text-align: center;
  transition: opacity 0.7s, transform 0.7s;
}
@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, -60%) scale(0.95); }
  10% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  90% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -60%) scale(0.95); }
}
</style>