import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Revision from '../views/Revision.vue'
import loginPage from '../views/loginPage.vue'
import registerPage from '../views/registerPage.vue'
import Ressources from '../views/Ressources.vue'
import Professeurs from '../views/Professeurs.vue'
import Play from '../views/Play.vue'
import RegisterLogin from '../views/RegisterLogin.vue'
import { attendreSortie } from './transition-gate'


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
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  async scrollBehavior(to, from, savedPosition) {
    // savedPosition n'est renseigné que sur précédent et suivant : on restaure
    // alors exactement ce que l'utilisateur avait sous les yeux.
    const cible = savedPosition ?? (to.hash ? { el: to.hash } : { top: 0 })

    // Premier chargement : aucune transition de sortie ne va se produire,
    // attendre bloquerait le défilement pendant la durée de sécurité.
    if (from.matched.length === 0) return cible

    // Note : App.vue indexe la transition sur route.path. Un router-link qui
    // ne changerait que le hash sur le même chemin ne redéclencherait donc pas
    // la sortie, et cette attente ne se résoudrait que par sa sécurité de
    // 600 ms. Aucun lien du site n'est dans ce cas aujourd'hui : les ancres de
    // la page Professeurs sont des <a href="#l1"> natifs, qui ne passent pas
    // par le routeur.
    await attendreSortie()
    return cible
  },
})

export default router
