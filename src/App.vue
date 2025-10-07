<template>
  <v-app>
    <transition name="fade-loader">
      <div v-if="showLoader" class="loader-overlay">
        <div class="loader-spinner"></div>
      </div>
    </transition>
    <div :class="{ 'blur-bg': showLoader }">
      <v-app-bar app flat class="gradient-header">
        <div style="width:100vw;display:flex;justify-content:center;align-items:center;position:relative;">
          <v-container class="d-flex align-center px-0 header-container">
            <v-icon size="32" class="mr-2" color="secondary">mdi-treasure-chest</v-icon>
            <v-toolbar-title class="white--text">
              <span class="font-weight-bold text-h6 d-none d-sm-inline">Gold Insight by Pegadaian</span>
              <span class="font-weight-bold text-h6 d-inline d-sm-none">Gold Insight</span>
              <p class="text-caption mt-n1 hidden-sm-and-down">Kelola portofolio emas Anda dengan lebih mudah</p>
            </v-toolbar-title>
            <v-spacer />
            <transition name="fade-in-btn">
              <v-btn v-if="hasUser" color="secondary" variant="flat" @click="logout" class="logout-btn">
                <v-icon class="logout-icon">mdi-logout</v-icon>
                <span class="logout-text">Logout</span>
              </v-btn>
            </transition>
          </v-container>
        </div>
      </v-app-bar>

      <v-main class="bg-background">
        <v-container>
          <v-row justify="center">
            <v-col cols="12" sm="12" md="10" lg="9" xl="8">
              <!-- Onboarding Carousel - Separated -->
              <div v-if="!hasUser" class="onboarding-carousel mb-4">
                <button class="carousel-arrow left" @click="prevSlide" :disabled="currentSlide === 0">
                  <v-icon color="white">mdi-chevron-left</v-icon>
                </button>
                
                <div class="carousel-container">
                  <div class="carousel-track" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
                    <div class="carousel-slide">
                      <img src="/src/assets/onboarding1.png" alt="Onboarding 1" class="carousel-img" />
                    </div>
                    <div class="carousel-slide">
                      <img src="/src/assets/onboarding2.png" alt="Onboarding 2" class="carousel-img" />
                    </div>
                    <div class="carousel-slide">
                      <img src="/src/assets/onboarding3.png" alt="Onboarding 3" class="carousel-img" />
                    </div>
                  </div>
                  
                  <!-- Dots Indicator -->
                  <div class="carousel-dots">
                    <span 
                      v-for="n in 3" 
                      :key="`dot-${n}`" 
                      :class="['dot', { active: currentSlide === n - 1 }]"
                      @click="goToSlide(n - 1)"
                    ></span>
                  </div>
                </div>
                
                <button class="carousel-arrow right" @click="nextSlide" :disabled="currentSlide === 2">
                  <v-icon color="white">mdi-chevron-right</v-icon>
                </button>
              </div>

              <!-- Login Card - Separated -->
              <v-card v-if="!hasUser" class="pa-4 pa-sm-6 onboarding-card login-card" rounded="xl" elevation="4" style="background: white; border: 1px solid #e8e8e8;">
                <v-card-title class="text-h5 font-weight-bold mb-2 px-0" style="color: #2e2e2e;">Masuk Aplikasi</v-card-title>
                <p class="text-body-2 mb-4 px-0" style="color: #6b6b6b;">Masukkan data Anda untuk memulai mengelola portofolio emas</p>
                <v-text-field
                  v-model="user.name"
                  label="Masukkan Nama Anda"
                  placeholder="Masukkan Nama Anda"
                  :rules="[
                    v => !!v || 'Nama wajib diisi',
                    v => /^[a-zA-Z\s]*$/.test(v) || 'Nama hanya boleh huruf dan spasi'
                  ]"
                  :maxlength="50"
                  clearable
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                ></v-text-field>
                
                <v-text-field
                  v-model="user.phone"
                  label="Masukkan No HP Anda (angka saja)"
                  placeholder="Masukkan No HP Anda"
                  :rules="[v => !!v || 'No HP wajib diisi', v => /^\d*$/.test(v) || 'Hanya angka yang diizinkan']"
                  :maxlength="13"
                  clearable
                  prepend-inner-icon="mdi-phone"
                  variant="outlined"
                  @input="filterPhone"
                ></v-text-field>
                
                <v-card-actions class="justify-end px-0 mt-4">
                  <v-btn 
                    color="#0B6B3A" 
                    size="x-large" 
                    @click="saveUser" 
                    :disabled="!user.name || !user.phone" 
                    block
                    rounded="pill"
                    elevation="2"
                    class="onboarding-btn"
                    style="text-transform: none; font-weight: 600; letter-spacing: 0.5px;"
                  >
                    <v-icon start size="22">mdi-arrow-right-circle</v-icon>
                    Lanjut ke Dashboard
                  </v-btn>
                </v-card-actions>
                <v-alert v-if="phoneError" type="error" class="mt-4">{{ phoneError }}</v-alert>
              </v-card>
              
              <Dashboard v-else :user="user" />
            </v-col>
          </v-row>
        </v-container>
      </v-main>

      <v-dialog v-model="showError" max-width="400">
        <v-card>
          <v-card-title class="text-h6 font-weight-bold">{{ errorMsg }}</v-card-title>
        </v-card>
      </v-dialog>
    </div>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Dashboard from './components/Dashboard.vue';
