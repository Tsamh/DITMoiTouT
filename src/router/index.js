import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Revision from '../views/Revision.vue'
import loginPage from '../views/loginPage.vue'
import registerPage from '../views/registerPage.vue'
import Ressources from '../views/Ressources.vue'
import Professeurs from '../views/Professeurs.vue'
import Play from '../views/Play.vue'
import RegisterLogin from '../views/RegisterLogin.vue'


const routes = [
  { path: '/', component: Home },
  { path: '/revision', component: Revision },
  { path: '/ressources', component: Ressources },
  { path: '/professeurs', component: Professeurs },
  { path: '/register_login', component: RegisterLogin },
  { path: '/connexion', component: loginPage },
  { path: '/amuser', component: Play },
  { path: '/register', component: registerPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
