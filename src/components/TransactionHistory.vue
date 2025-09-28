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
          {{ tx.brand }} • {{ tx.type.toUpperCase() }}
          <span class="text-caption font-weight-regular ml-2 text-medium-emphasis">{{ tx.date }}</span>
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ tx.denom }} g × {{ tx.count }} keping
        </v-list-item-subtitle>
        <template v-slot:append>
          <div class="text-right">
            <div class="font-weight-black text-subtitle-1">{{ (tx.denom * tx.count).toFixed(2) }} gr</div>
            <v-chip size="small" :color="brandColor(tx.brand)" label>{{ tx.brand }}</v-chip>
          </div>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>
<script setup>
const props = defineProps({
  transactions: Array,
  brandColor: Function
});
</script>
