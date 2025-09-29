<template>
  <v-card class="mb-4 elevation-4" rounded="lg">
    <v-card-title class="text-subtitle-1 font-weight-bold">Grafik Harga Emas</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <v-select
            :model-value="selectedBrand"
            @update:model-value="$emit('update:selectedBrand', $event)"
            :items="goldBrands"
            label="Pilih Merk"
            variant="outlined"
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-select
            :model-value="selectedDenom"
            @update:model-value="$emit('update:selectedDenom', $event)"
            :items="denomOptions"
            label="Pilih Denominasi (g)"
            variant="outlined"
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <div class="text-caption text-medium-emphasis mb-2">Perubahan Harga Emas (7 Hari) - {{ selectedBrand }} - {{ selectedDenom }}g</div>
          <div class="d-flex justify-center align-center" style="height: 250px;">
            <canvas id="lineChart"></canvas>
          </div>
        </v-col>
      </v-row>
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
