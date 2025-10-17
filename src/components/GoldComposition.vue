<template>
  <v-card class="mb-4 composition-card" rounded="xl" elevation="8" style="background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); border: 1px solid #e0e0e0; overflow: hidden;">
    <div class="card-accent"></div>
    <v-card-title class="d-flex align-center px-4 py-4 title-wrapper">
      <div class="icon-container mr-3">
        <v-icon size="28" color="white">mdi-chart-donut</v-icon>
      </div>
      <div class="flex-grow-1">
        <!-- <div class="text-h8 font-weight-bold" style="color: #2e2e2e;">Komposisi EmasKu</div> -->
        <div class="text-caption" style="color: #6b6b6b;">Distribusi portfolio berdasarkan merk</div>
      </div>
      <v-chip 
        v-if="donutBrands.length > 0" 
        size="small" 
        color="#0B6B3A" 
        variant="flat"
        class="pulse-chip brand-count-chip"
      >
        <v-icon start size="16">mdi-chart-pie</v-icon>
        {{ donutBrands.length }} Merk
      </v-chip>
    </v-card-title>
    <v-divider class="mx-4"></v-divider>
    <v-card-text class="px-4 py-6">
      <v-row v-if="donutBrands.length === 0" class="text-center py-8">
        <v-col cols="12">
          <v-icon size="80" color="grey-lighten-2" class="mb-4">mdi-chart-donut</v-icon>
          <div class="text-h6 font-weight-medium mb-2" style="color: #9e9e9e;">Belum Ada Data</div>
          <div class="text-body-2" style="color: #bdbdbd;">Tambahkan transaksi untuk melihat komposisi emas Anda</div>
        </v-col>
      </v-row>
      <template v-else>
        <!-- Desktop: Show chart + cards -->
        <div class="desktop-view">
          <div class="chart-wrapper">
            <div class="chart-container d-flex justify-center align-center">
              <canvas id="donutChart"></canvas>
            </div>
          </div>
          <div class="mt-6">
            <v-row>
              <v-col v-for="(brand, index) in donutBrands" :key="brand" cols="12" sm="4" class="brand-col">
                <div class="brand-card" :style="{ animationDelay: `${index * 0.1}s` }">
                  <div class="brand-header">
                    <div class="d-flex align-center mb-2">
                      <div :class="['brand-dot', `brand-${brand.toLowerCase()}`]"></div>
                      <div class="brand-name font-weight-bold ml-2">{{ brand }}</div>
                    </div>
                    <v-chip size="x-small" :color="getBrandColor(brand)" variant="tonal" class="percent-chip">
                      {{ getPercentage(brand) }}%
                    </v-chip>
                  </div>
                  <v-divider class="my-2"></v-divider>
                  <div class="brand-stats">
                    <div class="stat-item mb-1">
                      <v-icon size="14" color="#0B6B3A" class="mr-1">mdi-weight-gram</v-icon>
                      <span class="stat-value font-weight-bold">{{ donutData[brand].gram.toFixed(2) }} gr</span>
                    </div>
                    <div class="stat-item">
                      <v-icon size="14" color="#D4AF37" class="mr-1">mdi-currency-usd</v-icon>
                      <span class="stat-value font-weight-bold">Rp {{ numberWithCommas(donutData[brand].nominal) }}</span>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
        </div>

        <!-- Mobile: Compact chart + list -->
        <div class="mobile-view">
          <div class="chart-wrapper-mobile">
            <div class="chart-container-mobile d-flex justify-center align-center">
              <canvas id="donutChartMobile"></canvas>
            </div>
          </div>
          <div class="brand-list-compact mt-4">
            <div v-for="(brand, index) in donutBrands" :key="brand" class="brand-item-compact">
              <div class="brand-info-left">
                <div :class="['brand-dot-compact', `brand-${brand.toLowerCase()}`]"></div>
                <div class="brand-details">
                  <div class="brand-name-compact">{{ brand }}</div>
                  <div class="brand-gram">{{ donutData[brand].gram.toFixed(2) }} gr</div>
                </div>
              </div>
              <div class="brand-info-right">
                <div class="brand-percent">{{ getPercentage(brand) }}%</div>
                <div class="brand-value">{{ formatCompactValue(donutData[brand].nominal) }}</div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>
<script setup>
import { computed, watch, onMounted, nextTick } from 'vue';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { useFormatters } from '../composables/useFormatters';
import { useBrands } from '../composables/useBrands';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

const props = defineProps({
  transactions: {
    type: Array,
    required: true
  }
});

// Use composables
const { numberWithCommas } = useFormatters();
const { BRAND_CHART_COLORS, getBrandColor } = useBrands();

let donutChartInstance = null;
let donutChartMobileInstance = null;

// Computed: Calculate donut data from transactions
const donutData = computed(() => {
  const result = {};
  props.transactions.forEach(t => {
    const b = t.brand || 'Other';
    if (!result[b]) result[b] = { gram: 0, nominal: 0 };
    
    // Gram: accumulate buy - sell
    const gram = Number(t.denom) * Number(t.count) * (t.type === 'beli' ? 1 : -1);
    result[b].gram += gram;
    
    // Nominal: accumulate total_price buy - sell
    const nominal = Number(t.total_price) * (t.type === 'beli' ? 1 : -1);
    result[b].nominal += nominal;
  });
  
  // Ensure no negative values
  Object.keys(result).forEach(b => {
    result[b].gram = Math.max(result[b].gram, 0);
    result[b].nominal = Math.max(result[b].nominal, 0);
  });
  
  return result;
});

const donutBrands = computed(() => {
  // Only show brands with gram > 0 (filter out sold-out brands)
  return Object.keys(donutData.value).filter(brand => donutData.value[brand]?.gram > 0);
});

