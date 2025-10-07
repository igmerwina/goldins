<template>
  <v-container fluid class="dashboard-container">
    <v-row justify="center">
      <v-col cols="12" sm="12" md="10" lg="9" xl="8" class="dashboard-content">
        <!-- Welcome Banner Animation -->
        <transition name="slide-fade">
          <div v-if="showWelcomeBanner" class="welcome-banner">
            <v-icon size="32" color="white" class="mr-3">mdi-hand-wave</v-icon>
            <div>
              <div class="text-h6 font-weight-bold">Selamat Datang, {{ user.name }}!</div>
              <div class="text-caption">Kelola portofolio emas Anda dengan mudah</div>
            </div>
            <v-btn icon size="small" variant="text" color="white" @click="showWelcomeBanner = false" class="ml-auto">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </transition>

        <PortfolioSummary
          ref="portfolioSummaryRef"
          :user="user"
          :totalGold="totalGold"
          :totalPorto="totalPorto"
          :latestDate="latestDate"
          :latestPriceFormatted="latestPriceFormatted"
          :avgPriceFormatted="avgPriceFormatted"
          :potentialProfit="potentialProfit"
          :potentialProfitFormatted="potentialProfitFormatted"
          :profitPercent="profitPercent"
          :donutBrands="donutBrands"
          :donutData="donutData"
          :numberWithCommas="numberWithCommas"
          :transactions="transactions"
        />
        <GoldComposition
          :donutBrands="donutBrands"
          :donutData="donutData"
          :numberWithCommas="numberWithCommas"
        />
        <TransactionForm
          :transaction="transaction"
          :today="today"
          :addTransaction="addTransaction"
          :formatRupiah="formatRupiah"
          :unformatRupiah="unformatRupiah"
        />
        <GoldPriceChart
          :selectedBrand="selectedBrand"
          :goldBrands="goldBrands"
          :selectedDenom="selectedDenom"
          :denomOptions="denomOptions"
          :priceHistory="goldPriceHistory"
          @update:selectedBrand="val => selectedBrand = val"
          @update:selectedDenom="val => selectedDenom = val"
        />
        <TransactionHistory
          :transactions="transactions"
          :brandColor="brandColor"
          @delete-transaction="deleteTransaction"
        />
        <AppFeedback 
          @feedback-given="onFeedbackGiven" 
          @download-report="onDownloadReport"
        />
        
        <!-- Back to Top Button -->
        <transition name="scale-fade">
          <v-btn
            v-if="showBackToTop"
            fab
            fixed
            bottom
            right
            color="#0B6B3A"
            elevation="8"
            size="large"
            class="back-to-top-btn"
            @click="scrollToTop"
          >
            <v-icon size="28" color="white">mdi-chevron-up</v-icon>
          </v-btn>
        </transition>
      </v-col>
    </v-row>
    <!-- Alerts tetap di root -->
    <v-alert v-if="showWelcome" type="success" class="welcome-fade center-popup" border="start" prominent elevation="10">
      Selamat datang, <b>{{ welcomeName }}</b>!
    </v-alert>
    <v-alert v-if="showError" type="error" class="welcome-fade center-popup" border="start" prominent elevation="10">
      {{ errorMsg }}
    </v-alert>
    <v-alert v-if="showSuccess" type="success" class="welcome-fade center-popup" border="start" prominent elevation="10">
      Data transaksi berhasil disimpan!
    </v-alert>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, defineProps, watch, nextTick } from 'vue';
import axios from 'axios';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend, LineController, LineElement, PointElement, CategoryScale, LinearScale, Filler } from 'chart.js';
import { supabase } from '../lib/SupabaseClient';

import PortfolioSummary from './PortfolioSummary.vue';
import TransactionForm from './TransactionForm.vue';
import GoldPriceChart from './GoldPriceChart.vue';
import TransactionHistory from './TransactionHistory.vue';
import GoldComposition from './GoldComposition.vue';
import AppFeedback from './AppFeedback.vue';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend, LineController, LineElement, PointElement, CategoryScale, LinearScale, Filler);

const props = defineProps({
  user: Object
});

const transaction = ref({ date: new Date().toISOString().split('T')[0], type: 'beli', brand: 'Galeri24', denom: 1, count: 1 });
const transactions = ref([]);
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

const goldPriceHistory = ref([]); // Data harga emas dari Supabase
const selectedBrand = ref('Galeri24');
const goldBrands = ref(['Galeri24', 'Antam', 'UBS']);
const denomOptions = [0.5, 1, 2, 5, 10, 25, 50, 100];
const selectedDenom = ref(1);