import { supabase } from './lib/SupabaseClient';

const user = ref({ name: '', phone: '' });
const hasUser = ref(false);
const phoneError = ref('');
const welcomeName = ref('');
const showWelcome = ref(false);
const errorMsg = ref('');
const showError = ref(false);
const showLoader = ref(true);
const currentSlide = ref(0);

onMounted(() => {
  setTimeout(() => {
    showLoader.value = false;
  }, 780); // Loader tampil 1.2 detik, bisa diubah sesuai kebutuhan
  loadUser();
});

function nextSlide() {
  if (currentSlide.value < 2) {
    currentSlide.value++;
  }
}

function prevSlide() {
  if (currentSlide.value > 0) {
    currentSlide.value--;
  }
}

function goToSlide(index) {
  currentSlide.value = index;
}

function filterPhone() {
  user.value.phone = user.value.phone.replace(/[^0-9]/g, '');
}

function showErrorPopup(msg) {
  errorMsg.value = msg;
  showError.value = true;
  setTimeout(() => { showError.value = false; }, 2000);
}

async function saveUser() {
  phoneError.value = '';
  // Validasi nama: huruf saja, max 40 char
  if (!user.value.name || !/^[a-zA-Z\s]+$/.test(user.value.name) || user.value.name.length > 40) {
    showErrorPopup('Nama hanya boleh huruf dan maksimal 40 karakter.');
    return;
  }
  // Validasi no hp: minimal 10 digit
  if (!user.value.phone || user.value.phone.length < 10) {
    showErrorPopup('No HP minimal 10 angka.');
    return;
  }
  // Cek apakah phone sudah ada di Supabase
  const { data, error } = await supabase.from('users').select('name').eq('phone', user.value.phone).single();
  if (data && data.name) {
    // Jika ada, popup selamat datang
    user.value.name = data.name; // sinkronkan nama dari database
    hasUser.value = true;
    localStorage.setItem('pg_user', JSON.stringify(user.value));
    return;
  }
  // Jika belum ada, simpan sebagai data baru
  hasUser.value = true;
  localStorage.setItem('pg_user', JSON.stringify(user.value));
  const date = new Date().toISOString().split('T')[0]
  const { error: upsertError } = await supabase.from('users').upsert([
    { name: user.value.name, phone: user.value.phone, create_date: date }
  ], { onConflict: ['phone'] });
  if (upsertError) {
    console.error('Supabase upsert error:', upsertError.message);
  }
}

function loadUser() {
  const raw = localStorage.getItem('pg_user');
  if (raw) {
    user.value = JSON.parse(raw);
    hasUser.value = true;
  }
}

function logout() {
  if (!confirm('Anda yakin ingin keluar? Semua data transaksi akan tetap tersimpan')) return;
  localStorage.removeItem('pg_user');
  user.value = { name: '', phone: '' };
  hasUser.value = false;
}
</script>

<style scoped>
.onboarding-card {
  animation: cardFadeIn 0.6s ease-out;
}

.login-card {
  max-width: 700px;
  margin: 0 auto;
}

