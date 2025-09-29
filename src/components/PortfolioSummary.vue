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
            <div class="text-caption text-medium-emphasis">Rata-rata Harga Jual <br/>{{ latestDate }}</div>
            <div class="text-subtitle-1 font-weight-bold">Rp {{ latestPriceFormatted }}</div>
        </v-col>
      </v-row>
      <v-divider class="my-3"></v-divider>
      <v-row justify="space-between">
        <v-col cols="6" class="py-1">
          <div class="text-caption text-medium-emphasis">Rata-rata Harga Beli /gram</div>
          <div class="text-subtitle-1 font-weight-bold">Rp {{ avgPriceFormatted }}</div>
        </v-col>
        <v-col cols="6" class="text-right py-1">
          <div class="text-caption text-medium-emphasis">Potensi Profit</div>
          <div :class="['text-h6 font-weight-black', potentialProfit >= 0 ? 'text-success' : 'text-error']">
            Rp {{ potentialProfitFormatted }}
          </div>
          <div class="text-caption text-medium-emphasis">({{ profitPercent }})</div>
          <v-btn color="primary" variant="tonal" class="mt-2 generate-report-btn" @click="generateReport">
            <v-icon start>mdi-file-pdf-box</v-icon>
            Generate Report
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

async function generateReport() {
  const doc = new jsPDF();
  // Title
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Laporan Portofolio Emas', 14, 16);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(11);
  doc.text(`Nama: ${props.user.name || '-'}`, 14, 24);
  doc.text(`No HP: ${props.user.phone || '-'}`, 14, 30);
  const tglCetak = new Date();
  const bulan = tglCetak.toLocaleString('id-ID', { month: 'long' });
  const tglStr = `${tglCetak.getDate()} ${bulan} ${tglCetak.getFullYear()}`;
  doc.text(`Tanggal Cetak: ${tglStr}`, 14, 36);

  // Section 1: Portofolio Summary
  doc.setFontSize(13);
  doc.text('Ringkasan Portofolio', 14, 48);
  autoTable(doc, {
    startY: 52,
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
  doc.setFontSize(13);
  doc.text('Komposisi Emas', 14, y);
  y += 4;
  // Ambil canvas donut chart
  const donutCanvas = document.getElementById('donutChart');
  if (donutCanvas) {
    const chartImg = await html2canvas(donutCanvas).then(canvas => canvas.toDataURL('image/png'));
    doc.addImage(chartImg, 'PNG', 14, y, 80, 50);
    y += 54;
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

  doc.save('Laporan_Portofolio_Emas.pdf');
}
</script>
