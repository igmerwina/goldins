<template>
  <v-card class="mb-4 feedback-card" rounded="xl" elevation="0" style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.7) 0%, rgba(184, 134, 11, 0.7) 100%); color: white;">
    <v-card-text class="d-flex flex-column align-center justify-center py-6 px-4">
      <div class="icon-wrapper mb-3">
        <v-icon size="56" color="white" class="pulse-icon">mdi-message-star</v-icon>
      </div>
      <div class="text-h5 font-weight-bold mb-2 text-center">Beri Feedback Aplikasi</div>
      <div class="text-body-1 mb-4 text-center" style="max-width: 500px; opacity: 0.95;">
        Kami sangat menghargai masukan Anda untuk pengembangan aplikasi ini.
        Silakan isi form singkat berikut untuk memberikan saran, kritik, atau laporan bug.
      </div>
      <v-btn 
        color="white" 
        size="x-large"
        variant="flat" 
        href="https://forms.gle/4QDPbSSaVjfqPBEV9" 
        target="_blank" 
        rel="noopener" 
        @click="emitFeedback"
        class="feedback-btn"
        rounded="pill"
        style="color: #B8860B; font-weight: 600; text-transform: none; min-width: 200px;"
      >
        <v-icon start size="22">mdi-message-text</v-icon>
        Isi Feedback Sekarang
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

<style scoped>
.feedback-card {
  animation: scaleIn 0.7s ease-out;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.feedback-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 0%);
  animation: rotate 20s linear infinite;
  pointer-events: none;
}

.feedback-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(212, 175, 55, 0.4) !important;
}

.icon-wrapper {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  animation: float 3s ease-in-out infinite;
}

.pulse-icon {
  animation: pulse 2s ease-in-out infinite;
}

.feedback-btn {
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.feedback-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
}

.feedback-btn:active {
  transform: translateY(0) scale(1);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 600px) {
  .icon-wrapper {
    width: 72px;
    height: 72px;
  }
  
  .pulse-icon {
    font-size: 42px !important;
  }
  
  .feedback-btn {
    min-width: 100%;
  }
}
</style>
