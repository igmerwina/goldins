<template>
  <v-card class="mb-4 elevation-4" rounded="lg">
    <v-card-title class="text-subtitle-1 font-weight-bold">Tambah Transaksi</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="wrappedAddTransaction">
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
          <v-col cols="12" sm="8" md="6">
            <v-text-field
              v-model="transaction.manualPrice"
              :label="transaction.type === 'beli' ? 'Harga Beli Emas (per gram)' : 'Harga Jual Emas (per gram)'"
              :placeholder="transaction.type === 'beli' ? 'Masukkan harga beli' : 'Masukkan harga jual'"
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
          <v-col cols="12" md="3" class="d-flex align-center">
            <div class="text-subtitle-1 font-weight-bold">Total: {{ (transaction.denom * transaction.count).toFixed(2) }} gr</div>
          </v-col>
        </v-row>
        <v-card-actions class="justify-end px-0">
          <v-btn
            variant="tonal"
            color="primary"
            type="submit"
            size="large"
            :disabled="!transaction.date || transaction.count < 1 || isLoading"
          >
            <v-icon start>mdi-content-save</v-icon>
            <v-progress-circular
              v-if="isLoading"
              indeterminate
              color="white"
              size="20"
              class="mr-2"
            />
            <span v-if="!isLoading">Simpan Transaksi</span>
            <span v-else>Menyimpan...</span>
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card-text>
  </v-card>
</template>
<script setup>
const props = defineProps({
  transaction: Object,
  today: String,
  addTransaction: Function,
  formatRupiah: Function,
  unformatRupiah: Function
});

import { ref, watch, onMounted } from 'vue';
import { supabase } from '../lib/SupabaseClient';

const isLoading = ref(false);

// Ganti addTransaction agar set isLoading true/false
const originalAddTransaction = props.addTransaction;
async function wrappedAddTransaction(...args) {
  isLoading.value = true;
  try {
    await originalAddTransaction(...args);
  } finally {
    isLoading.value = false;
  }
}

async function setDefaultManualPrice(dateStr) {
  // Ambil harga default sesuai jenis transaksi
  let price = '';
  if (!dateStr) return;
  const field = props.transaction.type === 'beli' ? 'price_buyback' : 'price_sell';
  const { data, error } = await supabase
    .from('gold_prices')
    .select(`${field}, date`)
    .eq('brand', props.transaction.brand || 'Galeri24')
    .lte('date', dateStr)
    .order('date', { ascending: false })
    .limit(1);
  if (!error && data && data.length > 0) {
    price = data[0][field];
  }
  if (price) props.transaction.manualPrice = price;
}

onMounted(() => {
  setDefaultManualPrice(props.transaction.date);
});

watch(
  () => [props.transaction.date, props.transaction.brand, props.transaction.type, props.transaction.denom],
  ([date, brand, type, denom]) => {
    setDefaultManualPrice(date);
  }
);
</script>
