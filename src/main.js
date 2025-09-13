import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import './assets/css/global.css'
import '@fortawesome/fontawesome-free/css/all.min.css' 
import lottie from "lottie-web"
import { defineElement } from "@lordicon/element"



// define "lord-icon" custom element with default properties
defineElement(lottie.loadAnimation);

createApp(App).use(router).mount('#app')

