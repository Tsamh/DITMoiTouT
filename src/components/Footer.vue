<template>
  <footer class="footer">
    <div class="container">
      <!-- Colonne 1 -->
      <div class="col1">
        <RouterLink to="/" class="logo">
          <img class="BBB" :src="logoUrl" alt="logo" />
        </RouterLink>
        <ul class="media-icons">
          <li><a href="https://www.youtube.com/@DITSenegal"><i class="fa-brands fa-youtube"></i></a></li>
          <li><a href="https://www.instagram.com/ditdakar?igsh=MWx6cjk3bTN6MW03eQ=="><i class="fa-brands fa-instagram"></i></a></li>
          <li><a href="https://x.com/DITSenegal?t=Waj8sGkLaoezfnxYPNtfZg&s=09"><i class="fa-brands fa-twitter"></i></a></li>
          <li><a href="https://www.facebook.com/share/1F1kEupDxK/"><i class="fa-brands fa-facebook"></i></a></li>
          <li><a href="https://www.tiktok.com/@ditdakar?_t=ZM-8yfDRY63bQG&_r=1"><i class="fa-brands fa-tiktok"></i></a></li>
          <li><a href="#"><i class="fa-brands fa-linkedin"></i></a></li>
          <li><a href="https://discord.com/invite/K9MHYABb"><i class="fa-brands fa-discord"></i></a></li>
          <li><a href="https://github.com/Tsamh"><i class="fa-brands fa-github"></i></a></li>
          <li><a href="#"><i class="fa-brands fa-snapchat"></i></a></li>
          <li><a href="#"><i class="fa-brands fa-whatsapp"></i></a></li>
        </ul>
      </div>

      <!-- Colonne 2 -->
      <div class="col2">
        <ul class="menu">
          <li><a href="#">Adresse</a>
            <ul>
              <br />
              <li>Dakar-Sénégal</li>
              <li>Immeuble 46 – Cité Keur Gorgui</li>
            </ul>
          </li>
          <li><a href="#">Coordonnées</a>
            <ul>
              <br />
              <li>Tel1 : [numero retire]</li>
              <li>Tel2 : [numero retire]</li>
              <li>Fixe : [numero retire]</li>
            </ul>
          </li>
        </ul>
      </div>

      <!-- Colonne 3 -->
      <div class="col3">
        <p>Abonnez-vous à notre messagerie !</p>
        <form @submit.prevent>
          <div class="input-wrap">
            <input type="email" placeholder="exemple@gmail.com" />
            <button type="submit"><i class="fa-solid fa-paper-plane"></i></button>
          </div>
        </form>
        <ul class="services-icons">
          <li><a href="#"><i class="fa-brands fa-cc-paypal"></i></a></li>
          <li><a href="#"><i class="fa-brands fa-cc-apple-pay"></i></a></li>
          <li><a href="#"><i class="fa-brands fa-google-pay"></i></a></li>
        </ul>
      </div>
    </div>

    <!-- Bas de page -->
    <div class="footer-bottom">
      <div>
        <p>DITMoiTout © 2025 - Tous droits réservés</p>
        <p>Privacy Policy | Terms & Conditions</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import logoUrl from '@/assets/images/logo_DITMoiTout.png'
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

<style src="../assets/css/footer.css"></style>
