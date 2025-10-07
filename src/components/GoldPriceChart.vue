<template>
  <v-card class="mb-4 chart-card" rounded="xl" elevation="0" style="background: #f8f9fa; border: 1px solid #e8e8e8;">
    <v-card-title class="d-flex align-center px-4 py-4">
      <div class="icon-container mr-3">
        <v-icon size="28" color="white">mdi-chart-line</v-icon>
      </div>
      <div>
        <div class="text-h6 font-weight-bold" style="color: #2e2e2e;">Grafik Harga Emas</div>
        <div class="text-caption" style="color: #6b6b6b;">Pergerakan harga 7 hari terakhir</div>
      </div>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text class="px-4 py-4">
      <v-row class="mb-3">
        <v-col cols="12" sm="6" md="6">
          <div class="filter-label mb-2">
            <v-icon size="18" class="mr-1">mdi-tag</v-icon>
            <span class="text-caption font-weight-bold" style="color: #2e2e2e;">Pilih Merk</span>
          </div>
          <v-select
            :model-value="selectedBrand"
            @update:model-value="$emit('update:selectedBrand', $event)"
            :items="goldBrands"
            variant="outlined"
            density="comfortable"
            hide-details
            style="background: white;"
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="6">
          <div class="filter-label mb-2">
            <v-icon size="18" class="mr-1">mdi-weight-gram</v-icon>
            <span class="text-caption font-weight-bold" style="color: #2e2e2e;">Pilih Denominasi (g)</span>
          </div>
          <v-select
            :model-value="selectedDenom"
            @update:model-value="$emit('update:selectedDenom', $event)"
            :items="denomOptions"
            variant="outlined"
            density="comfortable"
            hide-details
            style="background: white;"
          ></v-select>
        </v-col>
      </v-row>
      <div class="chart-wrapper">
        <div class="chart-info mb-2">
          <v-chip size="small" color="primary" variant="tonal">
            <v-icon start size="16">mdi-trending-up</v-icon>
            {{ selectedBrand }} - {{ selectedDenom }}g
          </v-chip>
        </div>
        <div class="chart-container-line">
          <canvas id="lineChart"></canvas>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>
<script setup>
const props = defineProps({
  selectedBrand: String,
  goldBrands: Array,
  selectedDenom: Number,
  denomOptions: Array,
  priceHistory: Array
});
defineEmits(['update:selectedBrand', 'update:selectedDenom']);
</script>

<style scoped>
.chart-card {
  animation: fadeInUp 0.6s ease-out;
  transition: all 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(11, 107, 58, 0.12) !important;
}

.icon-container {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #66BB6A 0%, #43A047 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(102, 187, 106, 0.3);
}

.filter-label {
  display: flex;
  align-items: center;
  color: #2e2e2e;
}

.chart-wrapper {
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chart-container-line {
  height: 280px;
  position: relative;
  animation: chartFadeIn 0.8s ease-out;
}

.chart-info {
  display: flex;
  justify-content: center;
  gap: 8px;
}

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

@media (max-width: 600px) {
  .chart-container-line {
    height: 220px;
  }
  
  .chart-wrapper {
    padding: 12px;
  }
}
</style>
