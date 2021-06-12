import { createRouter, createWebHistory } from 'vue-router'
import Popup from '../popup/Popup.vue'

const routes = [
  {
    path: '/',
    name: 'Popup',
    component: Popup
  },
]

const router = createRouter({
  base: "./popup.html",
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
