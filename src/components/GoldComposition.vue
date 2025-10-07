<template>
  <v-card class="mb-4 composition-card" rounded="xl" elevation="8" style="background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); border: 1px solid #e0e0e0; overflow: hidden;">
    <div class="card-accent"></div>
    <v-card-title class="d-flex align-center px-4 py-4">
      <div class="icon-container mr-3">
        <v-icon size="28" color="white">mdi-chart-donut</v-icon>
      </div>
      <div class="flex-grow-1">
        <div class="text-h6 font-weight-bold" style="color: #2e2e2e;">Komposisi Emas</div>
        <div class="text-caption" style="color: #6b6b6b;">Distribusi portfolio berdasarkan merk</div>
      </div>
      <v-chip 
        v-if="donutBrands.length > 0" 
        size="small" 
        color="#0B6B3A" 
        variant="flat"
        class="pulse-chip"
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
        <div class="chart-wrapper">
          <div class="chart-container d-flex justify-center align-center">
            <canvas id="donutChart"></canvas>
          </div>
        </div>
        <div class="mt-6">
          <v-row>
            <v-col v-for="(brand, index) in donutBrands" :key="brand" cols="12" sm="4" class="mb-3">
              <div class="brand-card" :style="{ animationDelay: `${index * 0.1}s` }">
                <div class="brand-header">
                  <div class="d-flex align-center mb-3">
                    <div :class="['brand-dot', `brand-${brand.toLowerCase()}`]"></div>
                    <div class="font-weight-bold ml-2 text-h6" style="color: #2e2e2e;">{{ brand }}</div>
                  </div>
                  <v-chip size="x-small" :color="getBrandColor(brand)" variant="tonal">
                    {{ getPercentage(brand) }}%
                  </v-chip>
                </div>
                <v-divider class="my-3"></v-divider>
                <div class="brand-stats">
                  <div class="stat-item mb-2">
                    <v-icon size="16" color="#0B6B3A" class="mr-1">mdi-weight-gram</v-icon>
                    <span class="text-caption" style="color: #6b6b6b;">Berat:</span>
                    <span class="font-weight-bold ml-1" style="color: #2e2e2e;">{{ donutData[brand].gram.toFixed(2) }} gr</span>
                  </div>
                  <div class="stat-item">
                    <v-icon size="16" color="#D4AF37" class="mr-1">mdi-currency-usd</v-icon>
                    <span class="text-caption" style="color: #6b6b6b;">Nilai:</span>
                    <span class="font-weight-bold ml-1" style="color: #2e2e2e;">Rp {{ numberWithCommas(donutData[brand].nominal) }}</span>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>
<script setup>
import { computed } from 'vue';

const props = defineProps({
  donutBrands: Array,
  donutData: Object,
  numberWithCommas: Function
});

function getPercentage(brand) {
  const totalGram = props.donutBrands.reduce((sum, b) => sum + (props.donutData[b]?.gram || 0), 0);
  if (totalGram === 0) return '0.0';
  return ((props.donutData[brand]?.gram || 0) / totalGram * 100).toFixed(1);
}

function getBrandColor(brand) {
  const colors = {
    'Galeri24': '#4CAF50',
    'Antam': '#2196F3',
    'UBS': '#FF9800'
  };
  return colors[brand] || '#9E9E9E';
}
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
  background: linear-gradient(135deg, #FFA726 0%, #FF6F00 100%);
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

/* Mobile Responsive */
@media (max-width: 960px) {
  .chart-wrapper {
    padding: 20px;
  }
}

@media (max-width: 600px) {
  .chart-container {
    height: 240px;
    padding: 12px;
  }
  
  .chart-wrapper {
    padding: 16px;
  }
  
  .brand-card {
    padding: 16px;
    margin-bottom: 12px;
  }
  
  .brand-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .stat-item {
    font-size: 0.85rem;
  }
  
  .icon-container {
    width: 48px;
    height: 48px;
  }
}
</style>
