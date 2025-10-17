<template>
  <v-card class="mb-4 chart-card" rounded="xl" elevation="0">
    <!-- Accent bar -->
    <div class="card-accent"></div>
    
    <v-card-title class="d-flex align-center px-4 py-4">
      <div class="icon-container mr-3">
        <v-icon size="28" color="white">mdi-chart-line</v-icon>
      </div>
      <div class="flex-grow-1">
        <div class="d-flex align-center justify-space-between flex-wrap">
          <div>
            <div class="text-h6 font-weight-bold" style="color: #2e2e2e;">Grafik Harga Emas</div>
            <div class="text-caption" style="color: #6b6b6b;">Pergerakan harga 7 hari terakhir</div>
          </div>
          <v-chip size="small" class="pulse-chip" style="background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); color: white;">
            <v-icon start size="16">mdi-chart-timeline-variant</v-icon>
            {{ priceHistory.length }} Data
          </v-chip>
        </div>
      </div>
    </v-card-title>
    
    <v-divider></v-divider>
    
    <v-card-text class="px-4 py-4">
      <!-- Filter Section -->
      <v-row class="mb-4 filter-row">
        <v-col cols="12" sm="6" md="6">
          <div class="filter-label mb-2">
            <v-icon size="18" class="mr-1" color="#0B6B3A">mdi-tag</v-icon>
            <span class="text-caption font-weight-bold" style="color: #2e2e2e;">Pilih Merk</span>
          </div>
          <v-select
            v-model="selectedBrand"
            :items="goldBrands"
            variant="outlined"
            density="comfortable"
            hide-details
            class="custom-select"
            :loading="isLoadingData"
            :disabled="isLoadingData"
          >
            <template v-slot:prepend-inner>
              <img
                :src="getBrandLogo(selectedBrand)"
                :alt="`${selectedBrand} logo`"
                class="brand-logo mr-1"
                style="width: 18px; height: 18px; object-fit: contain; vertical-align: middle;"
              />
            </template>
          </v-select>
        </v-col>
        <v-col cols="12" sm="6" md="6">
          <div class="filter-label mb-2">
            <v-icon size="18" class="mr-1" color="#0B6B3A">mdi-weight-gram</v-icon>
            <span class="text-caption font-weight-bold" style="color: #2e2e2e;">Pilih Denominasi (gr)</span>
          </div>
          <v-select
            v-model="selectedDenom"
            :items="denomOptions"
            variant="outlined"
            density="comfortable"
            hide-details
            class="custom-select"
            :loading="isLoadingData"
            :disabled="isLoadingData"
          >
            <template v-slot:prepend-inner>
              <v-icon color="#0B6B3A">mdi-scale-balance</v-icon>
            </template>
          </v-select>
        </v-col>
      </v-row>
      
      <!-- Chart Section -->
      <div class="chart-wrapper">
        <div class="chart-header mb-3">
          <v-chip 
            size="small" 
            class="chart-info-chip"
            style="background: linear-gradient(135deg, #0B6B3A 0%, #1aa251 100%); color: white; font-weight: 600;"
          >
            <v-icon start size="16">mdi-trending-up</v-icon>
            {{ selectedBrand }} - {{ selectedDenom }}g
          </v-chip>
          <div class="price-stats">
            <div v-if="priceHistory.length > 0" class="stats-group">
              <div class="stat-item">
                <span class="stat-label">Tertinggi</span>
                <span class="stat-value high">{{ formatPrice(getHighestPrice()) }}</span>
              </div>
              <v-divider vertical class="mx-2"></v-divider>
              <div class="stat-item">
                <span class="stat-label">Terendah</span>
                <span class="stat-value low">{{ formatPrice(getLowestPrice()) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="chart-container-line">
          <canvas id="lineChart"></canvas>
        </div>
        
        <!-- Empty State -->
        <div v-if="priceHistory.length === 0" class="empty-state">
          <v-icon size="64" color="#ccc">mdi-chart-line-variant</v-icon>
          <div class="text-subtitle-1 mt-2" style="color: #999;">Tidak ada data tersedia</div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>
<script setup>
import { ref, watch, onMounted, nextTick, computed } from 'vue';
import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip, Legend } from 'chart.js';
import { supabase } from '../lib/SupabaseClient';
import antam from '@/assets/gold/antam.png';
import galeri24 from '@/assets/gold/galery24.png';
import ubs from '@/assets/gold/ubs.png';

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip, Legend);

// State
const selectedBrand = ref('Galeri24');
const selectedDenom = ref(1);
const goldPriceHistory = ref([]);
const goldBrands = ref([]);
const denomOptions = ref([]);
const isLoadingData = ref(false);
let lineChartInstance = null;

// Constants
const BRAND_COLORS = { 
  Galeri24: '#0B6B3A', 
  Antam: '#C69C2F', 
  UBS: '#6B6B6B' 
};

// Computed
const priceHistory = computed(() => goldPriceHistory.value);

