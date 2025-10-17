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
              <span class="font-weight-bold text-h6 d-none d-sm-inline">Gold Insight</span>
              <span class="font-weight-bold text-h6 d-inline d-sm-none">Gold Insight</span>
              <p class="text-caption mt-n1 hidden-sm-and-down">Kelola portofolio emas dengan lebih mudah</p>
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
              <!-- Login Card - Enhanced -->
              <v-card v-if="!hasUser" class="pa-5 pa-sm-8 onboarding-card login-card" rounded="xl" elevation="8">
                <div class="login-header">
                  <div class="login-icon-wrapper">
                    <v-icon size="48" color="#0B6B3A">mdi-shield-check</v-icon>
                  </div>
                  <v-card-title class="text-h4 font-weight-bold mb-2 px-0 login-title">Selamat Datang</v-card-title>
                </div>

                <!-- Onboarding Carousel - Inside Card -->
                <div class="carousel-section" @mouseenter="stopCarousel" @mouseleave="startCarousel">
                  <button class="carousel-arrow left" @click="prevSlide">
                    <v-icon color="white" size="24">mdi-chevron-left</v-icon>
                  </button>
                  
                  <div class="carousel-inner">
                    <div class="carousel-track" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
                      <div class="carousel-slide" v-for="(slide, index) in carouselSlides" :key="index">
                        <div class="slide-content">
                          <div class="slide-image-wrapper">
                            <img :src="slide.image" :alt="slide.title" class="carousel-img" />
                          </div>
                          <div class="slide-caption">
                            <h3 class="slide-title">{{ slide.title }}</h3>
                            <p class="slide-description">{{ slide.description }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Dots Indicator -->
                    <br>
                    <div class="carousel-dots">
                      <span 
                        v-for="n in 3" 
                        :key="`dot-${n}`" 
                        :class="['dot', { active: currentSlide === n - 1 }]"
                        @click="goToSlide(n - 1)"
                      ></span>
                    </div>
                  </div>
                  
                  <button class="carousel-arrow right" @click="nextSlide">
                    <v-icon color="white" size="24">mdi-chevron-right</v-icon>
                  </button>
                </div>
                
                <p class="text-body-1 mb-4 px-0 login-subtitle">Masukkan data Anda untuk memulai pengelolaan portofolio emas yang lebih baik</p>
                <div class="input-group">
                  <v-text-field
                    v-model="user.name"
                    label="Nama Lengkap"
                    placeholder="Contoh: Ahmad Fauzi"
                    :rules="[
                      v => !!v || 'Nama wajib diisi',
                      v => /^[a-zA-Z\s]*$/.test(v) || 'Nama hanya boleh huruf dan spasi'
                    ]"
                    :maxlength="50"
                    clearable
                    prepend-inner-icon="mdi-account-circle"
                    variant="outlined"
                    color="#0B6B3A"
                    class="custom-input"
                    density="comfortable"
                  ></v-text-field>
                  
                  <v-text-field
                    v-model="user.phone"
                    label="Nomor Handphone"
                    placeholder="Contoh: 081234567890"
                    :rules="[v => !!v || 'No HP wajib diisi', v => /^\d*$/.test(v) || 'Hanya angka yang diizinkan']"
                    :maxlength="13"
                    clearable
                    prepend-inner-icon="mdi-cellphone"
                    variant="outlined"
                    color="#0B6B3A"
                    class="custom-input"
                    density="comfortable"
                    @input="filterPhone"
                  ></v-text-field>
                </div>
                
                <v-card-actions class="justify-end px-0 mt-2">
                  <v-btn 
                    color="#0B6B3A" 
                    size="x-large" 
                    @click="saveUser" 
                    :disabled="!user.name || !user.phone" 
                    block
                    rounded="xl"
                    elevation="0"
                    class="onboarding-btn"
                  >
                    <span class="btn-text">Mulai Sekarang</span>
                    <v-icon end size="24">mdi-arrow-right-circle</v-icon>
                  </v-btn>
                </v-card-actions>
                
                <v-alert v-if="phoneError" type="error" class="mt-4" rounded="lg" variant="tonal">{{ phoneError }}</v-alert>
                
                <div class="login-footer">
                  <v-icon size="16" color="#999">mdi-lock</v-icon>
                  <span class="footer-text">Data Anda aman dan terenkripsi</span>
                </div>
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
import { ref, onMounted, onUnmounted } from 'vue';
import Dashboard from './components/Dashboard.vue';
import { supabase } from './lib/SupabaseClient';
import onboarding1 from '@/assets/onboarding1.png';
import onboarding2 from '@/assets/onboarding2.png';
import onboarding3 from '@/assets/onboarding3.png';

const user = ref({ name: '', phone: '' });
const hasUser = ref(false);
const phoneError = ref('');
const welcomeName = ref('');
const showWelcome = ref(false);
const errorMsg = ref('');
const showError = ref(false);
const showLoader = ref(true);
const currentSlide = ref(0);
let carouselInterval = null;

const carouselSlides = [
  {
    image: onboarding1,
    title: 'Monitor Harga Emas',
    description: 'Pantau pergerakan harga emas'
  },
  {
    image: onboarding2,
    title: 'Kelola Portofolio Emasmu',
    description: 'Catat dan kelola aset emasmu dengan mudah dan praktis'
  },
  {
    image: onboarding3,
    title: 'Analisis Keuntungan',
    description: 'Lihat potensi keuntungan aset emasmu'
  }
];

onMounted(() => {
  setTimeout(() => {
    showLoader.value = false;
  }, 780);
  loadUser();
  
  // Start auto-play carousel jika user belum login
  if (!hasUser.value) {
    startCarousel();
  }
});

