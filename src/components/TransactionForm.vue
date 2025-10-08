<template>
  <v-card class="mb-4 transaction-card" rounded="xl" elevation="8" style="background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); border: 1px solid #e0e0e0; overflow: hidden;">
    <div class="card-accent"></div>
    <v-card-title class="d-flex align-center justify-space-between px-4 py-4">
      <div class="d-flex align-center">
        <div class="icon-container mr-3">
          <v-icon size="28" color="white">mdi-swap-horizontal</v-icon>
        </div>
        <div>
          <div class="text-h6 font-weight-bold" style="color: #2e2e2e;">Tambah Transaksi</div>
          <div class="text-caption" style="color: #6b6b6b;">Catat pembelian atau penjualan emas</div>
        </div>
      </div>
      <v-chip 
        :color="transaction.type === 'beli' ? '#4CAF50' : '#F44336'" 
        size="small" 
        variant="flat"
        v-if="transaction.type"
      >
        <v-icon start size="16">{{ transaction.type === 'beli' ? 'mdi-arrow-up-circle' : 'mdi-arrow-down-circle' }}</v-icon>
        {{ transaction.type.toUpperCase() }}
      </v-chip>
    </v-card-title>
    <v-divider class="mx-4"></v-divider>
    <v-card-text class="px-4 py-6">
      <v-form @submit.prevent="wrappedAddTransaction" class="transaction-form">
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="transaction.type"
              :items="[{title: 'Beli', value: 'beli'}, {title: 'Jual', value: 'jual'}]"
              label="Jenis Transaksi"
              variant="outlined"
              color="#0B6B3A"
              prepend-inner-icon="mdi-swap-horizontal"
              class="custom-input"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <v-icon :color="item.raw.value === 'beli' ? '#4CAF50' : '#F44336'">
                      {{ item.raw.value === 'beli' ? 'mdi-arrow-up-circle' : 'mdi-arrow-down-circle' }}
                    </v-icon>
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="transaction.brand"
              :items="brands"
              label="Merk Emas"
              variant="outlined"
              color="#0B6B3A"
              prepend-inner-icon="mdi-tag"
              class="custom-input"
              :loading="isLoadingData"
              :disabled="isLoadingData"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="5">
            <v-text-field
              v-model="transaction.date"
              label="Tanggal Transaksi"
              type="date"
              variant="outlined"
              color="#0B6B3A"
              required
              :min="'1900-01-01'"
              :max="today"
              prepend-inner-icon="mdi-calendar"
              class="custom-input"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6" md="5">
            <v-select
              v-model.number="transaction.denom"
              :items="denominations"
              label="Denominasi (gram)"
              variant="outlined"
              color="#0B6B3A"
              prepend-inner-icon="mdi-weight-gram"
              class="custom-input"
              :loading="isLoadingData"
              :disabled="isLoadingData"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model.number="transaction.count"
              label="Jumlah Keping"
              type="number"
              min="1"
              variant="outlined"
              color="#0B6B3A"
              required
              prepend-inner-icon="mdi-numeric"
              class="custom-input"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="8" md="6">
            <v-text-field
              v-model="transaction.manualPrice"
              :label="transaction.type === 'beli' ? 'Harga Beli per Gram' : 'Harga Jual per Gram'"
              :placeholder="transaction.type === 'beli' ? 'Contoh: Rp 1.500.000' : 'Contoh: Rp 1.450.000'"
              :rules="[
                v => !!v || 'Harga wajib diisi',
                v => {
                  const digits = v ? v.toString().replace(/[^\d]/g, '') : '';
                  return /^\d{1,12}$/.test(digits) || 'Nominal hanya angka, max 12 digit';
                }
              ]"
              maxlength="20"
              clearable
              prepend-inner-icon="mdi-cash-multiple"
              variant="outlined"
              type="text"
              inputmode="numeric"
              color="#0B6B3A"
              :formatter="formatRupiah"
              :model-value="formatRupiah(transaction.manualPrice)"
              @update:model-value="val => transaction.manualPrice = unformatRupiah(val)"
              class="custom-input"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3" class="d-flex align-center">
            <v-chip color="#0B6B3A" variant="tonal" class="total-chip">
              <v-icon start size="18">mdi-scale-balance</v-icon>
              <span class="font-weight-bold">{{ (transaction.denom * transaction.count).toFixed(2) }} gr</span>
            </v-chip>
          </v-col>
        </v-row>
        
        <!-- Transaction Summary -->
        <v-alert v-if="transaction.denom && transaction.count && transaction.manualPrice" 
          type="info" 
          variant="tonal" 
          class="mt-4 summary-alert"
          rounded="lg"
        >
          <div class="d-flex align-items-center justify-space-between flex-wrap">
            <div>
              <strong>Total Transaksi:</strong> 
              <span class="ml-2">{{ transaction.denom * transaction.count }} gram</span>
            </div>
            <div>
              <strong>Total Harga:</strong>
              <span class="text-h6 font-weight-bold ml-2" style="color: #0B6B3A;">
                Rp {{ formatTotal() }}
              </span>
            </div>
          </div>
        </v-alert>
        
        <v-card-actions class="justify-end px-0 mt-4">
          <v-btn
            color="#0B6B3A"
            variant="flat"
            type="submit"
            size="x-large"
            rounded="xl"
            elevation="2"
            class="submit-btn"
            :disabled="!transaction.date || transaction.count < 1 || isLoading"
            :loading="isLoading"
          >
            <v-icon start size="22">{{ isLoading ? 'mdi-loading' : 'mdi-content-save' }}</v-icon>
            <span class="btn-text">
              <template v-if="!isLoading">Simpan Transaksi</template>
              <template v-else>Menyimpan...</template>
            </span>
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

