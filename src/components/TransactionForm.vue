<template>
  <v-card class="mb-4 transaction-card" rounded="xl" elevation="8" style="background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); border: 1px solid #e0e0e0; overflow: hidden;">
    <div class="card-accent"></div>
    <v-card-title class="d-flex align-center justify-space-between px-4 py-4">
      <div class="d-flex align-center">
        <div class="icon-container mr-3">
          <v-icon size="24" color="white">mdi-swap-horizontal</v-icon>
        </div>
        <div>
          <div class="text-h6 font-weight-bold" style="color: #2e2e2e;">Tambah Riwayat Emas</div>
          <div class="text-caption" style="color: #6b6b6b;">Catat emas yang Anda miliki atau pernah jual</div>
        </div>
      </div>
      <v-chip 
        :color="transaction.type === 'beli' ? '#4CAF50' : '#F44336'" 
        size="small" 
        variant="tonal"
        class="px-4"
        v-if="transaction.type"
      >
        <v-icon start size="18">{{ transaction.type === 'beli' ? 'mdi-arrow-up-circle' : 'mdi-arrow-down-circle' }}</v-icon>
        {{ transaction.type.toUpperCase() }}
      </v-chip>
    </v-card-title>
    <v-divider class="mx-4"></v-divider>
    <v-card-text class="px-4 py-6">
      <v-form @submit.prevent="wrappedAddTransaction" class="transaction-form">
        <!-- Desktop: 3 columns -->
        <div class="desktop-layout">
          <v-row>
            <v-col cols="12" md="4">
              <v-select
                v-model="transaction.type"
                :items="[{title: 'Beli', value: 'beli'}, {title: 'Jual', value: 'jual'}]"
                label="Status Aset"
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
            <v-col cols="12" md="4">
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
            <v-col cols="12" md="4">
              <v-text-field
                v-model="transaction.date"
                :label="transaction.type === 'beli' ? 'Tanggal Pembelian' : 'Tanggal Penjualan'"
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
            <v-col cols="12" md="6">
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
            <v-col cols="12" md="6">
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
          </v-row>
          
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-show="false"
                v-model="transaction.manualPrice"
                :label="transaction.type === 'beli' ? 'Harga Per Gram' : 'Harga Per Gram'"
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
          </v-row>
        </div>
        
        <!-- Mobile: 2 columns compact layout -->
        <div class="mobile-layout">
          <!-- Row 1: Status Aset & Merk -->
          <v-row dense>
            <v-col cols="6">
              <v-select
                v-model="transaction.type"
                :items="[{title: 'Beli', value: 'beli'}, {title: 'Jual', value: 'jual'}]"
                label="Status Aset"
                variant="outlined"
                color="#0B6B3A"
                prepend-inner-icon="mdi-swap-horizontal"
                class="custom-input"
                density="compact"
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
            <v-col cols="6">
              <v-select
                v-model="transaction.brand"
                :items="brands"
                label="Merk Emas"
                variant="outlined"
                color="#0B6B3A"
                prepend-inner-icon="mdi-tag"
                class="custom-input"
                density="compact"
                :loading="isLoadingData"
                :disabled="isLoadingData"
              ></v-select>
            </v-col>
          </v-row>
          
          <!-- Row 2: Denominasi & Jumlah Keping -->
          <v-row dense>
            <v-col cols="6">
              <v-select
                v-model.number="transaction.denom"
                :items="denominations"
                label="Denominasi (gram)"
                variant="outlined"
                color="#0B6B3A"
                prepend-inner-icon="mdi-weight-gram"
                class="custom-input"
                density="compact"
                :loading="isLoadingData"
                :disabled="isLoadingData"
              ></v-select>
            </v-col>
            <v-col cols="6">
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
                density="compact"
              ></v-text-field>
            </v-col>
          </v-row>
          
          <!-- Row 3: Tanggal (Full Width) -->
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="transaction.date"
                :label="transaction.type === 'beli' ? 'Tanggal Pembelian' : 'Tanggal Penjualan'"
                type="date"
                variant="outlined"
                color="#0B6B3A"
                required
                :min="'1900-01-01'"
                :max="today"
                prepend-inner-icon="mdi-calendar"
                class="custom-input"
                density="compact"
              ></v-text-field>
            </v-col>
          </v-row>
        </div>
        
        <!-- Transaction Summary -->
        <v-alert v-if="transaction.denom && transaction.count && transaction.manualPrice" 
          class="mt-4 summary-alert"
          rounded="lg"
          color="#E8F5E9"
        >
          <div class="summary-content">
            <div class="summary-left">
              <div class="summary-amount">
                <div class="currency-label">Total Gramasi</div>
                <div class="amount-value">{{ transaction.denom * transaction.count }} gram</div>
              </div>
            </div>
            <div class="summary-right">
              <div class="summary-amount">
                <div class="currency-label">Total Nilai Aset</div>
                <div class="amount-value">Rp {{ formatTotal() }}</div>
              </div>
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
            <v-icon start size="22">{{ isLoading ? 'mdi-loading' : 'mdi-check-circle' }}</v-icon>
            <span class="btn-text">
              <template v-if="!isLoading">Simpan Aset</template>
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
const DEFAULT_GRAM = 1

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
      .from('gold_prices_v2')
      .select('denom')
    
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
      .from('gold_prices_v2')
      .select(`${field}, date`)
      .eq('brand', props.transaction.brand)
      .eq('denom', DEFAULT_GRAM)
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
      props.transaction.manualPrice = 528000; // default fallback price
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
  border: 1px solid rgba(11, 107, 58, 0.2) !important;
  background: linear-gradient(135deg, #E8F5E9 0%, #F1F8F4 100%) !important;
  box-shadow: 0 2px 12px rgba(11, 107, 58, 0.1) !important;
}

