<template>
  <v-app>
    <v-app-bar app color="primary" flat>
      <v-container class="d-flex align-center">
        <v-icon size="32" class="mr-2" color="secondary">mdi-treasure-chest</v-icon>
        <v-toolbar-title class="white--text">
          <span class="font-weight-bold text-h6">Gold Insight</span>
          <p class="text-caption mt-n1 hidden-sm-and-down">Post Purchase Portofolio Emas by Pegadaian</p>
        </v-toolbar-title>
      </v-container>
      
      <v-spacer></v-spacer>
      
      <v-btn v-if="hasUser" color="secondary" variant="flat" class="mr-2" @click="logout" prepend-icon="mdi-logout">
        Logout
      </v-btn>
    </v-app-bar>

    <v-main class="bg-background">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" sm="10" md="8" lg="6">
            <v-card v-if="!hasUser" class="pa-4 pa-sm-6 elevation-8" rounded="lg">
              <v-card-title class="text-h5 font-weight-bold mb-4">Input Data Nasabah</v-card-title>
              <v-text-field
                v-model="user.name"
                label="Nama Nasabah"
                placeholder="Nama lengkap"
                :rules="[v => !!v || 'Nama wajib diisi']"
                :maxlength="50"
                clearable
                prepend-inner-icon="mdi-account"
                variant="outlined"
              ></v-text-field>
              
              <v-text-field
                v-model="user.phone"
                label="No HP (angka saja)"
                placeholder="08xxxxxxxx"
                :rules="[v => !!v || 'No HP wajib diisi', v => /^\d*$/.test(v) || 'Hanya angka yang diizinkan']"
                :maxlength="13"
                clearable
                prepend-inner-icon="mdi-phone"
                variant="outlined"
                @input="filterPhone"
              ></v-text-field>
              
              <v-card-actions class="justify-end px-0">
                <v-btn color="primary" size="large" @click="saveUser" :disabled="!user.name || !user.phone" block>
                  Lanjut ke Dashboard
                </v-btn>
              </v-card-actions>
            </v-card>
            
            <Dashboard v-else :user="user" />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Dashboard from './components/Dashboard.vue';

const user = ref({ name: '', phone: '' });
const hasUser = ref(false);

onMounted(() => {
  loadUser();
});

function filterPhone() {
  user.value.phone = user.value.phone.replace(/[^0-9]/g, '');
}

function saveUser() {
  if (!user.value.name || !user.value.phone) return;
  hasUser.value = true;
  localStorage.setItem('pg_user', JSON.stringify(user.value));
}

function loadUser() {
  const raw = localStorage.getItem('pg_user');
  if (raw) {
    user.value = JSON.parse(raw);
    hasUser.value = true;
  }
}

function logout() {
  if (!confirm('Anda yakin ingin keluar? Semua data transaksi akan tetap tersimpan.')) return;
  localStorage.removeItem('pg_user');
  user.value = { name: '', phone: '' };
  hasUser.value = false;
}
</script>

<style scoped>
/* No scoped styles needed as Vuetify handles most styling */
</style>