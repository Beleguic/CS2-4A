import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css';
import App from './App.vue';
import router from './router/index.ts';
import VueToast from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-bootstrap.css';

createApp(App)
  .use(createPinia())
  .use(router)
  .use(VueToast,
    {
      position: 'bottom-left',
      duration: '5000'
    }
  )
  .mount('#app');
