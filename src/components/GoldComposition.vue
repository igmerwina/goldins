<template>
  <v-card class="mb-4 composition-card" rounded="xl" elevation="0" style="background: #f8f9fa; border: 1px solid #e8e8e8;">
    <v-card-title class="d-flex align-center px-4 py-4">
      <div class="icon-container mr-3">
        <v-icon size="28" color="white">mdi-chart-donut</v-icon>
      </div>
      <div>
        <div class="text-h6 font-weight-bold" style="color: #2e2e2e;">Komposisi Emas</div>
        <div class="text-caption" style="color: #6b6b6b;">Distribusi portfolio berdasarkan merk</div>
      </div>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text class="px-4 py-4">
      <div class="chart-container d-flex justify-center align-center">
        <canvas id="donutChart"></canvas>
      </div>
      <div class="mt-4">
        <v-row>
          <v-col v-for="brand in donutBrands" :key="brand" cols="12" sm="4" class="mb-2">
            <div class="brand-card">
              <div class="d-flex align-center mb-2">
                <div :class="['brand-dot', `brand-${brand.toLowerCase()}`]"></div>
                <div class="font-weight-bold ml-2" style="color: #2e2e2e;">{{ brand }}</div>
              </div>
              <div class="text-caption mb-1" style="color: #6b6b6b;">Gram: <b style="color: #2e2e2e;">{{ donutData[brand].gram.toFixed(2) }}</b> gr</div>
              <div class="text-caption" style="color: #6b6b6b;">Senilai: <b style="color: #2e2e2e;">Rp {{ numberWithCommas(donutData[brand].nominal) }}</b></div>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>
<script setup>
const props = defineProps({
  donutBrands: Array,
  donutData: Object,
  numberWithCommas: Function
});
</script>

<style scoped>
.composition-card {
  animation: slideInRight 0.5s ease-out;
  transition: all 0.3s ease;
}

.composition-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(11, 107, 58, 0.12) !important;
}

.icon-container {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #FFA726 0%, #FF6F00 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 167, 38, 0.3);
}

.chart-container {
  height: 280px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.brand-card {
  padding: 16px;
  border-radius: 12px;
  background: white;
  border: 1px solid #e8e8e8;
  transition: all 0.3s ease;
  animation: fadeIn 0.6s ease-out;
}

.brand-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  border-color: #0B6B3A;
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

@media (max-width: 600px) {
  .chart-container {
    height: 240px;
    padding: 12px;
  }
}
</style>
