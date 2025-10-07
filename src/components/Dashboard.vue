<template>
  <v-container fluid class="dashboard-container">
    <v-row justify="center">
      <v-col cols="12" sm="12" md="10" lg="9" xl="8" class="dashboard-content">
        <!-- Welcome Banner Animation -->
        <transition name="slide-fade">
          <div v-if="showWelcomeBanner" class="welcome-banner">
            <v-icon size="32" color="white" class="mr-3">mdi-hand-wave</v-icon>
            <div>
              <div class="text-h6 font-weight-bold">Selamat Datang, {{ user.name }}!</div>
              <div class="text-caption">Kelola portofolio emas Anda dengan mudah</div>
            </div>
            <v-btn icon size="small" variant="text" color="white" @click="showWelcomeBanner = false" class="ml-auto">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </transition>

        <PortfolioSummary
          ref="portfolioSummaryRef"
          :user="user"
          :totalGold="totalGold"
          :totalPorto="totalPorto"
          :latestDate="latestDate"
          :latestPriceFormatted="latestPriceFormatted"
          :avgPriceFormatted="avgPriceFormatted"
          :potentialProfit="potentialProfit"
          :potentialProfitFormatted="potentialProfitFormatted"
          :profitPercent="profitPercent"
          :donutBrands="donutBrands"
          :donutData="donutData"
          :numberWithCommas="numberWithCommas"
          :transactions="transactions"
        />
        <GoldComposition
          :transactions="transactions"
        />
        <TransactionForm
          :transaction="transaction"
          :today="today"
          :addTransaction="addTransaction"
          :formatRupiah="formatRupiah"
          :unformatRupiah="unformatRupiah"
        />
        <GoldPriceChart />
        <TransactionHistory
          :transactions="transactions"
          @delete-transaction="deleteTransaction"
        />
        <AppFeedback 
          @feedback-given="onFeedbackGiven" 
          @download-report="onDownloadReport"
        />
        
        <!-- Back to Top Button -->
        <transition name="scale-fade">
          <v-btn
            v-if="showBackToTop"
            fab
            fixed
            bottom
            right
            color="#0B6B3A"
            elevation="8"
            size="large"
            class="back-to-top-btn"
            @click="scrollToTop"
          >
            <v-icon size="28" color="white">mdi-chevron-up</v-icon>
          </v-btn>
        </transition>
      </v-col>
    </v-row>
    <!-- Alerts tetap di root -->
    <v-alert v-if="showWelcome" type="success" class="welcome-fade center-popup" border="start" prominent elevation="10">
      Selamat datang, <b>{{ welcomeName }}</b>!
    </v-alert>
    <v-alert v-if="showError" type="error" class="welcome-fade center-popup" border="start" prominent elevation="10">
      {{ errorMsg }}
    </v-alert>
    <v-alert v-if="showSuccess" type="success" class="welcome-fade center-popup" border="start" prominent elevation="10">
      Data transaksi berhasil disimpan!
    </v-alert>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../lib/SupabaseClient';

// Components
import PortfolioSummary from './PortfolioSummary.vue';
import TransactionForm from './TransactionForm.vue';
import GoldPriceChart from './GoldPriceChart.vue';
import TransactionHistory from './TransactionHistory.vue';
import GoldComposition from './GoldComposition.vue';
import AppFeedback from './AppFeedback.vue';

// Composables
import { useTransactions } from '../composables/useTransactions';
import { useGoldPrice } from '../composables/useGoldPrice';
import { usePortfolioCalculations } from '../composables/usePortfolioCalculations';
import { useFormatters } from '../composables/useFormatters';

// Props
const props = defineProps({
  user: Object
});

// UI State
const welcomeName = ref('');
const showWelcome = ref(false);
const showError = ref(false);
const errorMsg = ref('');
const showSuccess = ref(false);
const showWelcomeBanner = ref(true);
const showBackToTop = ref(false);
const portfolioSummaryRef = ref(null);

// Transaction State
const transaction = ref({ 
  date: new Date().toISOString().split('T')[0], 
  type: 'beli', 
  brand: 'Galeri24', 
  denom: 1, 
  count: 1,
  manualPrice: ''
});

const today = new Date().toISOString().split('T')[0];
const denomOptions = [0.5, 1, 2, 5, 10, 25, 50, 100];

// Use Composables
const { 
  transactions, 
  fetchTransactions, 
  addTransaction: addTransactionAPI,
  deleteTransaction: deleteTransactionAPI,
  validateSellTransaction 
} = useTransactions(computed(() => props.user?.phone));

const { 
  latestPrice, 
  latestDate, 
  fetchLatestPrice 
} = useGoldPrice();

const {
  numberWithCommas,
  totalGold,
  totalPorto,
  avgPriceFormatted,
  latestPriceFormatted,
  potentialProfit,
  potentialProfitFormatted,
  profitPercent,
  donutData,
  donutBrands
} = usePortfolioCalculations(transactions, latestPrice);

const { formatRupiah, unformatRupiah } = useFormatters();

