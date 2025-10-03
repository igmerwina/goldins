<template>
  <v-card class="mb-4 elevation-4" rounded="lg">
    <v-card-title class="text-h6 d-flex justify-space-between align-center py-3">
      <div>
        <div class="text-caption text-medium-emphasis">Halo, <strong>{{ user.name || user.phone }}</strong></div>
        <div class="text-subtitle-1 font-weight-bold">Portofolio Emas</div>
      </div>
      <v-chip color="secondary" label>No HP: {{ user.phone }}</v-chip>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-row align="center" justify="space-between" class="mb-4">
        <v-col cols="12" sm="4" class="py-1">
          <div class="text-caption text-medium-emphasis">Total Emas Fisik</div>
          <div class="text-h4 font-weight-black text-primary">{{ totalGold.toFixed(2) }} gr</div>
        </v-col>
        <v-col cols="12" sm="5" class="py-1">
          <div class="text-caption text-medium-emphasis">Senilai Nominal</div>
          <div class="text-h5 font-weight-black text-secondary">Rp {{ totalPorto }}</div>
        </v-col>
        <v-col cols="12" sm="3" class="text-sm-right py-1">
            <div class="text-caption text-medium-emphasis">Rata-rata harga jual(per gram)<br/>{{ latestDate }}</div>
            <div class="text-subtitle-1 font-weight-bold">Rp {{ latestPriceFormatted }}</div>
        </v-col>
      </v-row>
      <v-divider class="my-3"></v-divider>
      <v-row justify="space-between">
        <v-col cols="6" class="py-1">
          <div class="text-caption text-medium-emphasis">Total Emas yang dibeli</div>
          <div class="text-subtitle-1 font-weight-bold">Rp {{ totalEmasDibeliFormatted }}</div>
          <div class="text-caption text-medium-emphasis">Rata-rata harga beli(per gram)</div>
          <div class="text-subtitle-1 font-weight-bold">Rp {{ avgHargaBeliFormatted }}</div>
        </v-col>
        <v-col cols="6" class="text-right py-1">
          <div class="text-caption text-medium-emphasis">Potensi Profit</div>
          <div :class="['text-h6 font-weight-black', potentialProfit >= 0 ? 'text-success' : 'text-error']">
            Rp {{ potentialProfitFormatted }}
          </div>
          <div class="text-caption text-medium-emphasis">({{ profitPercent }})</div>
          <v-btn color="primary" variant="tonal" class="mt-2" @click="generateReport" :disabled="isLoading">
            <v-icon start>mdi-file-pdf-box</v-icon>
            <v-progress-circular
              v-if="isLoading"
              indeterminate
              color="white"
              size="18"
              class="mr-2"
            />
            <span v-if="!isLoading">Download Report</span>
            <span v-else>Mengunduh...</span>
          </v-btn>
        </v-col>
      </v-row>
      <!-- Komposisi Emas sekarang benar-benar di dalam section portofolio emas -->
      <GoldComposition
        :donutBrands="donutBrands"
        :donutData="donutData"
        :numberWithCommas="numberWithCommas"
      />
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

// Hitung total pembelian emas (sum total_price dari transaksi 'beli')
const totalEmasDibeli = computed(() => {
  if (!props.transactions || !props.transactions.length) return 0;
  return props.transactions
    .filter(tx => tx.type === 'beli')
    .reduce((sum, tx) => sum + (Number(tx.total_price) || 0), 0);
});

// Format totalEmasDibeli ke rupiah
const totalEmasDibeliFormatted = computed(() => {
  return props.numberWithCommas ? props.numberWithCommas(totalEmasDibeli.value) : totalEmasDibeli.value.toLocaleString('id-ID');
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
    doc.text(`Nama: ${props.user.name || '-'}`, 14, 23); 
    doc.text(`No HP: ${props.user.phone || '-'}`, 14, 28);
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
    doc.text('Ringkasan Portofolio', 14, 36); // lebih rapat
    // Tambahkan info harga jual per di bawah Ringkasan Portofolio
    doc.setFontSize(9);
    doc.text(`Dihitung berdasarkan harga jual per: ${tglHargaJualStr}`, 14, 41);
    doc.setFontSize(13);
    autoTable(doc, {
      startY: 43,
      head: [['Total Emas', 'Senilai', 'Rata-rata Harga Jual', 'Rata-rata Harga Beli', 'Potensi Profit']],
      body: [[
        props.totalGold?.toFixed(2) + ' gr' || '-',
        'Rp ' + props.totalPorto || '-',
        'Rp ' + props.latestPriceFormatted || '-',
        'Rp ' + props.avgPriceFormatted || '-',
        `${props.potentialProfitFormatted || '-'} (${props.profitPercent || '-'})`
      ]],
      theme: 'grid',
      styles: { fontSize: 10 }
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
      styles: { fontSize: 10 }
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
      head: [['Tanggal', 'Jenis', 'Brand', 'Denom (gr)', 'Jumlah', 'Harga/gram', 'Total (Rp)']],
      body: txs.length
        ? txs.map(tx => [
            tx.date || '-',
            tx.type || '-',
            tx.brand || '-',
            tx.denom || '-',
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