onUnmounted(() => {
  stopCarousel();
});

function nextSlide() {
  if (currentSlide.value < 2) {
    currentSlide.value++;
  } else {
    currentSlide.value = 0; // Kembali ke slide pertama
  }
}

function prevSlide() {
  if (currentSlide.value > 0) {
    currentSlide.value--;
  } else {
    currentSlide.value = 2; // Kembali ke slide terakhir
  }
}

function goToSlide(index) {
  currentSlide.value = index;
  resetCarousel(); // Reset timer ketika user manual klik
}

function startCarousel() {
  carouselInterval = setInterval(() => {
    nextSlide();
  }, 4000); // Auto-play setiap 4 detik
}

function stopCarousel() {
  if (carouselInterval) {
    clearInterval(carouselInterval);
    carouselInterval = null;
  }
}

function resetCarousel() {
  stopCarousel();
  startCarousel();
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
  background: white;
  border: 2px solid #f0f0f0;
  box-shadow: 0 10px 40px rgba(11, 107, 58, 0.1);
}

.login-card {
  max-width: 700px;
  margin: 0 auto;
}

/* Login Card Enhancements */
.login-header {
  text-align: center;
  margin-bottom: 24px;
}

.login-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.login-title {
  color: #1a1a1a;
  font-size: 2rem !important;
  line-height: 1.2;
}

.login-subtitle {
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
  text-align: center;
}

.input-group {
  margin-bottom: 16px;
}

.custom-input {
  margin-bottom: 16px;
}

.login-footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.footer-text {
  color: #999;
  font-size: 0.875rem;
}

.onboarding-btn {
  background: linear-gradient(135deg, #0B6B3A 0%, #1aa251 100%) !important;
  color: white !important;
  transition: all 0.3s ease;
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0.5px;
  height: 56px !important;
}

.onboarding-btn .btn-text {
  font-size: 1.1rem;
}

.onboarding-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(11, 107, 58, 0.35) !important;
  background: linear-gradient(135deg, #0d7d43 0%, #1eb758 100%) !important;
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

/* Carousel Section - Inside Card */
.carousel-section {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  margin-bottom: 32px;
  gap: 12px;
}

.carousel-inner {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 4px;
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

.slide-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
}

.slide-image-wrapper {
  width: 100%;
  max-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.carousel-img {
  width: 100%;
  height: auto;
  max-height: 280px;
  object-fit: contain;
  display: block;
  animation: slideInCarousel 0.5s ease-out;
}

.slide-caption {
  text-align: center;
  padding: 0 20px;
  animation: fadeIn 0.6s ease-out 0.2s backwards;
}

.slide-title {
  color: #0B6B3A;
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 6px;
  line-height: 1.3;
}

.slide-description {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
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
  background: rgba(11, 107, 58, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.dot:hover {
  background: rgba(11, 107, 58, 0.6);
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
  width: 42px;
  height: 42px;
  cursor: pointer;
  box-shadow: 0 3px 12px rgba(11, 107, 58, 0.25);
  transition: all 0.3s ease;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.carousel-arrow:hover:not(:disabled) {
  background: linear-gradient(135deg, #0d7d43 0%, #1eb758 100%);
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(11, 107, 58, 0.4);
}

.carousel-arrow:active {
  transform: scale(0.95);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
  .slide-image-wrapper {
    max-height: 240px;
  }
  
  .carousel-img {
    max-height: 240px;
  }
  
  .slide-title {
    font-size: 1.2rem;
  }
  
  .slide-description {
    font-size: 0.9rem;
  }
  
  .carousel-arrow {
    width: 38px;
    height: 38px;
  }
  
  .login-title {
    font-size: 1.75rem !important;
  }
  
  .login-subtitle {
    font-size: 0.95rem;
  }
}

@media (max-width: 600px) {
  .carousel-inner {
    border-radius: 12px;
  }
  
  .slide-content {
    padding: 12px;
  }
  
  .slide-image-wrapper {
    max-height: 180px;
    margin-bottom: 12px;
  }
  
  .carousel-img {
    max-height: 180px;
  }
  
  .slide-caption {
    padding: 0 8px;
  }
  
  .slide-title {
    font-size: 1.05rem;
  }
  
  .slide-description {
    font-size: 0.85rem;
  }
  
  .carousel-arrow {
    width: 36px;
    height: 36px;
  }
  
  .carousel-section {
    margin-bottom: 24px;
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
  
  .login-card {
    margin: 0 8px;
  }
  
  .login-title {
    font-size: 1.5rem !important;
  }
  
  .login-subtitle {
    font-size: 0.875rem;
  }
  
  .login-icon-wrapper {
    margin-bottom: 12px;
  }
  
  .onboarding-btn {
    height: 52px !important;
  }
  
  .onboarding-btn .btn-text {
    font-size: 1rem;
  }
}

@media (max-width: 400px) {
  .carousel-arrow {
    width: 32px;
    height: 32px;
  }
  
  .slide-content {
    padding: 8px;
  }
  
  .slide-image-wrapper {
    max-height: 150px;
    margin-bottom: 10px;
  }
  
  .carousel-img {
    max-height: 150px;
  }
  
  .slide-title {
    font-size: 0.95rem;
  }
  
  .slide-description {
    font-size: 0.75rem;
  }
  
  .carousel-section {
    margin-bottom: 20px;
    gap: 6px;
  }
  
  .login-title {
    font-size: 1.3rem !important;
  }
  
  .onboarding-btn {
    height: 48px !important;
  }
}
</style>