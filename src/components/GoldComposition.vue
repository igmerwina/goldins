<template>
  <v-card class="mb-4 elevation-4" rounded="lg">
    <v-card-text>
      <div class="text-subtitle-1 font-weight-bold mb-2">Komposisi Emas</div>
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
