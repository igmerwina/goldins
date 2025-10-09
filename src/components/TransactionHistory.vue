<template>
  <v-card class="mb-4 history-card" rounded="xl" elevation="0" style="background: #f8f9fa; border: 1px solid #e8e8e8;">
    <v-card-title class="d-flex justify-space-between align-center px-4 py-4">
      <div class="d-flex align-center">
        <div class="icon-container mr-3">
          <v-icon size="28" color="white">mdi-history</v-icon>
        </div>
        <div>
          <div class="text-h6 font-weight-bold" style="color: #2e2e2e;">Riwayat Transaksi</div>
          <div class="text-caption" style="color: #6b6b6b;">{{ transactions.length }} transaksi tercatat</div>
        </div>
      </div>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text v-if="transactions.length === 0" class="text-center py-8">
      <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-clipboard-text-outline</v-icon>
      <div class="text-body-1" style="color: #9e9e9e;">Tidak ada transaksi — tambahkan transaksi untuk melihat riwayat.</div>
    </v-card-text>
    <v-list v-else class="pa-2" style="background: transparent;">
      <v-list-item v-for="(tx, index) in transactions" :key="tx.id" class="transaction-item mb-2" :class="tx.type === 'beli' ? 'tx-buy' : 'tx-sell'" :style="{ animationDelay: `${index * 0.05}s` }">
        <template v-slot:prepend>
          <v-icon :color="tx.type === 'beli' ? 'primary' : 'error'">
            {{ tx.type === 'beli' ? 'mdi-arrow-up-circle-outline' : 'mdi-arrow-down-circle-outline' }}
          </v-icon>
        </template>
        <v-list-item-title class="font-weight-bold">
          {{ tx.type.toUpperCase() }} • Rp {{ numberWithCommas(tx.total_price) }}
          <span class="text-caption font-weight-regular ml-2 text-medium-emphasis">{{ formatDate(tx.date) }}</span>
        </v-list-item-title>
        <v-list-item-subtitle class="subtitle-with-brand">
          <span>{{ tx.denom }} gr × {{ tx.count }} keping</span>
          <v-chip size="small" :color="brandColor(tx.brand)" label class="brand-chip-inline">{{ tx.brand }}</v-chip>
        </v-list-item-subtitle>
        <template v-slot:append>
          <div class="append-container">
            <div class="gram-display font-weight-black text-subtitle-1">{{ (tx.denom * tx.count).toFixed(2) }} gr</div>
            <v-btn icon size="small" color="error" variant="tonal" @click.stop="confirmDelete(tx)" class="delete-btn-styled">
              <v-icon size="18">mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>
      </v-list-item>
    </v-list>
    <template v-if="showDeleteNotif">
      <v-alert type="success" class="mt-2 mb-0" border="start" elevation="6" prominent>
        Data berhasil dihapus
      </v-alert>
    </template>
    <v-dialog v-model="showConfirm" max-width="340">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">Yakin hapus transaksi ini?</v-card-title>
        <v-card-actions class="justify-end">
          <v-btn color="grey" variant="text" @click="showConfirm = false">Batal</v-btn>
          <v-btn color="error" variant="flat" @click="doDelete">Hapus</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>
<script setup>
import { ref } from 'vue';
import { useFormatters } from '../composables/useFormatters';
import { useBrands } from '../composables/useBrands';

const props = defineProps({
  transactions: Array
});

const emit = defineEmits(['delete-transaction']);

const showDeleteNotif = ref(false);
const showConfirm = ref(false);
let txToDelete = null;

// Use composables
const { numberWithCommas, formatDate } = useFormatters();
const { getBrandColor: brandColor } = useBrands();

function confirmDelete(tx) {
  txToDelete = tx;
  showConfirm.value = true;
}

function doDelete() {
  if (txToDelete) {
    emit('delete-transaction', txToDelete);
    showDeleteNotif.value = true;
    setTimeout(() => { showDeleteNotif.value = false; }, 1500);
  }
  showConfirm.value = false;
  txToDelete = null;
}
</script>

<style scoped>
.history-card {
  animation: slideInLeft 0.6s ease-out;
  transition: all 0.3s ease;
}

.history-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(11, 107, 58, 0.12) !important;
}

.icon-container {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
}

.transaction-item {
  border-radius: 12px !important;
  background: white;
  border: 1px solid #e8e8e8;
  margin-bottom: 8px;
  padding: 12px 16px !important;
  transition: all 0.3s ease;
  animation: fadeInSlide 0.5s ease-out forwards;
  opacity: 0;
}

.transaction-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.tx-buy {
  border-left: 4px solid #4CAF50;
}

.tx-buy:hover {
  background: #f1f8f4;
  border-left-width: 6px;
}

.tx-sell {
  border-left: 4px solid #F44336;
}

.tx-sell:hover {
  background: #fef5f5;
  border-left-width: 6px;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInSlide {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 600px) {
  .history-card .v-card-title {
    padding: 12px 16px !important;
  }
  
  .icon-container {
    width: 40px;
    height: 40px;
  }
  
  .history-card .text-h6 {
    font-size: 1rem !important;
  }
  
  .history-card .text-caption {
    font-size: 0.7rem !important;
  }
  
  .transaction-item {
    padding: 10px 8px !important;
    margin-bottom: 6px;
    flex-direction: column;
    align-items: flex-start !important;
    min-height: auto;
  }
  
  .transaction-item .v-list-item__prepend {
    padding-right: 6px !important;
    align-self: flex-start;
    margin-top: 2px;
  }
  
  .transaction-item .v-list-item__content {
    flex: 1;
    min-width: 0;
  }
  
  .transaction-item .v-list-item-title {
    font-size: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 4px;
    word-break: break-word;
    line-height: 1.3;
  }
  
  .transaction-item .v-list-item-title .text-caption {
    font-size: 0.65rem !important;
    margin-left: 0 !important;
  }
  
  .transaction-item .v-list-item-subtitle {
    font-size: 0.75rem;
  }
  
  .subtitle-with-brand {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  
  .brand-chip-inline {
    font-size: 0.65rem !important;
    height: 18px !important;
    padding: 0 6px !important;
  }
  
  .transaction-item .v-list-item__append {
    margin-top: 8px;
    width: 100%;
  }
  
  .append-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    width: 100%;
  }
  
  .gram-display {
    font-size: 0.85rem !important;
    color: #0B6B3A;
    white-space: nowrap;
  }
  
  .delete-btn-styled {
    background: rgba(244, 67, 54, 0.04) !important;
    border: 1px solid rgba(244, 67, 54, 0.02);
    transition: all 0.3s ease;
  }
  
  .delete-btn-styled:hover {
    background: rgba(244, 67, 54, 0.25) !important;
    border-color: rgba(244, 67, 54, 0.5);
    transform: scale(1.1);
  }
  
  .delete-btn-styled:active {
    transform: scale(0.95);
  }
  
  .transaction-item .v-chip {
    font-size: 0.7rem;
    height: 20px;
  }
}
</style>