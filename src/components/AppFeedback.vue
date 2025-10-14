<template>
  <v-card class="mb-4 feedback-card" rounded="xl" elevation="0" style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.7) 0%, rgba(184, 134, 11, 0.7) 100%); color: white;">
    <v-card-text class="d-flex flex-column align-center justify-center py-6 px-4">
      <div class="icon-wrapper mb-3">
        <v-icon size="56" color="white" class="pulse-icon">mdi-message-star</v-icon>
      </div>
      <div class="text-h5 font-weight-bold mb-2 text-center">Beri Feedback Aplikasi</div>
      <div class="text-body-1 mb-4 text-center" style="max-width: 500px; opacity: 0.95;">
        Kami sangat menghargai masukan Anda untuk pengembangan aplikasi ini.
        Silakan isi form berikut untuk memberikan kritik, saran, atau laporan bug
      </div>
      <v-btn 
        color="white" 
        size="x-large"
        variant="flat" 
        href="https://forms.gle/4QDPbSSaVjfqPBEV9" 
        target="_blank" 
        rel="noopener" 
        @click="handleFeedbackClick"
        class="feedback-btn"
        rounded="pill"
        style="color: #B8860B; font-weight: 600; text-transform: none; min-width: 200px;"
      >
        <v-icon start size="22">mdi-message-text</v-icon>
        Isi Feedback Sekarang
      </v-btn>
      
      <!-- Download Report Button - appears after feedback click -->
      <transition name="slide-fade">
        <v-btn 
          v-if="showDownloadButton"
          color="white" 
          size="large"
          variant="outlined"
          @click="handleDownloadClick"
          class="download-btn mt-4"
          rounded="pill"
          style="color: white; border-color: white; font-weight: 600; text-transform: none; min-width: 200px;"
        >
          <v-icon start size="20">mdi-download</v-icon>
          Download Report PDF
        </v-btn>
      </transition>
    </v-card-text>
  </v-card>
</template>
<script setup>
import { ref, defineEmits } from 'vue';

const emit = defineEmits(['feedback-given', 'download-report']);

const showDownloadButton = ref(false);

function handleFeedbackClick() {
  // Show download button after 3 seconds
  setTimeout(() => {
    showDownloadButton.value = true;
  }, 3000);
  
  emit('feedback-given');
}

function handleDownloadClick() {
  emit('download-report');
}
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

.download-btn {
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(255, 255, 255, 0.2);
}

.download-btn:hover {
  background: white !important;
  color: #B8860B !important;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.3) !important;
}

.download-btn:active {
  transform: translateY(0) scale(1);
}

/* Transition for download button */
.slide-fade-enter-active {
  transition: all 0.5s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
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
  .feedback-card {
    border-radius: 12px !important;
    margin-bottom: 12px !important;
  }
  
  .feedback-card .v-card-text {
    padding: 14px 12px !important;
  }
  
  .icon-wrapper {
    width: 48px;
    height: 48px;
    margin-bottom: 8px !important;
  }
  
  .pulse-icon {
    font-size: 28px !important;
  }
  
  .text-h5 {
    font-size: 0.95rem !important;
    margin-bottom: 6px !important;
    line-height: 1.3;
  }
  
  .text-body-1 {
    font-size: 0.75rem !important;
    margin-bottom: 10px !important;
    padding: 0 4px;
    line-height: 1.4;
    opacity: 0.9 !important;
  }
  
  .feedback-btn {
    min-width: 100%;
    font-size: 0.8rem !important;
    height: 40px !important;
    padding: 0 16px !important;
  }
  
  .feedback-btn .v-icon {
    font-size: 18px !important;
    margin-right: 4px !important;
  }
  
  .download-btn {
    min-width: 100%;
    font-size: 0.75rem !important;
    height: 36px !important;
    margin-top: 8px !important;
    padding: 0 16px !important;
  }
  
  .download-btn .v-icon {
    font-size: 16px !important;
    margin-right: 4px !important;
  }
}
</style>