// Lifecycle
onMounted(async () => {
  console.log('Dashboard mounted, user:', props.user);
  console.log('User phone:', props.user?.phone);
  
  // Fetch initial data
  try {
    await Promise.all([
      fetchTransactions(),
      fetchLatestPrice()
    ]);
    console.log('Data fetched - Transactions:', transactions.value.length);
    console.log('Latest price:', latestPrice.value);
  } catch (err) {
    console.error('Error fetching data:', err);
  }
  
  // Check for welcome message from localStorage
  const raw = localStorage.getItem('pg_user');
  if (raw) {
    const u = JSON.parse(raw);
    if (u?.name) {
      welcomeName.value = u.name;
      showWelcome.value = true;
      setTimeout(() => { showWelcome.value = false; }, 2000);
    }
  }
  
  // Setup scroll listener for back-to-top button
  window.addEventListener('scroll', handleScroll);
  
  // Auto-hide welcome banner
  setTimeout(() => {
    showWelcomeBanner.value = false;
  }, 5000);
});

// Transaction Management
async function addTransaction() {
  // Validate required fields
  if (!transaction.value.manualPrice) {
    showError.value = true;
    errorMsg.value = 'Harga Beli Emas wajib diisi!';
    setTimeout(() => { showError.value = false; }, 2000);
    return;
  }
  
  // Validate sell transaction
  if (transaction.value.type === 'jual') {
    const validation = validateSellTransaction(
      transaction.value.brand,
      transaction.value.denom,
      transaction.value.count,
      props.user.phone
    );
    
    if (!validation.valid) {
      showError.value = true;
      errorMsg.value = validation.message;
      setTimeout(() => { showError.value = false; }, 2000);
      return;
    }
  }
  
  // Prepare transaction data
  const price = Number(transaction.value.manualPrice.toString().replace(/[^\d]/g, '')) || 0;
  const total_price = price * transaction.value.count * transaction.value.denom;
  
  const transactionData = {
    user_phone: props.user.phone,
    type: transaction.value.type,
    brand: transaction.value.brand,
    denom: transaction.value.denom,
    count: transaction.value.count,
    date: transaction.value.date,
    price: price,
    total_price: total_price
  };
  
  // Add transaction
  const result = await addTransactionAPI(transactionData);
  
  if (result.success) {
    showSuccess.value = true;
    setTimeout(() => {
      showSuccess.value = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1000);
    
    // Reset form
    transaction.value = { 
      date: new Date().toISOString().split('T')[0], 
      type: 'beli', 
      brand: 'Galeri24', 
      denom: 1, 
      count: 1,
      manualPrice: ''
    };
  } else {
    showError.value = true;
    errorMsg.value = 'Gagal simpan ke database!';
    setTimeout(() => { showError.value = false; }, 2000);
  }
}

async function deleteTransaction(tx) {
  const result = await deleteTransactionAPI(tx.id);
  
  if (!result.success) {
    showError.value = true;
    errorMsg.value = 'Gagal menghapus transaksi!';
    setTimeout(() => { showError.value = false; }, 2000);
  }
}

// Feedback & Report Functions
function onFeedbackGiven() {
  if (portfolioSummaryRef.value && portfolioSummaryRef.value.enableDownloadReportWithDelay) {
    portfolioSummaryRef.value.enableDownloadReportWithDelay();
  }
}

function onDownloadReport() {
  // Trigger download report dari PortfolioSummary
  if (portfolioSummaryRef.value && portfolioSummaryRef.value.generateReport) {
    portfolioSummaryRef.value.generateReport();
  }
}

function handleScroll() {
  showBackToTop.value = window.scrollY > 300;
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}
</script>

<style scoped>
.welcome-fade {
  opacity: 1;
  animation: fadeInOut 3s cubic-bezier(0.4,0,0.2,1);
}
.center-popup {
  position: fixed;
  top: 10%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  min-width: 300px;
  max-width: 90vw;
  text-align: center;
  transition: opacity 0.7s, transform 0.7s;
}
@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, -60%) scale(0.95); }
  10% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  90% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -60%) scale(0.95); }
}

.dashboard-container {
  padding: 16px 8px;
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
  min-height: 100vh;
}

.dashboard-content {
  animation: fadeInUp 0.6s ease-out;
}

.welcome-banner {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #0B6B3A 0%, #1aa251 100%);
  color: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(11, 107, 58, 0.25);
  animation: slideDown 0.5s ease-out;
}

.back-to-top-btn {
  position: fixed !important;
  bottom: 24px !important;
  right: 24px !important;
  z-index: 999;
  box-shadow: 0 8px 24px rgba(11, 107, 58, 0.35) !important;
  transition: all 0.3s ease;
}

.back-to-top-btn:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 32px rgba(11, 107, 58, 0.45) !important;
}

.back-to-top-btn:active {
  transform: translateY(0) scale(0.95);
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-fade-enter-active {
  transition: all 0.5s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.scale-fade-enter-active {
  transition: all 0.3s ease;
}

.scale-fade-leave-active {
  transition: all 0.2s ease;
}

.scale-fade-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.scale-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Mobile Optimizations */
@media (max-width: 600px) {
  .dashboard-container {
    padding: 12px 4px;
  }
  
  .welcome-banner {
    padding: 16px 20px;
    margin-bottom: 16px;
    font-size: 0.9rem;
  }
  
  .back-to-top-btn {
    bottom: 16px !important;
    right: 16px !important;
  }
}
</style>