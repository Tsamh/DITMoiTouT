<template>
  <nav class="navbar">
            <router-link to="/" class="logo"><img class="BBB" src="../assets/images/logo_DITMoiTout.png" alt=""></router-link>
            <div class="navlinks">
                <ul class="menu">
                    <li><router-link to="/" class="menu-items" >Accueil</router-link></li>
                
                    <li><router-link to="/revision" class="menu-items">Révision ▼</router-link>
                        <ul class="submenu">
                          <li class="liste-ventes"><router-link to="ressources">Ressources ▼</router-link>
                            <ul class="subsubmenu">
                              <li><a href="#">L1</a></li>
                              <li><a href="#">L2</a></li>
                              <li><a href="#">L3</a></li>
                            </ul>
                          </li>
                        </ul>
                    </li>
                    <li><router-link to="/amuser" class="menu-items">Récréation</router-link></li>
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
            <!-- icone qui apparait quand on est sur petit ecran -->
            <img src="../assets/images/icones/menu-btn.png" alt="icone-du-menu" class="icone-menu">
        </nav>
</template>

<script setup>
//gerer l'affichage apres connexion
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { utilisateurConnecte, fermerSession } from '@/utils/session';

const showMenu = ref(false);
const router = useRouter();

function toggleMenu() {
  showMenu.value = !showMenu.value;
}

function logout() {
  fermerSession();
  showMenu.value = false;
  router.push('/');
}


</script>

<script>
export default {
  data() {
    return { menuOpen: false };
  },
  methods: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    }
  }
};
</script>
<style src="../assets/css/navbar.css"></style>