.summary-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.summary-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.summary-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0B6B3A 0%, #1aa251 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 8px rgba(11, 107, 58, 0.25);
  flex-shrink: 0;
}

.summary-right {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: flex-end;
}

.summary-amount {
  text-align: right;
}

.currency-label {
  font-size: 0.75rem;
  color: #666;
  font-weight: 500;
  margin-bottom: 2px;
  letter-spacing: 0.5px;
}

.amount-value {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0B6B3A;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(11, 107, 58, 0.1);
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

/* Desktop layout: show on screens >= 600px */
.desktop-layout {
  display: block;
}

/* Mobile layout: hide on desktop */
.mobile-layout {
  display: none;
}

@media (max-width: 600px) {
  /* Hide desktop layout on mobile */
  .desktop-layout {
    display: none;
  }
  
  /* Show mobile layout on mobile */
  .mobile-layout {
    display: block;
  }
  .transaction-card .v-card-title {
    padding: 10px 16px !important;
    flex-direction: column;
    align-items: flex-start !important;
    gap: 12px;
  }
  
  .transaction-card .v-card-title .d-flex {
    width: 100%;
  }
  
  .transaction-card .v-card-text {
    padding: 12px 16px !important;
  }
  
  .icon-container {
    width: 40px;
    height: 40px;
  }
  
  .icon-container .v-icon {
    font-size: 20px !important;
  }
  
  .transaction-card .text-h6 {
    font-size: 1rem !important;
    line-height: 1.4;
    margin-bottom: 2px;
  }
  
  .transaction-card .text-caption {
    font-size: 0.75rem !important;
    line-height: 1.3;
    opacity: 0.85;
    margin-top: 1px;
    letter-spacing: 0.2px;
    max-width: 95vw;
    word-break: break-word;
    white-space: normal;
    display: block;
  }
  
  .custom-input {
    margin-bottom: 0 !important;
  }
  
  .v-row {
    margin-top: 0 !important;
  }
  
  .v-col {
    padding: 6px 12px !important;
  }
  
  .total-chip {
    font-size: 0.85rem;
    padding: 8px 12px;
    width: 100%;
    justify-content: center;
  }
  
  .summary-alert {
    padding: 14px 12px !important;
  }
  
  .summary-content {
    flex-direction: column;
    gap: 10px;
    align-items: stretch !important;
  }
  
  .summary-left,
  .summary-right {
    width: 100%;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 8px;
    border: 1px solid rgba(11, 107, 58, 0.15);
    justify-content: flex-start;
  }
  
  .summary-left {
    gap: 10px;
  }
  
  .summary-icon {
    width: 38px;
    height: 38px;
  }
  
  .summary-icon .v-icon {
    font-size: 20px !important;
  }
  
  .summary-amount {
    text-align: left;
  }
  
  .currency-label {
    font-size: 0.7rem !important;
  }
  
  .amount-value {
    font-size: 1.1rem !important;
  }
  
  .submit-btn {
    width: 100%;
    min-width: 100%;
    height: 48px !important;
  }
  
  .submit-btn .btn-text {
    font-size: 0.95rem;
  }
  
  .save-btn {
    min-width: 100%;
  }
}
</style>
