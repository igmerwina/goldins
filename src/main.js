import { createApp } from 'vue'
import App from './App.vue'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css' // Import MDI icons

// 1. Define the custom Pegadaian theme
const pegadaianTheme = {
  dark: false,
  colors: {
    background: '#F0F0F0', // Light gray background
    surface: '#FFFFFF',
    primary: '#0B6B3A', // Pegadaian Green
    'primary-darken-1': '#00582D',
    secondary: '#C69C2F', // Gold/Yellow
    'secondary-darken-1': '#A38127',
    error: '#B00020',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
  },
}

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'pegadaianTheme',
    themes: {
      pegadaianTheme,
    },
  },
  icons: {
    defaultSet: 'mdi',
  },
})

createApp(App).use(vuetify).mount('#app')