const portfolioSummaryRef = ref(null);

const showWelcomeBanner = ref(true);
const showBackToTop = ref(false);

async function fetchGoldPricesFromSupabase(brand = 'Galeri24', denom = 1) {
  // Ambil 7 data terakhir untuk merk dan denominasi tertentu
  const { data, error } = await supabase
    .from('gold_prices')
    .select('*')
    .eq('brand', brand)
    .eq('denom', denom)
    .order('date', { ascending: false })
    .limit(7);
  if (!error && data) {
    goldPriceHistory.value = data.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else {
    goldPriceHistory.value = [];
  }
}

onMounted(async () => {
  await fetchTransactionsFromSupabase();
  await fetchLatestPrice();
  await fetchGoldPricesFromSupabase(selectedBrand.value, selectedDenom.value);
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
  
  // Handle scroll for back-to-top button
  window.addEventListener('scroll', handleScroll);
  
  // Hide welcome banner after 5 seconds
  setTimeout(() => {
    showWelcomeBanner.value = false;
  }, 5000);
});

// --- Data & Persistence Functions ---
async function addTransaction() {
  if (!transaction.value.manualPrice) {
    showError.value = true;
    errorMsg.value = 'Harga Beli Emas wajib diisi!';
    return;
  }
  // Validasi jual: cek saldo gram & keping seperti di TransactionForm.vue
  if (transaction.value.type === 'jual') {
    const brand = transaction.value.brand;
    // Hitung saldo gram dan keping user untuk brand ini
    let totalGram = 0;
    let totalKeping = 0;
    if (Array.isArray(transactions.value)) {
      transactions.value.forEach(t => {
        if (t.brand === brand && t.user_phone === props.user.phone) {
          const gram = Number(t.denom) * Number(t.count);
          if (t.type === 'beli') {
            totalGram += gram;
            totalKeping += Number(t.count);
          } else if (t.type === 'jual') {
            totalGram -= gram;
            totalKeping -= Number(t.count);
          }
        }
      });
    }
    // Validasi: apakah user punya keping emas merek ini
    const hasAny = Array.isArray(transactions.value) && transactions.value.some(t => t.brand === brand && t.user_phone === props.user.phone && t.type === 'beli');
    if (!hasAny) {
      showError.value = true;
      errorMsg.value = `Anda tidak punya keping emas merek ${brand}`;
      setTimeout(() => { showError.value = false; }, 2000);
      return;
    }
    const jualGram = Number(transaction.value.denom) * Number(transaction.value.count);
    const jualKeping = Number(transaction.value.count);
    if (totalGram < jualGram || totalKeping < jualKeping) {
      showError.value = true;
      errorMsg.value = `Jumlah jual melebihi saldo emas ${brand} Anda (${totalGram.toFixed(2)} gr, ${totalKeping} keping)`;
      setTimeout(() => { showError.value = false; }, 2000);
      return;
    }
  }
  const tx = { 
    ...transaction.value, 
    id: Date.now(),
    pricePerGram: latestPrice.value, 
  };
  transactions.value.unshift(tx);
  drawDonut();

  // Integrasi Supabase: simpan ke table transaction
  try {
    const price = Number(tx.manualPrice && tx.manualPrice.toString().replace(/[^\d]/g, '')) || 0;
    const total_price = price * tx.count * tx.denom;
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

async function deleteTransaction(tx) {
  // Hapus dari Supabase jika ada id unik di database
  if (tx.id) {
    try {
      await supabase.from('transactions').delete().eq('id', tx.id);
    } catch (e) {
      // fallback: tetap hapus dari array meski gagal hapus di db
    }
  }
  // Hapus dari array lokal
  const idx = transactions.value.findIndex(t => t.id === tx.id);
  if (idx !== -1) {
    transactions.value.splice(idx, 1);
  }
  // Sinkronisasi ulang jika perlu
  // await fetchTransactionsFromSupabase();
  // Notifikasi sudah dihandle di child
}

function clearAll() { 
  if (!confirm('Hapus semua data transaksi dan histori harga?')) return;
  transactions.value = [];
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
    const todayStr = new Date().toISOString().split('T')[0];
    let prices = [];
    for (const brand of goldBrands.value) {
      const { data, error } = await supabase
        .from('gold_prices')
        .select('date,price_buyback')
        .eq('brand', brand)
        .eq('denom', 1)
        .lte('date', todayStr)
        .order('date', { ascending: false })
        .limit(1);
      if (!error && data && data.length > 0) {
        prices.push(Number(data[0].price_buyback) || 0);
        latestDate.value = data[0].date;
      }
    }
    if (prices.length > 0) {
      latestPrice.value = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
      apiStatus.value = 'ok';
    } else {
      latestPrice.value = 0;
      apiStatus.value = 'no-data';
    }
  } catch (err) {
    console.warn('fetchLatestPrice failed', err && err.message);
    apiStatus.value = 'failed';
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
  // sum(total_price) / sum(denom)
  const sumTotal = buys.reduce((s, t) => s + Number(t.total_price), 0);
  const sumGram = buys.reduce((s, t) => s + (Number(t.denom) * Number(t.count)), 0);
  return sumGram > 0 ? Math.round(sumTotal / sumGram) : 0;
});

const totalPorto = computed(() => 
    numberWithCommas(latestPrice.value * totalGold.value)
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
  transactions.value.forEach(t => {
    const b = t.brand || 'Other';
    if (!result[b]) result[b] = { gram: 0, nominal: 0 };
    // Gram: akumulasi beli - jual
    const gram = Number(t.denom) * Number(t.count) * (t.type === 'beli' ? 1 : -1);
    result[b].gram += gram;
    // Nominal: akumulasi total_price beli - jual
    const nominal = Number(t.total_price) * (t.type === 'beli' ? 1 : -1);
    result[b].nominal += nominal;
  });
  // Pastikan tidak negatif
  Object.keys(result).forEach(b => {
    result[b].gram = Math.max(result[b].gram, 0);
    result[b].nominal = Math.max(result[b].nominal, 0);
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
  const labels = goldPriceHistory.value.map(p => p.date);
  // Ambil data dari kolom price_buyback
  const data = goldPriceHistory.value.map(p => p.price_buyback);
  const config = {
    type: 'line',
    data: {
      labels: labels.length > 0 ? labels : ['-'],
      datasets: [{
        label: `Harga Jual /gram (Rp) - ${selectedBrand.value}`,
        data: data.length > 0 ? data : [0],
        borderColor: BRAND_COLORS[selectedBrand.value] || '#0B6B3A',
        // backgroundColor: BRAND_COLORS[selectedBrand.value] || '#0B6B3A',
        tension: 0,
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

watch([selectedBrand, selectedDenom], async ([brand, denom]) => {
  await fetchGoldPricesFromSupabase(brand, denom);
  drawLine();
});


function formatRupiah(value) {
  if (!value) return '';
  const num = value.toString().replace(/[^\d]/g, '');
  return 'Rp ' + num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function unformatRupiah(value) {
  return value ? value.toString().replace(/[^\d]/g, '') : '';
}

function onFeedbackGiven() {
  if (portfolioSummaryRef.value && portfolioSummaryRef.value.enableDownloadReportWithDelay) {
    portfolioSummaryRef.value.enableDownloadReportWithDelay();
  }
}

function onDownloadReport() {
  // Trigger download report dari PortfolioSummary
  if (portfolioSummaryRef.value && portfolioSummaryRef.value.generateReport) {
    portfolioSummaryRef.value.generateReport();
  }
}

function handleScroll() {
  showBackToTop.value = window.scrollY > 300;
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
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

.dashboard-container {
  padding: 16px 8px;
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
  min-height: 100vh;
}

.dashboard-content {
  animation: fadeInUp 0.6s ease-out;
}

.welcome-banner {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #0B6B3A 0%, #1aa251 100%);
  color: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(11, 107, 58, 0.25);
  animation: slideDown 0.5s ease-out;
}

.back-to-top-btn {
  position: fixed !important;
  bottom: 24px !important;
  right: 24px !important;
  z-index: 999;
  box-shadow: 0 8px 24px rgba(11, 107, 58, 0.35) !important;
  transition: all 0.3s ease;
}

.back-to-top-btn:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 32px rgba(11, 107, 58, 0.45) !important;
}

.back-to-top-btn:active {
  transform: translateY(0) scale(0.95);
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-fade-enter-active {
  transition: all 0.5s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.scale-fade-enter-active {
  transition: all 0.3s ease;
}

.scale-fade-leave-active {
  transition: all 0.2s ease;
}

.scale-fade-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.scale-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Mobile Optimizations */
@media (max-width: 600px) {
  .dashboard-container {
    padding: 12px 4px;
  }
  
  .welcome-banner {
    padding: 16px 20px;
    margin-bottom: 16px;
    font-size: 0.9rem;
  }
  
  .back-to-top-btn {
    bottom: 16px !important;
    right: 16px !important;
  }
}
</style>