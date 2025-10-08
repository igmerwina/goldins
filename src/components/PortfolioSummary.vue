<template>
  <v-card class="mb-4 portfolio-card" rounded="xl" elevation="8" style="background: linear-gradient(135deg, #0B6B3A 0%, #1aa251 100%); color: white; box-shadow: 0 8px 24px rgba(11, 107, 58, 0.25);">
    <v-card-title class="d-flex justify-space-between align-center py-4 px-4">
      <div>
        <div class="text-caption" style="opacity: 0.9;">Halo, <strong style="font-size: 1.1em;">{{ user.name || user.phone }}</strong></div>
        <div class="text-h5 font-weight-bold mt-1">Portofolio Emas</div>
      </div>
      <v-chip color="white" variant="flat" label style="color: #0B6B3A; font-weight: 600;">
        <v-icon start size="18">mdi-phone</v-icon>
        {{ user.phone }}
      </v-chip>
    </v-card-title>
    <v-card-text class="px-4 py-4">
      <v-row align="center" justify="space-between" class="mb-3">
        <v-col cols="12" sm="4" class="py-2">
          <div class="stat-card stat-card-1">
            <div class="text-caption mb-1" style="opacity: 0.7;">Total Emas Fisik</div>
            <div class="text-h4 font-weight-black">{{ totalGold.toFixed(2) }} gr</div>
            <v-icon class="stat-icon">mdi-gold</v-icon>
          </div>
        </v-col>
        <v-col cols="12" sm="4" class="py-2">
          <div class="stat-card stat-card-2">
            <div class="text-caption mb-1" style="opacity: 0.7;">Senilai Nominal (Rp)</div>
            <div class="text-h5 font-weight-black">{{ totalPorto }}</div>
            <v-icon class="stat-icon">mdi-currency-usd</v-icon>
          </div>
        </v-col>
        <v-col cols="12" sm="4" class="text-sm-right py-2">
          <div class="stat-card stat-card-3">
            <div class="text-caption mb-1" style="opacity: 0.7; line-height: 1.3;">
              Harga Jual/gram<br/>
              <span style="font-size: 0.75rem; opacity: 0.8;">{{ formatDateIndo(latestDate) }}</span>
            </div>
            <div class="text-subtitle-1 font-weight-bold">Rp {{ latestPriceFormatted }}</div>
            <v-icon class="stat-icon">mdi-trending-up</v-icon>
          </div>
        </v-col>
      </v-row>
      <v-divider class="my-3" style="opacity: 0.3;"></v-divider>
      <v-row justify="space-between" class="mt-2">
        <v-col cols="12" md="6" class="py-2">
          <div class="info-box mb-3">
            <div class="text-caption mb-1" style="opacity: 0.8;">Total Emas yang dibeli</div>
            <div class="text-h6 font-weight-bold">Rp {{ totalEmasDibeliFormatted }}</div>
          </div>
          <div class="info-box mb-3">
            <div class="text-caption mb-1" style="opacity: 0.8;">Rata-rata harga beli (per gram)</div>
            <div class="text-h6 font-weight-bold">Rp {{ avgHargaBeliFormatted }}</div>
          </div>
        </v-col>
        <v-col cols="12" md="6" class="text-md-right py-2">
          <div class="profit-box">
            <div class="text-caption mb-2" style="color: #6b6b6b;">Potensi Profit (Rp)</div>
            <div :class="['text-h4 font-weight-black profit-amount', potentialProfit >= 0 ? 'profit-positive' : 'profit-negative']">
              {{ potentialProfitFormatted }}
            </div>
            <div class="text-body-1 mt-1 d-flex align-center justify-end" style="color: #2e2e2e;">
              <span>({{ profitPercent }})</span>
              <v-icon 
                v-if="potentialProfit >= 0" 
                size="20" 
                color="#0B6B3A" 
                class="ml-1 profit-icon"
              >
                mdi-arrow-up
              </v-icon>
              <v-icon 
                v-else 
                size="20" 
                color="#d32f2f" 
                class="ml-1 profit-icon"
              >
                mdi-arrow-down
              </v-icon>
            </div>
          </div>
          <v-tooltip
            v-if="!canDownloadReport"
            v-model="showTooltip"
            location="bottom"
            :color="'grey-lighten-2'"
            :text="'Report bisa didownload setelah mengisi Form Feedback'"
            :open-on-click="true"
            :open-on-hover="true"
            :arrow="true"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                ref="downloadBtnRef"
                color="white"
                variant="flat"
                class="mt-2 download-btn"
                @click="onDownloadClick"
                :loading="isLoading || isEnabling"
                :style="!canDownloadReport ? 'color:#bdbdbd;background:#f5f5f5;border:1px solid #e0e0e0;cursor:not-allowed;' : 'color:#0B6B3A;'"
              >
                <v-icon start :color="!canDownloadReport ? 'grey' : '#0B6B3A'">mdi-file-pdf-box</v-icon>
                <v-progress-circular
                  v-if="isLoading || isEnabling"
                  indeterminate
                  color="#0B6B3A"
                  size="18"
                  class="mr-2"
                />
                <span :style="!canDownloadReport ? 'color:#bdbdbd' : 'color:#0B6B3A;font-weight:600;'">
                  <template v-if="!isLoading && !isEnabling">Download Report</template>
                  <template v-else-if="isEnabling">Tunggu 3 Detik</template>
                  <template v-else>Downloading</template>
                </span>
              </v-btn>
            </template>
          </v-tooltip>
          <v-btn
            v-else
            ref="downloadBtnRef"
            color="white"
            variant="flat"
            class="mt-2 download-btn"
            @click="onDownloadClick"
            :loading="isLoading || isEnabling"
            style="color:#0B6B3A;"
          >
            <v-icon start color="#0B6B3A">mdi-file-pdf-box</v-icon>
            <v-progress-circular
              v-if="isLoading || isEnabling"
              indeterminate
              color="#0B6B3A"
              size="18"
              class="mr-2"
            />
            <span style="color:#0B6B3A;font-weight:600;">
              <template v-if="!isLoading && !isEnabling">Download Report</template>
              <template v-else-if="isEnabling">Tunggu 3 Detik</template>
              <template v-else>Downloading</template>
            </span>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script setup>
