import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Quasar, Notify, Dialog, Loading } from 'quasar';

// Import Quasar icon libraries & css
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';

import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.use(Quasar, {
  plugins: {
    Notify,
    Dialog,
    Loading,
  },
  config: {
    notify: {
      position: 'top-right',
      timeout: 3500,
      textColor: 'white',
      actions: [{ icon: 'close', color: 'white' }],
    },
  },
});

app.mount('#app');