// Helper Functions
function getPercentage(brand) {
  const totalGram = donutBrands.value.reduce((sum, b) => sum + (donutData.value[b]?.gram || 0), 0);
  if (totalGram === 0) return '0.0';
  return ((donutData.value[brand]?.gram || 0) / totalGram * 100).toFixed(1);
}

function formatCompactValue(value) {
  if (value >= 1000000) {
    return 'Rp ' + (value / 1000000).toFixed(1) + 'jt';
  } else if (value >= 1000) {
    return 'Rp ' + (value / 1000).toFixed(0) + 'k';
  }
  return 'Rp ' + numberWithCommas(value);
}

// Chart Drawing Functions
function drawDonutChart() {
  const ctx = document.getElementById('donutChart');
  if (!ctx) return;
  
  // Use donutData computed property for consistency (already handles buy - sell)
  // donutBrands already filtered (gram > 0)
  const labels = donutBrands.value;
  const data = labels.map(brand => donutData.value[brand]?.gram|| 0);
  const colors = labels.map(brand => BRAND_CHART_COLORS[brand] || '#999');

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

function drawDonutChartMobile() {
  const ctx = document.getElementById('donutChartMobile');
  if (!ctx) return;
  
  const labels = donutBrands.value;
  const data = labels.map(brand => donutData.value[brand]?.gram|| 0);
  const colors = labels.map(brand => BRAND_CHART_COLORS[brand] || '#999');

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
          position: 'bottom',
          labels: {
            boxWidth: 12,
            font: {
              size: 10
            },
            padding: 8
          }
        }
      } 
    }
  };

  if (donutChartMobileInstance) {
    donutChartMobileInstance.data.labels = config.data.labels;
    donutChartMobileInstance.data.datasets[0].data = config.data.datasets[0].data;
    donutChartMobileInstance.data.datasets[0].backgroundColor = config.data.datasets[0].backgroundColor;
    donutChartMobileInstance.update();
  } else {
    donutChartMobileInstance = new Chart(ctx, config);
  }
}

// Lifecycle & Watchers
onMounted(() => {
  nextTick(() => {
    drawDonutChart();
    drawDonutChartMobile();
  });
});

watch(() => props.transactions, () => {
  nextTick(() => {
    drawDonutChart();
    drawDonutChartMobile();
  });
}, { deep: true });
</script>

<style scoped>
.composition-card {
  animation: slideInRight 0.5s ease-out;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 4px 16px rgba(11, 107, 58, 0.08) !important;
}

.composition-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(11, 107, 58, 0.15) !important;
}

.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #0B6B3A 0%, #1aa251 50%, #D4AF37 100%);
}

.pulse-chip {
  animation: pulseChip 2s ease-in-out infinite;
}

@keyframes pulseChip {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.icon-container {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(255, 167, 38, 0.35);
  transition: all 0.3s ease;
}

.icon-container:hover {
  transform: rotate(5deg) scale(1.05);
}

.chart-container {
  height: 280px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chart-wrapper {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 24px;
  border-radius: 16px;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
}

.brand-card {
  padding: 20px;
  border-radius: 16px;
  background: white;
  border: 2px solid #e8e8e8;
  transition: all 0.3s ease;
  animation: fadeInScale 0.5s ease-out backwards;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.brand-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #0B6B3A;
}

.brand-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-stats {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
}

.brand-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.brand-galeri24 {
  background: #0B6B3A;
  box-shadow: 0 0 8px rgba(11, 107, 58, 0.4);
}

.brand-antam {
  background: #C69C2F;
  box-shadow: 0 0 8px rgba(198, 156, 47, 0.4);
}

.brand-ubs {
  background: #6B6B6B;
  box-shadow: 0 0 8px rgba(107, 107, 107, 0.4);
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

/* Desktop / Mobile Views */
.mobile-view {
  display: none;
}

.desktop-view {
  display: block;
}

/* Mobile Chart */
.chart-wrapper-mobile {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 12px;
  border-radius: 12px;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chart-container-mobile {
  height: 200px;
  padding: 12px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Mobile Compact List */
.brand-list-compact {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.brand-item-compact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  transition: all 0.2s ease;
}

.brand-item-compact:hover {
  border-color: #0B6B3A;
  box-shadow: 0 2px 8px rgba(11, 107, 58, 0.1);
}

.brand-info-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-dot-compact {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.brand-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-name-compact {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2e2e2e;
  line-height: 1.2;
}

.brand-gram {
  font-size: 0.75rem;
  color: #6b6b6b;
  line-height: 1.2;
}

.brand-info-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.brand-percent {
  font-size: 0.85rem;
  font-weight: 700;
  color: #0B6B3A;
  line-height: 1.2;
}

.brand-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: #D4AF37;
  line-height: 1.2;
}

/* Mobile Responsive */
@media (max-width: 960px) {
  .chart-wrapper {
    padding: 20px;
  }
}

@media (max-width: 600px) {
  .desktop-view {
    display: none;
  }
  
  .mobile-view {
    display: block;
  }
  
  .icon-container {
    width: 48px;
    height: 48px;
  }
  
  .composition-card .v-card-title {
    padding: 12px 16px !important;
  }
  
  .composition-card .v-card-text {
    padding: 16px !important;
  }

  /* Mobile: Move brand count chip below subtitle */
  .title-wrapper {
    flex-wrap: wrap;
  }

  .brand-count-chip {
    order: 3;
    margin-top: 8px;
    margin-left: 60px;
  }

  .icon-container {
    order: 1;
  }

  .flex-grow-1 {
    order: 2;
  }
}
</style>
