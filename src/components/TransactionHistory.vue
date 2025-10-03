<template>
  <v-card class="mb-4 elevation-4" rounded="lg">
    <v-card-title class="text-subtitle-1 d-flex justify-space-between align-center font-weight-bold">
      Riwayat Transaksi
      <span class="text-caption text-medium-emphasis">{{ transactions.length }} transaksi</span>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text v-if="transactions.length === 0" class="text-center text-medium-emphasis">
      Tidak ada portofolio — tambahkan transaksi untuk melihat ringkasan.
    </v-card-text>
    <v-list v-else dense>
      <v-list-item v-for="tx in transactions" :key="tx.id" :class="tx.type === 'beli' ? 'bg-green-lighten-5' : 'bg-red-lighten-5'">
        <template v-slot:prepend>
          <v-icon :color="tx.type === 'beli' ? 'primary' : 'error'">
            {{ tx.type === 'beli' ? 'mdi-arrow-up-circle-outline' : 'mdi-arrow-down-circle-outline' }}
          </v-icon>
        </template>
        <v-list-item-title class="font-weight-bold">
          {{ tx.type.toUpperCase() }} • Rp {{ numberWithCommas(tx.total_price) }}
          <span class="text-caption font-weight-regular ml-2 text-medium-emphasis">{{ formatDate(tx.date) }}</span>
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ tx.denom }} gr × {{ tx.count }} keping
        </v-list-item-subtitle>
        <template v-slot:append>
          <div class="text-right d-flex align-center" style="gap:6px;">
            <div class="font-weight-black text-subtitle-1">{{ (tx.denom * tx.count).toFixed(2) }} gr</div>
            <v-chip size="small" :color="brandColor(tx.brand)" label>{{ tx.brand }}</v-chip>
            <v-btn icon size="x-small" color="error" variant="text" @click.stop="confirmDelete(tx)">
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
const props = defineProps({
  transactions: Array,
  brandColor: Function
});
const emit = defineEmits(['delete-transaction']);
const showDeleteNotif = ref(false);
const showConfirm = ref(false);
let txToDelete = null;
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
// --- Computed Properties ---
function numberWithCommas(x) { 
    if(x == null || isNaN(x)) return '-'; 
    return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); 
}
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
</script>