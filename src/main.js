import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import './assets/css/global.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { purgerAncienStockage } from './utils/password'
import lottie from "lottie-web"
import { defineElement } from "@lordicon/element"



// define "lord-icon" custom element with default properties
defineElement(lottie.loadAnimation);

// Efface les mots de passe en clair laisses par la version precedente du site.
purgerAncienStockage()

createApp(App).use(router).mount('#app')