import { ref, watch, onMounted, computed } from 'vue';
import { supabase } from '../lib/SupabaseClient';

const isLoading = ref(false);
const brands = ref([]);
const denominations = ref([]);
const isLoadingData = ref(false);

// Fetch brands from Supabase
async function fetchBrands() {
  isLoadingData.value = true;
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('brand')
      .order('brand', { ascending: true });
    
    if (error) {
      console.error('Error fetching brands:', error);
      // Fallback to default brands if table doesn't exist
      brands.value = ['Galeri24', 'Antam', 'UBS'];
    } else {
      // Get unique brands using Set to remove duplicates
      const uniqueBrands = [...new Set(data.map(b => b.brand))];
      brands.value = uniqueBrands;
    }
  } catch (err) {
    console.error('Exception fetching brands:', err);
    // Fallback to default brands
    brands.value = ['Galeri24', 'Antam', 'UBS'];
  } finally {
    isLoadingData.value = false;
  }
}

// Fetch available denominations from gold_prices table
async function fetchDenominations() {
  try {
    const { data, error } = await supabase
      .from('gold_prices')
      .select('denom')
      .order('denom', { ascending: true });
    
    if (error) {
      console.error('Error fetching denominations:', error);
      // Fallback to default denominations
      denominations.value = [0.1, 0.2, 0.5, 1, 2, 5, 10, 25, 50, 100];
    } else {
      // Get unique denominations
      const uniqueDenoms = [...new Set(data.map(d => Number(d.denom)))];
      denominations.value = uniqueDenoms.sort((a, b) => a - b);
      
      // If no data, use defaults
      if (denominations.value.length === 0) {
        denominations.value = [0.1, 0.2, 0.5, 1, 2, 5, 10, 25, 50, 100];
      }
    }
  } catch (err) {
    console.error('Exception fetching denominations:', err);
    // Fallback to default denominations
    denominations.value = [0.1, 0.2, 0.5, 1, 2, 5, 10, 25, 50, 100];
  }
}

function formatTotal() {
  if (!props.transaction.denom || !props.transaction.count || !props.transaction.manualPrice) {
    return '0';
  }
  const price = props.unformatRupiah(props.transaction.manualPrice);
  const total = props.transaction.denom * props.transaction.count * price;
  return total.toLocaleString('id-ID');
}

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

// Fetch price based on brand, denom, date, and transaction type
async function setDefaultManualPrice(dateStr) {
  if (!dateStr || !props.transaction.brand || !props.transaction.denom) return;
  
  const field = props.transaction.type === 'beli' ? 'price_sell' : 'price_buyback'; ;
  
  try {
    const { data, error } = await supabase
      .from('gold_prices')
      .select(`${field}, date`)
      .eq('brand', props.transaction.brand)
      .eq('denom', props.transaction.denom)
      .lte('date', dateStr)
      .order('date', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error fetching price:', error);
      return;
    }
    
    if (data && data.length > 0) {
      const price = data[0][field];
      if (price) {
        props.transaction.manualPrice = price;
      }
    } else {
      console.warn(`No price found for ${props.transaction.brand} ${props.transaction.denom}gr on ${dateStr}`);
    }
  } catch (err) {
    console.error('Exception fetching price:', err);
  }
}

onMounted(async () => {
  // Fetch brands and denominations first
  await Promise.all([
    fetchBrands(),
    fetchDenominations()
  ]);
  
  // Then set default price
  setDefaultManualPrice(props.transaction.date);
});

watch(
  () => [props.transaction.date, props.transaction.brand, props.transaction.type, props.transaction.denom],
  ([date, brand, type, denom]) => {
    setDefaultManualPrice(date);
  }
);
</script>

<style scoped>
.transaction-card {
  animation: slideInUp 0.4s ease-out;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 4px 16px rgba(11, 107, 58, 0.08) !important;
}

.transaction-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(11, 107, 58, 0.15) !important;
}

.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #0B6B3A 0%, #1aa251 50%, #4CAF50 100%);
}

.transaction-form {
  animation: fadeIn 0.5s ease-out;
}

.custom-input {
  transition: all 0.3s ease;
}

.custom-input:focus-within {
  transform: translateY(-2px);
}

.total-chip {
  font-size: 1rem;
  padding: 12px 16px;
  animation: pulse 2s ease-in-out infinite;
}

.summary-alert {
  animation: slideInUp 0.4s ease-out;
  border-left: 4px solid #0B6B3A;
}

.submit-btn {
  background: linear-gradient(135deg, #0B6B3A 0%, #1aa251 100%) !important;
  color: white !important;
  transition: all 0.3s ease;
  text-transform: none !important;
  letter-spacing: 0.5px;
  font-weight: 600 !important;
  min-width: 200px;
}

.submit-btn .btn-text {
  font-size: 1.05rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(11, 107, 58, 0.35) !important;
  background: linear-gradient(135deg, #0d7d43 0%, #1eb758 100%) !important;
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.icon-container {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #0B6B3A 0%, #1aa251 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(11, 107, 58, 0.2);
}

.save-btn {
  min-width: 180px;
  transition: all 0.3s ease;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.save-btn:active:not(:disabled) {
  transform: translateY(0);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 600px) {
  .save-btn {
    min-width: 100%;
  }
}
</style>
