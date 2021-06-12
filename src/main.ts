import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import './assets/tailwind.css'
import router from './router'


const app = createApp(App).use(router);
app.use(store).mount('#app');


