import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import './assets/css/global.css'
import './assets/css/motion.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import lottie from "lottie-web"
import { defineElement } from "@lordicon/element"
import { reveal } from './directives/reveal'
import { purgerAncienStockage } from './utils/password'

// define "lord-icon" custom element with default properties
defineElement(lottie.loadAnimation);

// Efface les mots de passe en clair laisses par la version precedente du site.
// Les anciens comptes sont supprimes plutot que migres : migrer aurait exige de relire ces mots de passe en clair.
purgerAncienStockage()

createApp(App)
  .use(router)
  .directive('reveal', reveal)
  .mount('#app')

