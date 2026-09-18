<template>
  <nav class="navbar">
            <router-link to="/" class="logo"><img class="BBB" src="../assets/images/logo_DITMoiTout.png" alt=""></router-link>
            <div class="navlinks" id="menu-principal" :class="{ 'mobile-menu': menuOuvert }">
                <ul class="menu">
                    <li><router-link to="/" class="menu-items" >Accueil</router-link></li>
                
                    <li><router-link to="/revision" class="menu-items">Révision</router-link></li>

                    <li><router-link to="/ressources" class="menu-items">Ressources ▼</router-link>
                        <ul class="submenu">
                          <li><a href="#">L1</a></li>
                          <li><a href="#">L2</a></li>
                          <li><a href="#">L3</a></li>
                        </ul>
                    </li>

                    <!-- Onglet Récréation volontairement masqué : la route /amuser existe toujours
                         et reste atteignable par son adresse, mais le lien n'est ni visible ni
                         cliquable, car display: none le retire aussi du parcours au clavier. -->
                    <li class="onglet-masque"><router-link to="/amuser" class="menu-items">Récréation</router-link></li>
                    <li><router-link to="/professeurs" class="menu-items">Les professeurs </router-link>
                        <!-- <ul class="submenu">
                        <li><a href="#l1">L1</a></li>
                        <li><a href="#l2">L2</a></li>
                        <li><a href="#l3">L3</a></li>
                        </ul> -->
                    </li>
                    <!-- Si utilisateur connecté -->
                    <li v-if="utilisateurConnecte" class="dropdown">
                      <div @click="toggleMenu" class="user-btn">
                        <lord-icon
                          src="https://cdn.lordicon.com/gubjuhss.json"
                          trigger="hover"
                          stroke="light"
                          colors="primary:#121331,secondary:#3080e8,tertiary:#d59f80,quaternary:#b26836"
                          style="width:20px;height:20px">
                        </lord-icon> {{ utilisateurConnecte.email }}
                      </div>

                      <ul v-if="showMenu" class="dropdown-menu">
                        <!-- <li><router-link to="/profil">Mon profil</router-link></li> -->
                        <li><a href="#" @click="logout">Se déconnecter</a></li>
                      </ul>
                    </li>

                     <!-- Si pas connecté -->
                    <!-- <li v-else class="button"><router-link to="/connexion" class="menu-items">Se connecter</router-link></li> -->
                    <li v-else class="button"><router-link to="/connexion" class="menu-items">Se connecter</router-link></li>
                </ul>
            </div>
            <!-- Bouton du menu, visible seulement sous 738px.
                 Trois barres en CSS plutôt qu'une image : net à toute densité d'écran,
                 et elles se croisent à l'ouverture pour montrer l'état du menu. -->
            <button
              type="button"
              class="icone-menu"
              :class="{ ouvert: menuOuvert }"
              :aria-expanded="menuOuvert ? 'true' : 'false'"
              aria-controls="menu-principal"
              :aria-label="menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'"
              @click.stop="basculerMenu"
            >
              <span class="barre"></span>
              <span class="barre"></span>
              <span class="barre"></span>
            </button>
        </nav>
</template>

<script setup>
//gerer l'affichage apres connexion
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { utilisateurConnecte, fermerSession } from '@/utils/session';

const showMenu = ref(false);
const menuOuvert = ref(false);
const router = useRouter();
const route = useRoute();

function toggleMenu() {
  showMenu.value = !showMenu.value;
}

function logout() {
  fermerSession();
  showMenu.value = false;
  menuOuvert.value = false;
  router.push('/');
}

function basculerMenu() {
  menuOuvert.value = !menuOuvert.value;
}

function fermerMenu() {
  menuOuvert.value = false;
}

// Le panneau couvre tout l'écran : sans cela on navigue et il reste ouvert
// par-dessus la nouvelle page.
watch(() => route.path, fermerMenu);

// Le panneau se ferme aussi au clic en dehors et à la touche Échap, les deux
// gestes qu'un visiteur tente spontanément pour sortir d'un menu plein écran.
function surClicDocument(evenement) {
  if (!menuOuvert.value) return;
  if (evenement.target.closest('.navlinks, .icone-menu')) return;
  fermerMenu();
}

function surToucheDocument(evenement) {
  if (evenement.key === 'Escape') fermerMenu();
}

// Le défilement de la page derrière le panneau est bloqué tant qu'il est ouvert.
watch(menuOuvert, (ouvert) => {
  document.body.classList.toggle('menu-mobile-ouvert', ouvert);
});

onMounted(() => {
  document.addEventListener('click', surClicDocument);
  document.addEventListener('keydown', surToucheDocument);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', surClicDocument);
  document.removeEventListener('keydown', surToucheDocument);
  document.body.classList.remove('menu-mobile-ouvert');
});
</script>

<style src="../assets/css/navbar.css"></style>