.onboarding-btn {
  background: linear-gradient(135deg, #0B6B3A 0%, #1aa251 100%) !important;
  color: white !important;
  transition: all 0.3s ease;
}

.onboarding-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(11, 107, 58, 0.3) !important;
}

.onboarding-btn:active {
  transform: translateY(0);
}

.logout-btn {
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
}

.logout-btn .logout-icon {
  transition: all 0.3s ease;
  margin-right: 0;
}

.logout-btn .logout-text {
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  white-space: nowrap;
  transition: all 0.3s ease;
  margin-left: 0;
}

.logout-btn:hover .logout-icon {
  margin-right: 8px;
}

.logout-btn:hover .logout-text {
  max-width: 100px;
  opacity: 1;
  margin-left: 0;
}

.logout-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.logout-btn:active {
  transform: translateY(0);
}

/* Fade in animation for button appearance */
.fade-in-btn-enter-active {
  animation: fadeInSlide 0.5s ease-out;
}

.fade-in-btn-leave-active {
  animation: fadeInSlide 0.3s ease-in reverse;
}

@keyframes fadeInSlide {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.loader-overlay {
  position: fixed;
  z-index: 99999;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.4s;
}
.loader-spinner {
  width: 56px;
  height: 56px;
  border: 6px solid #e0e0e0;
  border-top: 6px solid #0B6B3A;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.blur-bg {
  filter: blur(4px) grayscale(0.1) brightness(0.97);
  pointer-events: none;
  user-select: none;
}
.fade-loader-enter-active, .fade-loader-leave-active {
  transition: opacity 0.4s;
}
.fade-loader-enter-from, .fade-loader-leave-to {
  opacity: 0;
}
.fade-loader-enter-to, .fade-loader-leave-from {
  opacity: 1;
}

.header-container {
  max-width: 900px;
  width: 100%;
}
@media (max-width: 600px) {
  .header-container {
    max-width: 100vw !important;
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
}

.gradient-header {
  background: linear-gradient(135deg, #0B6B3A 30%, #1aa251 60%) !important;
  color: #fff !important;
  border-bottom: none;
}

.onboarding-carousel {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  padding: 20px 0;
  gap: 12px;
  animation: fadeInDown 0.6s ease-out;
}

.carousel-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(11, 107, 58, 0.15);
  background: white;
}

.carousel-track {
  display: flex;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.carousel-slide {
  min-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-img {
  width: 100%;
  height: auto;
  max-height: 320px;
  object-fit: contain;
  display: block;
  animation: slideInCarousel 0.5s ease-out;
}

.carousel-dots {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid rgba(11, 107, 58, 0.3);
}

.dot:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: scale(1.2);
}

.dot.active {
  background: #0B6B3A;
  border-color: #fff;
  width: 28px;
  border-radius: 5px;
}

.carousel-arrow {
  background: linear-gradient(135deg, #0B6B3A 0%, #1aa251 100%);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(11, 107, 58, 0.3);
  transition: all 0.3s ease;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.carousel-arrow:hover:not(:disabled) {
  background: linear-gradient(135deg, #1aa251 0%, #0B6B3A 100%);
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(11, 107, 58, 0.4);
}

.carousel-arrow:active:not(:disabled) {
  transform: scale(0.95);
}

.carousel-arrow:disabled {
  background: #e0e0e0;
  cursor: not-allowed;
  opacity: 0.5;
  box-shadow: none;
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInCarousel {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 960px) {
  .carousel-img {
    max-height: 260px;
  }
}

@media (max-width: 600px) {
  .carousel-container {
    max-width: 100%;
    border-radius: 16px;
  }
  
  .carousel-img {
    max-height: 200px;
  }
  
  .carousel-arrow {
    width: 36px;
    height: 36px;
  }
  
  .onboarding-carousel {
    padding: 12px 0;
    gap: 8px;
  }
  
  .carousel-dots {
    bottom: 12px;
    gap: 8px;
  }
  
  .dot {
    width: 8px;
    height: 8px;
  }
  
  .dot.active {
    width: 24px;
  }
}

@media (max-width: 400px) {
  .carousel-arrow {
    width: 32px;
    height: 32px;
  }
  
  .carousel-img {
    max-height: 160px;
  }
}
</style>