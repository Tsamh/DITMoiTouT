<template>
  <footer class="footer">
    <div class="container">
      <!-- Identite et reseaux -->
      <div class="col col-marque">
        <RouterLink to="/" class="logo">
          <img class="BBB" :src="logoUrl" alt="DITMoiTout" />
        </RouterLink>
        <p class="accroche">
          Vos cours, vos révisions et vos professeurs, rassemblés au même endroit.
        </p>
        <ul class="media-icons">
          <li><a href="https://www.youtube.com/@DITSenegal" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a></li>
          <li><a href="https://www.instagram.com/ditdakar" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a></li>
          <li><a href="https://x.com/DITSenegal" aria-label="X"><i class="fa-brands fa-twitter"></i></a></li>
          <li><a href="https://www.facebook.com/share/1F1kEupDxK/" aria-label="Facebook"><i class="fa-brands fa-facebook"></i></a></li>
          <li><a href="https://www.tiktok.com/@ditdakar" aria-label="TikTok"><i class="fa-brands fa-tiktok"></i></a></li>
          <li><a href="https://www.linkedin.com/in/samba-hama-traore-925309351" aria-label="LinkedIn"><i class="fa-brands fa-linkedin"></i></a></li>
          <li><a href="https://discord.com/invite/K9MHYABb" aria-label="Discord"><i class="fa-brands fa-discord"></i></a></li>
          <li><a href="https://github.com/Tsamh" aria-label="GitHub"><i class="fa-brands fa-github"></i></a></li>
        </ul>
      </div>

      <!-- Navigation -->
      <nav class="col col-liens" aria-label="Navigation du pied de page">
        <h2>Navigation</h2>
        <ul>
          <li><RouterLink to="/">Accueil</RouterLink></li>
          <li><RouterLink to="/ressources">Ressources</RouterLink></li>
          <li><RouterLink to="/revision">Révision</RouterLink></li>
          <li><RouterLink to="/professeurs">Les professeurs</RouterLink></li>
        </ul>
      </nav>

      <!-- Adresse -->
      <div class="col col-ecole">
        <h2>Nous trouver</h2>
        <address>
          Immeuble 46, Cité Keur Gorgui<br />
          Dakar, Sénégal
        </address>
      </div>

      <!-- Lettre d'information -->
      <div class="col col-lettre">
        <h2>Rester informé</h2>
        <p>Les nouveaux supports et les dates d'examens, directement par courriel.</p>
        <form class="input-wrap" @submit.prevent="sabonner">
          <label class="visuellement-cache" for="courriel">Adresse électronique</label>
          <input id="courriel" v-model="courriel" type="email" placeholder="vous@exemple.com" required />
          <button type="submit" aria-label="S'abonner"><i class="fa-solid fa-paper-plane"></i></button>
        </form>
        <p v-if="message" class="message-lettre" role="status">{{ message }}</p>
      </div>
    </div>

    <div class="footer-bottom">
      <p>DITMoiTout &copy; {{ annee }}. Tous droits réservés.</p>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import logoUrl from '@/assets/images/logo_DITMoiTout.png'

const annee = new Date().getFullYear()
const courriel = ref('')
const message = ref('')

// Le site est statique, sans service d'envoi derriere : le formulaire le dit
// franchement plutot que de faire semblant d'avoir enregistre une inscription.
function sabonner() {
  message.value = "L'inscription à la lettre d'information n'est pas encore en service."
  courriel.value = ''
}
</script>

<style src="../assets/css/footer.css"></style>