import { ref, computed } from 'vue';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

const props = defineProps({
  user: Object,
  totalGold: Number,
  totalPorto: String,
  latestDate: String,
  latestPriceFormatted: String,
  avgPriceFormatted: String,
  potentialProfit: Number,
  potentialProfitFormatted: String,
  profitPercent: String,
  donutBrands: Array,
  donutData: Object,
  numberWithCommas: Function,
  transactions: Array
});

const isLoading = ref(false);
const canDownloadReport = ref(false);
const isEnabling = ref(false);
const showTooltip = ref(false);

function onDownloadClick(e) {
  if (!canDownloadReport.value) {
    showTooltip.value = true;
    setTimeout(() => { showTooltip.value = false; }, 2200);
    return;
  }
  generateReport();
}

// Fungsi ini akan dipanggil dari parent (Dashboard) setelah feedback diklik
function enableDownloadReportWithDelay() {
  isEnabling.value = true;
  setTimeout(() => {
    canDownloadReport.value = true;
    isEnabling.value = false;
  }, 3000);
}

// Agar parent bisa memanggil fungsi ini via ref
defineExpose({ enableDownloadReportWithDelay, generateReport });

// Hitung total pembelian emas (sum total_price dari transaksi 'beli')
const totalEmasDibeli = computed(() => {
  if (!props.transactions || !props.transactions.length) return 0;
  return props.transactions
    .filter(tx => tx.type === 'beli')
    .reduce((sum, tx) => sum + (Number(tx.total_price) || 0), 0);
});

const totalEmasDijual = computed(() => {
  if (!props.transactions || !props.transactions.length) return 0;
  return props.transactions
    .filter(tx => tx.type === 'jual')
    .reduce((sum, tx) => sum + (Number(tx.total_price) || 0), 0);
});

const totalEmasBeliFinal = computed(() => totalEmasDibeli.value - totalEmasDijual.value);

// Format totalEmasDibeli ke rupiah
const totalEmasDibeliFormatted = computed(() => {
  return props.numberWithCommas ? props.numberWithCommas(totalEmasBeliFinal.value) : totalEmasBeliFinal.value.toLocaleString('id-ID');
});

// Hitung rata-rata harga beli per 1 gram dari transaksi 'beli'
const avgHargaBeli = computed(() => {
  if (!props.transactions || !props.transactions.length) return 0;
  const beli = props.transactions.filter(tx => tx.type === 'beli');
  const totalPrice = beli.reduce((sum, tx) => sum + (Number(tx.total_price) || 0), 0);
  const totalGram = beli.reduce((sum, tx) => sum + (Number(tx.denom) * Number(tx.count)), 0);
  if (totalGram === 0) return 0;
  return Math.round(totalPrice / totalGram);
});
const avgHargaBeliFormatted = computed(() => {
  return props.numberWithCommas ? props.numberWithCommas(avgHargaBeli.value) : avgHargaBeli.value.toLocaleString('id-ID');
});