// Helper Functions
function numberWithCommas(x) { 
  if (x == null || isNaN(x)) return '-'; 
  return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); 
}

function getHighestPrice() {
  if (!priceHistory.value || priceHistory.value.length === 0) return 0;
  return Math.max(...priceHistory.value.map(p => p.price_buyback || p.price_sell || 0));
}

function getLowestPrice() {
  if (!priceHistory.value || priceHistory.value.length === 0) return 0;
  return Math.min(...priceHistory.value.map(p => p.price_buyback || p.price_sell || 0));
}

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

// Fetch brands from Supabase
async function fetchBrands() {
  isLoadingData.value = true;
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('brand')
      .order('brand', { ascending: true });
    
    if (error) {
      console.error('Error fetching brands for chart:', error);
      // Fallback to default brands
      goldBrands.value = ['Galeri24', 'Antam', 'UBS'];
    } else {
      // Get unique brands
      goldBrands.value = [...new Set(data.map(b => b.brand))];
      
      // Set default if available
      if (goldBrands.value.length > 0 && !goldBrands.value.includes(selectedBrand.value)) {
        selectedBrand.value = goldBrands.value[0];
      }
    }
  } catch (err) {
    console.error('Exception fetching brands for chart:', err);
    goldBrands.value = ['Galeri24', 'Antam', 'UBS'];
  } finally {
    isLoadingData.value = false;
  }
}

// Fetch denominations from gold_prices table
async function fetchDenominations() {
  try {
    const { data, error } = await supabase
      .from('gold_prices_v2')
      .select('denom')
    
    if (error) {
      console.error('Error fetching denominations for chart:', error);
      // Fallback to default denominations
      denomOptions.value = [0.1, 0.2, 0.5, 1, 2, 5, 10, 25, 50, 100];
    } else {
      // Get unique denominations
      const uniqueDenoms = [...new Set(data.map(d => Number(d.denom)))];
      denomOptions.value = uniqueDenoms.sort((a, b) => a - b);
      
      // If no data, use defaults
      if (denomOptions.value.length === 0) {
        denomOptions.value = [0.1, 0.2, 0.5, 1, 2, 5, 10, 25, 50, 100];
      }
      
      // Set default if available
      if (denomOptions.value.length > 0 && !denomOptions.value.includes(selectedDenom.value)) {
        selectedDenom.value = denomOptions.value[0];
      }
    }
  } catch (err) {
    console.error('Exception fetching denominations for chart:', err);
    denomOptions.value = [0.1, 0.2, 0.5, 1, 2, 5, 10, 25, 50, 100];
  }
}

// API Functions
async function fetchGoldPricesFromSupabase(brand = 'Galeri24', denom = 1) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const startDate = sevenDaysAgo.toISOString();
  const { data, error } = await supabase
    .from('gold_prices_v2')
    .select('*')
    .eq('brand', brand)
    .eq('denom', denom)
    .gte('date', startDate) // Greater than or equal to 7 days ago
    .order('date', { ascending: true }) // Orders chronologically
    .order('brand', { ascending: true })
    .limit(7);
    
  if (!error && data) {
    goldPriceHistory.value = data.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else {
    goldPriceHistory.value = [];
  }
}

// Chart Drawing
function drawLineChart() {
  const ctx = document.getElementById('lineChart');
  if (!ctx) return;
  
  const labels = goldPriceHistory.value.map(p => p.date);
  const data = goldPriceHistory.value.map(p => p.price_buyback);
  
  const config = {
    type: 'line',
    data: {
      labels: labels.length > 0 ? labels : ['-'],
      datasets: [{
        label: `Harga Jual /gram (Rp) - ${selectedBrand.value}`,
        data: data.length > 0 ? data : [0],
        borderColor: BRAND_COLORS[selectedBrand.value] || '#0B6B3A',
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
        tooltip: { 
          callbacks: { 
            label: (context) => `Rp ${numberWithCommas(context.raw)}` 
          } 
        }
      },
      scales: {
        y: { 
          beginAtZero: false, 
          ticks: { 
            callback: (value) => `Rp ${numberWithCommas(value)}` 
          } 
        },
        x: { reverse: false }
      }
    }
  };
  
  if (lineChartInstance) {
    lineChartInstance.data.labels = config.data.labels;
    lineChartInstance.data.datasets[0].data = config.data.datasets[0].data;
    lineChartInstance.data.datasets[0].borderColor = config.data.datasets[0].borderColor;
    lineChartInstance.update();
  } else {
    lineChartInstance = new Chart(ctx, config);
  }
}

function getBrandLogo(brand) {
  // safe key for matching
  if (!brand) return galeri24;
  const key = String(brand).toLowerCase().replaceAll(/\s+/g, '').replaceAll(/[^a-z0-9]/g, '');
  if (key.includes('antam')) return antam;
  if (key.includes('ubs')) return ubs;
  // match variations of galeri/galery names
  if (key.includes('galeri') || key.includes('galery') || key.includes('galeri24') || key.includes('galery24')) return galeri24;
  // fallback
  return galeri24;
}

// Lifecycle
onMounted(async () => {
  // Fetch brands and denominations first
  await Promise.all([
    fetchBrands(),
    fetchDenominations()
  ]);
  
  // Then fetch price history
  await fetchGoldPricesFromSupabase(selectedBrand.value, selectedDenom.value);
  
  nextTick(() => {
    drawLineChart();
  });
});

// Watchers
watch([selectedBrand, selectedDenom], async ([brand, denom]) => {
  await fetchGoldPricesFromSupabase(brand, denom);
  nextTick(() => {
    drawLineChart();
  });
});
</script>

<style scoped>
.chart-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid #e8e8e8;
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.6s ease-out;
  transition: all 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(11, 107, 58, 0.15) !important;
}

