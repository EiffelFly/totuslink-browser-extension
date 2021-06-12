import { createApp } from 'vue'
import Popup from './Popup.vue'
import store from '../store'
import '../assets/tailwind.css'
import router from '../router'


const app = createApp(Popup);
app.use(store).use(router).mount('#app');