// Potensi profit = Senilai - Total Emas yang dibeli
const potentialProfit = computed(() => {
  const senilai = Number((props.totalPorto || '').replace(/[^\d]/g, ''));
  return senilai - totalEmasDibeli.value;
});
const potentialProfitFormatted = computed(() => {
  return props.numberWithCommas ? props.numberWithCommas(potentialProfit.value) : potentialProfit.value.toLocaleString('id-ID');
});
const profitPercent = computed(() => {
  if (!totalEmasDibeli.value) return '-';
  const percent = (potentialProfit.value / totalEmasDibeli.value) * 100;
  return percent.toFixed(1) + '%';
});

function formatDateIndo(dateStr) {
  if (!dateStr) return '-';
  // Support both yyyy-mm-dd and yyyy-mm-ddTHH:mm:ss
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return dateStr;
  const [_, y, m, d] = match;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${Number(d)} ${months[Number(m)-1]} ${y}`;
}

async function generateReport() {
  isLoading.value = true;
  try {
    const doc = new jsPDF();
    // Title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Laporan Portofolio Emas', 14, 16);
    doc.setLineWidth(0.6);
    doc.line(14, 18, 196, 18); // garis horizontal tipis di bawah judul
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    doc.text(`Nama: ${props.user.name || '-'}`, 14, 24); 
    doc.text(`No HP: ${props.user.phone || '-'}`, 14, 29);
    // Tanggal Cetak di kanan
    const pageWidth = doc.internal.pageSize.getWidth();
    // Format tanggal cetak dan tanggal harga jual per ke format 30 Sep 2025
    const bulanPendek = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const tglCetak = new Date();
    const tglCetakStr = `${tglCetak.getDate()} ${bulanPendek[tglCetak.getMonth()]} ${tglCetak.getFullYear()}`;
    // Format tanggal harga jual per
    let tglHargaJualStr = '-';
    if (props.latestDate && /^\d{4}-\d{2}-\d{2}$/.test(props.latestDate)) {
      const [y, m, d] = props.latestDate.split('-');
      tglHargaJualStr = `${Number(d)} ${bulanPendek[Number(m)-1]} ${y}`;
    }
    doc.text(`Tanggal Cetak: ${tglCetakStr}`, pageWidth - 14 - doc.getTextWidth(`Tanggal Cetak: ${tglCetakStr}`), 23);

    // Section 1: Portofolio Summary
    doc.setFontSize(13);
    doc.text('Ringkasan Portofolio', 14, 38);
    doc.setFontSize(9);
    doc.text(`Dihitung berdasarkan harga jual per: ${tglHargaJualStr}`, 14, 43);
    doc.setFontSize(13);
    autoTable(doc, {
      startY: 45,
      head: [['Total Emas', 'Senilai', 'Rata-rata Harga Jual', 'Rata-rata Harga Beli', 'Potensi Profit']],
      body: [[
        props.totalGold?.toFixed(2) + ' gr' || '-',
        'Rp ' + props.totalPorto || '-',
        'Rp ' + props.latestPriceFormatted || '-',
        'Rp ' + props.avgPriceFormatted || '-',
        'Rp ' + `${props.potentialProfitFormatted || '-'} (${props.profitPercent || '-'})`
      ]],
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [11, 107, 58] }
    });

    // Section 2: Komposisi Emas (Donut Chart as Image + Data Table)
    let y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 9 : 60;
    doc.setFontSize(10);
    doc.text('Komposisi Emas', 14, y);
    y += 4;
    // Ambil canvas donut chart
    const donutCanvas = document.getElementById('donutChart');
    if (donutCanvas) {
      const chartImg = await html2canvas(donutCanvas).then(canvas => canvas.toDataURL('image/png'));
      doc.addImage(chartImg, 'PNG', 60, y, 100, 50);
      y += 54;
      // Tambahkan persentase komposisi emas horizontal di bawah grafik
      if (props.donutBrands && props.donutBrands.length) {
        const totalGram = props.donutBrands.reduce((sum, b) => sum + (props.donutData[b]?.gram || 0), 0);
        doc.setFontSize(9);
        let percentText = props.donutBrands.map(brand => {
          const percent = totalGram ? ((props.donutData[brand]?.gram || 0) / totalGram * 100).toFixed(1) : '0.0';
          return `${brand}: ${percent}%`;
        }).join('   ');
        const pageWidth = doc.internal.pageSize.getWidth();
        const textWidth = doc.getTextWidth(percentText);
        doc.text(percentText, (pageWidth - textWidth) / 2, y + 8);
        y += 14;
      }
    } else {
      doc.text('(Chart tidak tersedia)', 14, y + 10);
      y += 14;
    }
    // Tambahkan tabel data komposisi emas
    const komposisiRows = (props.donutBrands && props.donutBrands.length)
      ? props.donutBrands.map(brand => [
          brand,
          props.donutData?.[brand]?.gram?.toFixed(2) + ' gr' || '-',
          'Rp ' +  props.numberWithCommas?.(props.donutData?.[brand]?.nominal) || '-'
        ])
      : [['-', '-', '-']];
    autoTable(doc, {
      startY: y,
      head: [['Brand', 'Gram', 'Senilai (Rp)']],
      body: komposisiRows,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [11, 107, 58] }
    });
    y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : y + 30;

    // Section 3: Riwayat Transaksi (ambil data dari TransactionHistory)
    doc.setFontSize(13);
    doc.text('Riwayat Transaksi', 14, y + 8);
    y += 12;
    // Ambil data dari props.transactions (harus sama dengan yang dilempar ke TransactionHistory)
    let txs = [];
    if (Array.isArray(props.transactions) && props.transactions.length) {
      txs = props.transactions;
    }
    autoTable(doc, {
      startY: y,
      head: [['Tanggal', 'Jenis', 'Merk', 'Denominasi', 'Jumlah', 'Harga (per gram)', 'Total']],
      body: txs.length
        ? txs.map(tx => [
            tx.date ? (() => {
              const d = new Date(tx.date);
              const day = d.getDate().toString().padStart(2, '0');
              const month = (d.getMonth() + 1).toString().padStart(2, '0');
              const year = d.getFullYear();
              return `${day}-${month}-${year}`;
            })() : '-',
            tx.type || '-',
            tx.brand || '-',
            tx.denom + ' gr'|| '-',
            tx.count || '-',
            tx.price ? `Rp ${props.numberWithCommas?.(tx.price)}` : '-',
            tx.total_price ? `Rp ${props.numberWithCommas?.(tx.total_price)}` : '-'
          ])
        : [['-', '-', '-', '-', '-', '-', '-']],
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [11, 107, 58] }
    });

    // Penamaan file: report_rortofolio_emas_{nohp}_{tgl}_seq.pdf
    const nohp = props.user.phone ? props.user.phone.replace(/\D/g, '') : 'nohp';
    const tgl = `${tglCetak.getDate().toString().padStart(2, '0')}${(tglCetak.getMonth()+1).toString().padStart(2, '0')}${tglCetak.getFullYear()}`;
    let seq = '';
    if (window && window.localStorage) {
      const key = `pdf_seq_${tgl}`;
      let n = Number(localStorage.getItem(key) || '0') + 1;
      localStorage.setItem(key, n);
      seq = n;
    } else {
      seq = Math.floor(Math.random()*1000);
    }
    const filename = `report_insight_${nohp}_${tgl}_${seq}.pdf`;
    doc.save(filename);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.portfolio-card {
  animation: slideInLeft 0.5s ease-out;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.portfolio-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(11, 107, 58, 0.35) !important;
}

.portfolio-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  pointer-events: none;
}

.stat-card {
  position: relative;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: fadeInScale 0.5s ease-out backwards;
}

.stat-card-1 {
  animation-delay: 0.1s;
}

.stat-card-2 {
  animation-delay: 0.2s;
}

.stat-card-3 {
  animation-delay: 0.3s;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0.2;
  font-size: 32px !important;
}

.info-box {
  padding: 8px 0;
  transition: all 0.3s ease;
}

.info-box:hover {
  transform: translateX(5px);
}

.profit-box {
  padding: 20px;
  border-radius: 16px;
  opacity: 0.76;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease-out 0.2s backwards;
}

.profit-box:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 24px rgba(11, 107, 58, 0.2);
  opacity: 1;
}

.profit-amount {
  animation: pulse 2s ease-in-out infinite;
}

.profit-positive {
  color: #0B6B3A !important;
  text-shadow: 0 2px 8px rgba(11, 107, 58, 0.2);
}

.profit-negative {
  color: #d32f2f !important;
  text-shadow: 0 2px 8px rgba(211, 47, 47, 0.2);
}

.profit-icon {
  animation: bounce 1.5s ease-in-out infinite;
}

.download-btn {
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.download-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(11, 107, 58, 0.2) !important;
}

.download-btn:active:not(:disabled) {
  transform: translateY(0);
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
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

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

@media (max-width: 600px) {
  .stat-card {
    margin-bottom: 8px;
  }
}
</style>
