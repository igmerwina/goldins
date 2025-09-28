<template>
  <v-card class="mb-4 elevation-4" rounded="lg">
    <v-card-title class="text-h6 d-flex justify-space-between align-center py-3">
      <div>
        <div class="text-caption text-medium-emphasis">Halo, <strong>{{ user.name || user.phone }}</strong></div>
        <div class="text-subtitle-1 font-weight-bold">Portofolio Emas</div>
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
            <div class="text-caption text-medium-emphasis">Rata-rata Harga Jual <br/>{{ latestDate }}</div>
            <div class="text-subtitle-1 font-weight-bold">Rp {{ latestPriceFormatted }}</div>
        </v-col>
      </v-row>
      <v-divider class="my-3"></v-divider>
      <v-row justify="space-between">
        <v-col cols="6" class="py-1">
          <div class="text-caption text-medium-emphasis">Rata-rata Harga Beli /gram</div>
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
      <!-- Komposisi Emas sekarang benar-benar di dalam section portofolio emas -->
      <GoldComposition
        :donutBrands="donutBrands"
        :donutData="donutData"
        :numberWithCommas="numberWithCommas"
      />
    </v-card-text>
  </v-card>
</template>
<script setup>
const props = defineProps({
  user: Object,
  totalGold: Number,
  totalPorto: String,
  latestDate: String,
  latestPriceFormatted: String,
  avgPriceFormatted: String,
  potentialProfit: Number,
  potentialProfitFormatted: String,
  profitPercent: String
});
</script>
