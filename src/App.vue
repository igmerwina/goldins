<template>
  <div class="app">
    <header class="header">
      <div class="logo">GI</div>
      <div class="brand">
        <h1>Gold Insight</h1>
        <p class="small">Post Purchase Portofolio Emas by Pegadaian</p>
      </div>
    </header>

    <transition name="fade">
      <div v-if="!hasUser" class="card" style="max-width:520px;margin-bottom:16px;">
        <h3>Input Data Nasabah</h3>
        <div class="form-row">
          <label>Nama Nasabah</label>
          <input v-model="user.name" placeholder="Nama lengkap" @input="filterName" pattern="[A-Za-z ]+" maxlength="50">
        </div>
        <div class="form-row">
          <label>No HP (angka saja)</label>
          <input v-model="user.phone" placeholder="08xxxxxxxx" @input="filterPhone" pattern="[0-9]*" maxlength="13">
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button class="btn" @click="saveUser">Lanjut</button>
        </div>
      </div>
    </transition>

    <div v-if="hasUser" class="container">
      <div>
        <!-- Summary -->
        <div class="card">
          <div class="header-row">
            <div>
              <div class="small">Halo, <strong>{{ user.name || user.phone }}</strong></div>
              <div class="note">No HP: {{ user.phone }}</div>
            </div>
            <div class="brand-pill">Portofolio</div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div class="small">Total Emas Fisik</div>
              <div style="font-weight:900;font-size:28px">{{ totalGold.toFixed(2) }} gr</div>
            </div>
            <div>
              <div class="small">Senilai</div>
              <div style="font-weight:900;font-size:28px">Rp {{ totalPorto }}</div>
            </div>
            <div style="text-align:right">
              <div class="small">Harga Hari Ini: {{ latestDate }}</div>
              <div style="font-weight:800;font-size:16px">Rp {{ latestPriceFormatted }}</div>
            </div>
          </div>

          <div style="margin-top:12px" class="stat">
            <div>
              <div class="small">Harga Rata-rata</div>
              <div style="font-weight:700">Rp {{ avgPriceFormatted }}</div>
            </div>
            <div style="text-align:right">
              <div class="small">Potensi Profit</div>
              <div style="font-weight:800;color:var(--green-700)">Rp {{ potentialProfitFormatted }}</div>
              <div class="small">({{ profitPercent }})</div>
            </div>
          </div>
        </div>

        <!-- Charts + Transactions -->
        <div class="card" style="margin-top:12px">
          <div class="header-row">
            <div>
              <div class="small">Komposisi Emas (per merk)</div>
            </div>
          </div>

          <div class="canvas-wrap" style="margin-bottom:12px">
            <canvas id="donutChart"></canvas>
          </div>

          <div style="margin-top:6px" class="small">Perubahan Harga (data resmi Pegadaian)</div>
          <div class="canvas-wrap" style="height:180px;margin-top:8px">
            <canvas id="lineChart"></canvas>
          </div>
        </div>

        <!-- Form new transaction -->
        <form class="card" @submit.prevent="addTransaction" style="margin-top:12px">
          <h3 style="margin-top:0">Tambah Transaksi</h3>
          <div class="form-row">
            <label>Tanggal</label>
            <input type="date" v-model="transaction.date" required>
          </div>
          <div class="form-row">
            <label>Jenis</label>
            <select v-model="transaction.type">
              <option value="beli">Beli</option>
              <option value="jual">Jual</option>
            </select>
          </div>
          <div class="form-row">
            <label>Merk</label>
            <select v-model="transaction.brand">
              <option value="Galeri24">Galeri24</option>
              <option value="Antam">Antam</option>
              <option value="UBS">UBS</option>
            </select>
          </div>
          <div class="form-row" style="display:flex;gap:8px">
            <div style="flex:1">
              <label>Denominasi (g)</label>
              <select v-model.number="transaction.denom">
                <option :value="0.1">0.1</option>
                <option :value="0.1">0.2</option>
                <option :value="0.5">0.5</option>
                <option :value="1">1</option>
                <option :value="2">2</option>
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="25">25</option>
              </select>
            </div>
            <div style="width:120px">
              <label>Jumlah</label>
              <input type="number" min="1" v-model.number="transaction.count">
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
            <div class="small">Total: <strong>{{ (transaction.denom * transaction.count).toFixed(2) }} g</strong></div>
            <button class="btn" type="submit">Simpan</button>
          </div>
        </form>

        <!-- Transactions list -->
        <div class="card" style="margin-top:12px">
          <div class="header-row">
            <div class="small">Riwayat Transaksi</div>
            <div class="small">{{ transactions.length }} transaksi</div>
          </div>

          <div v-if="transactions.length===0" class="empty">Tidak ada portofolio — tambahkan transaksi untuk melihat ringkasan</div>

          <div v-else>
            <div v-for="tx in transactions" :key="tx.id" class="tx-item">
              <div class="left">
                <div style="font-weight:700">{{ tx.brand }} • {{ tx.type }}</div>
                <div class="small">{{ tx.date }} — {{ tx.denom }} g × {{ tx.count }} keping</div>
              </div>
              <div style="text-align:right">
                <div style="font-weight:800">{{ (tx.denom * tx.count).toFixed(2) }} g</div>
                <div class="small" :style="{color: brandColor(tx.brand)}">{{ tx.brand }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column -->
      <aside>
        <div class="card">
          <div class="small">Ringkasan</div>
          <div style="margin-top:8px">
            <div class="small">Total Emas</div>
            <div style="font-weight:800;font-size:20px">{{ totalGold.toFixed(2) }} g</div>
          </div>
          <div style="margin-top:8px" class="small">Harga Terakhir</div>
          <div style="font-weight:700">Rp {{ latestPriceFormatted }}</div>
          <div style="margin-top:8px" class="small">Tanggal: {{ latestDate }}</div>
          <div style="margin-top:8px" class="small">API status: {{ apiStatus }}</div>
        </div>

        <div class="card" style="margin-top:12px">
          <div class="small">Aksi Cepat</div>
          <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">
            <!-- <button class="btn" @click="exportJSON">Export JSON</button> -->
            <button class="btn ghost" @click="clearAll">Hapus Semua Data</button>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend, LineController, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js';
Chart.register(DoughnutController, ArcElement, Tooltip, Legend, LineController, LineElement, PointElement, CategoryScale, LinearScale);

export default {
  setup(){
    const user = ref({ name:'', phone:'' });
    const hasUser = ref(false);
    const transaction = ref({ date:'', type:'beli', brand:'Galeri24', denom:0.1, count:1 });
    const transactions = ref([]);
    const priceHistory = ref([]);
    const latestPrice = ref(null);
    const latestDate = ref('-');
    const apiStatus = ref('idle');
    const donutChart = ref(null);
    const lineChart = ref(null);

    const BRAND_COLORS = { Galeri24:'#0b6b3a', Antam:'#c69c2f', UBS:'#6b6b6b' };

    onMounted(async ()=>{
      loadUser();
      loadLocal();
      await fetchLatestPrice();
      await fetchPriceChart();
      drawDonut();
      drawLine();
    });

    function filterPhone(){ user.value.phone = user.value.phone.replace(/[^0-9]/g,''); }
    function filterName(){ user.value.name = user.value.name.replace(/[^A-Za-z ]/g, '') };

    function saveUser(){ if(!user.value.phone){ alert('No HP wajib diisi'); return; } hasUser.value = true; localStorage.setItem('pg_user', JSON.stringify(user.value)); }
    function loadUser(){ const raw = localStorage.getItem('pg_user'); if(raw){ user.value = JSON.parse(raw); hasUser.value = true; } }

    function loadLocal(){ const raw = localStorage.getItem('pg_tx'); transactions.value = raw ? JSON.parse(raw) : []; const ph = localStorage.getItem('pg_price_history'); priceHistory.value = ph ? JSON.parse(ph) : []; }

    async function fetchLatestPrice(){
      apiStatus.value = 'loading';
      try{
        const res = await await axios.get('/api/prices/savings', { timeout: 7000 });
        // parse known structure
        if(res && res.data && res.data.data){
          const d = res.data.data;
          latestPrice.value = Number(d.hargaJual || d.hargaBeli) || null;
          latestDate.value = d.tglBerlaku || '-';
          apiStatus.value = 'ok';
        } else {
          apiStatus.value = 'no-data';
        }
      }catch(err){
        console.warn('fetchLatestPrice failed', err && err.message);
        apiStatus.value = 'failed';
      }
    }

    async function fetchPriceChart(){
      try{
        const res = await await axios.get('/api/prices/chart?interval=7&isRequest=true', { timeout: 7000 });
        if(res && res.data && res.data.data && Array.isArray(res.data.data.priceList)){
          priceHistory.value = res.data.data.priceList.map(p => ({ date: p.lastUpdate ? p.lastUpdate.split(' ')[0] : (p.lastUpdate||''), price: Number(p.hargaJual) }));
          localStorage.setItem('pg_price_history', JSON.stringify(priceHistory.value));
        } else {
            const d = res.data && res.data.data;
            if(d && Array.isArray(d.xAxis) && Array.isArray(d.yAxis)){
                if(Array.isArray(d.priceList)){
                    priceHistory.value = d.priceList.map(p => ({ date: p.lastUpdate.split(' ')[0], price: Number(p.hargaJual) }));
                    localStorage.setItem('pg_price_history', JSON.stringify(priceHistory.value));
                }
            }
        }
      }catch(err){
        console.warn('fetchPriceChart failed', err && err.message);
      }
    }

    function saveLocal(){ localStorage.setItem('pg_tx', JSON.stringify(transactions.value)); }

    function addTransaction(){
      if(!hasUser.value){ alert('Isi data nasabah terlebih dahulu'); return; }
      const tx = { ...transaction.value, id: Date.now() };
      tx.totalGram = Number(tx.denom) * Number(tx.count);
      transactions.value.unshift(tx);
      saveLocal();
      drawDonut();
      transaction.value = { date:'', type:'beli', brand:'Galeri24', denom:0.1, count:1 };
    }

    const totalGold = computed(()=> transactions.value.reduce((s,t)=> s + (Number(t.denom)*Number(t.count)), 0));

    function numberWithCommas(x){ if(x==null) return '-'; return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }

    const avgPrice = computed(()=> {
      if(transactions.value.length===0) return latestPrice.value || 0;
      const buys = transactions.value.filter(t=> t.type==='beli' && t.pricePerGram);
      if(buys.length===0) return latestPrice.value || 0;
      const totalGr = buys.reduce((s,t)=> s + t.denom * t.count, 0);
      const sum = buys.reduce((s,t)=> s + t.pricePerGram * t.denom * t.count, 0);
      return Math.round(sum/totalGr);
    });

    const avgPriceFormatted = computed(()=> numberWithCommas(Math.round(avgPrice.value)));
    const latestPriceFormatted = computed(()=> numberWithCommas(latestPrice.value || (priceHistory.value.length? priceHistory.value[priceHistory.value.length-1].price : '-')));
    const totalPorto = computed(()=> numberWithCommas(latestPrice.value * totalGold.value * 100))
    const potentialProfit = computed(()=> Math.round(((latestPrice.value) - (avgPrice.value)) * totalGold.value));
    const potentialProfitFormatted = computed(()=> numberWithCommas(potentialProfit.value));
    const profitPercent = computed(()=> { const avg = avgPrice.value||1; const p = Math.round(((latestPrice.value||0) - avg)/avg * 100); return p + '%'; });

    function drawDonut(){
      const ctx = document.getElementById('donutChart');
      if(!ctx) return;
      const groups = {};
      transactions.value.forEach(t => { const b = t.brand || 'Other'; groups[b] = (groups[b]||0) + (Number(t.denom) * Number(t.count)); });
      const labels = Object.keys(groups);
      const data = labels.map(l=>groups[l]);
      const colors = labels.map(l => BRAND_COLORS[l] || '#999');
      if(labels.length===0){
        if(donutChart.value){
          donutChart.value.data.labels = ['No Data'];
          donutChart.value.data.datasets[0].data = [1];
          donutChart.value.data.datasets[0].backgroundColor = ['#e6f6ec'];
          donutChart.value.update();
          return;
        }
        donutChart.value = new Chart(ctx, {
          type: 'doughnut',
          data: { labels: ['No Data'], datasets: [{ data: [1], backgroundColor: ['#e6f6ec'] }] },
          options:{ plugins:{ legend:{ display:false } } }
        });
        return;
      }

    if(donutChart.value){
        donutChart.value.data.labels = labels;
        donutChart.value.data.datasets[0].data = data;
        donutChart.value.data.datasets[0].backgroundColor = colors;
        donutChart.value.update();
        return;
      }
      donutChart.value = new Chart(ctx, {
        type: 'doughnut',
        data: { labels, datasets: [{ data, backgroundColor: colors }] },
        options: { plugins:{ legend:{ position: 'right' } } }
      });
    }

    function drawLine(){
      const ctx = document.getElementById('lineChart');
      if(!ctx) return;
      const labels = priceHistory.value.map(p => p.date);
      const data = priceHistory.value.map(p => p.price);
      if(data.length===0){
        if(lineChart.value){
          lineChart.value.data.labels = ['-'];
          lineChart.value.data.datasets[0].data = [0];
          lineChart.value.update();
          return;
        }
        lineChart.value = new Chart(ctx, {
          type: 'line',
          data: { labels: ['-'], datasets:[{ label:'Harga', data:[0], borderColor:'#cfe9d9' }] },
          options:{ plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true } } }
        });
        return;
      }

      if(lineChart.value){
        lineChart.value.data.labels = labels;
        lineChart.value.data.datasets[0].data = data;
        lineChart.value.update();
        return;
      }

      lineChart.value = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets:[{ label:'Harga Jual /gram', data, borderColor:'#1aa251', tension:0.25, pointRadius:3 }] },
        options:{ plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:false } } }
      });
    }

    function exportJSON(){ const payload = { user: user.value, transactions: transactions.value, priceHistory: priceHistory.value }; const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'pegadaian-data.json'; a.click(); URL.revokeObjectURL(url); }

    function importJSON(e){ const file = e.target.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = ()=>{ try{ const data = JSON.parse(reader.result); if(Array.isArray(data.transactions)) transactions.value = data.transactions; if(Array.isArray(data.priceHistory)) priceHistory.value = data.priceHistory; if(data.user){ user.value = data.user; hasUser.value = true; localStorage.setItem('pg_user', JSON.stringify(user.value)); } saveLocal(); localStorage.setItem('pg_price_history', JSON.stringify(priceHistory.value)); drawDonut(); drawLine(); }catch(err){ alert('File JSON tidak valid'); } }; reader.readAsText(file); }

    function autoDownloadJSON(){ const payload = { user: user.value, transactions: transactions.value, priceHistory: priceHistory.value }; const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'data.json'; a.click(); URL.revokeObjectURL(url); }

    function clearAll(){ if(!confirm('Hapus semua data?')) return; transactions.value = []; priceHistory.value = []; saveLocal(); localStorage.removeItem('pg_price_history'); drawDonut(); drawLine(); }

    function saveLocal(){ localStorage.setItem('pg_tx', JSON.stringify(transactions.value)); }

    function brandColor(b){ return BRAND_COLORS[b] || '#999'; }

    return {
      user, hasUser, saveUser, filterPhone, filterName, transaction, transactions, addTransaction,
      totalGold, avgPriceFormatted, latestPriceFormatted, latestDate, totalPorto, potentialProfitFormatted, profitPercent,
      exportJSON, importJSON, clearAll, brandColor, apiStatus
    };
  }
}
</script>

<style scoped></style>