/* Accent bar at top */
.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #0B6B3A 0%, #1aa251 50%, #D4AF37 100%);
  animation: shimmer 3s ease-in-out infinite;
}

.icon-container {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  background: linear-gradient(135deg, #0B6B3A 0%, #1aa251 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(33, 150, 243, 0.35);
  transition: all 0.3s ease;
  animation: iconPulse 2s ease-in-out infinite;
}

.icon-container:hover {
  transform: rotate(5deg) scale(1.05);
}

.pulse-chip {
  animation: pulseChip 2s ease-in-out infinite;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
}

.filter-row {
  animation: slideInRight 0.6s ease-out 0.1s backwards;
}

.filter-label {
  display: flex;
  align-items: center;
  color: #2e2e2e;
}

.custom-select {
  background: white;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.custom-select:hover {
  box-shadow: 0 4px 12px rgba(11, 107, 58, 0.1);
}

.chart-wrapper {
  padding: 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%);
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 2px solid rgba(11, 107, 58, 0.08);
  animation: chartFadeIn 0.8s ease-out 0.2s backwards;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.chart-info-chip {
  animation: slideInLeft 0.6s ease-out 0.3s backwards;
  box-shadow: 0 3px 10px rgba(11, 107, 58, 0.25);
}

.price-stats {
  animation: slideInRight 0.6s ease-out 0.4s backwards;
}

.stats-group {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: #757575;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 0.85rem;
  font-weight: 700;
}

.stat-value.high {
  color: #0B6B3A;
}

.stat-value.low {
  color: #d32f2f;
}

.chart-container-line {
  height: 320px;
  position: relative;
  animation: chartZoom 1s ease-out 0.5s backwards;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 320px;
  animation: fadeIn 0.6s ease-out;
}

/* Keyframe Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes chartFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes chartZoom {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulseChip {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
}

@keyframes iconPulse {
  0%, 100% {
    box-shadow: 0 4px 16px rgba(33, 150, 243, 0.35);
  }
  50% {
    box-shadow: 0 6px 24px rgba(33, 150, 243, 0.5);
  }
}

@keyframes shimmer {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Mobile Responsiveness */
@media (max-width: 960px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .stats-group {
    width: 100%;
    justify-content: space-around;
  }
}

@media (max-width: 600px) {
  .chart-card .v-card-title {
    padding: 12px 16px !important;
  }
  
  .chart-card .v-card-text {
    padding: 16px 12px !important;
  }
  
  .chart-card .text-h6 {
    font-size: 1rem !important;
  }
  
  .chart-card .text-caption {
    font-size: 0.7rem !important;
  }
  
  .chart-card:hover {
    transform: translateY(-2px);
  }
  
  .icon-container {
    width: 40px;
    height: 40px;
  }
  
  .filter-row .v-col {
    padding: 4px 8px !important;
  }
  
  .filter-label {
    margin-bottom: 6px !important;
  }
  
  .filter-label .text-caption {
    font-size: 0.7rem !important;
  }
  
  .custom-select {
    font-size: 0.85rem;
  }
  
  .chart-wrapper {
    padding: 12px;
  }
  
  .chart-header {
    margin-bottom: 12px !important;
    flex-direction: column;
    gap: 8px;
  }
  
  .chart-info-chip {
    font-size: 0.75rem;
    height: 24px;
  }
  
  .chart-container-line {
    height: 200px;
  }
  
  .empty-state {
    height: 200px;
  }
  
  .empty-state .v-icon {
    font-size: 48px !important;
  }
  
  .empty-state .text-h6 {
    font-size: 0.9rem !important;
  }
  
  .empty-state .text-body-2 {
    font-size: 0.75rem !important;
  }
  
  .stats-group {
    padding: 6px 10px;
    width: 100%;
    justify-content: center;
  }
  
  .stat-item {
    gap: 2px;
  }
  
  .stat-value {
    font-size: 0.7rem;
  }
  
  .stat-label {
    font-size: 0.55rem;
  }
  
  .pulse-chip {
    font-size: 0.7rem !important;
    height: 24px !important;
  }
}
</style>
