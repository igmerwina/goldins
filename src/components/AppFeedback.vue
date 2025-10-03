<template>
  <v-card class="mb-4 elevation-4" rounded="lg">
    <v-card-text class="d-flex flex-column align-center justify-center">
      <div class="text-h6 font-weight-bold mb-2">Beri Feedback Aplikasi</div>
      <div class="text-body-2 mb-4 text-center">
        Kami sangat menghargai masukan Anda untuk pengembangan aplikasi ini.<br>
        Silakan isi form singkat berikut untuk memberikan saran, kritik, atau laporan bug.
      </div>
      <v-btn color="primary" variant="flat" href="https://forms.gle/4QDPbSSaVjfqPBEV9" target="_blank" rel="noopener" @click="emitFeedback">
        <v-icon start>mdi-message-text</v-icon>
        Isi Feedback
      </v-btn>
    </v-card-text>
  </v-card>
</template>
<script setup>
import { defineEmits } from 'vue';
const emit = defineEmits(['feedback-given']);
function emitFeedback() {
  emit('feedback-given');
}
// Komponen ini hanya menampilkan tombol feedback ke Google Form eksternal
</script> 
