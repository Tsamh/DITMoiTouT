<template>
  <div>
    <div class="login-form" :class="{ active: isLoginActive }" ref="loginForm">
<div class="register-card">
      <h2>Créer un compte</h2>
      <form @submit.prevent="register">
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Mot de passe" required />
        <button type="submit">S'inscrire</button>
      </form>
      <router-link to="/connexion" class="login-link">
        Déjà un compte ? <strong>Se connecter</strong>
      </router-link>
    </div>    </div>
    <div class="signup-form" :class="{ active: !isLoginActive }" ref="signupForm">
      <!-- Contenu du formulaire d'inscription -->
       <div class="login-card">
      <h2>Connexion</h2>
      <form @submit.prevent="login">

        <div class="input-group">
          <lord-icon
            src="https://cdn.lordicon.com/rhvddzym.json"
            trigger="hover"
            style="width:24px;height:24px">
          </lord-icon>
          <input v-model="email" type="email" placeholder="Adresse Email" required />
        </div>

        <div class="input-group">
          <lord-icon
    src="https://cdn.lordicon.com/maltvyiw.json"
    trigger="hover"
    stroke="light"
    style="width:24px;height:24px">
</lord-icon>
          <input v-model="password" type="password" placeholder="Mot de passe" required />
        </div>

        <button type="submit">Se connecter</button>
      </form>

      <router-link to="/register">Pas encore de compte ? Créez-en un</router-link>
    </div>
    </div>
    <div class="back-layer" ref="backLayer"></div>
    <button class="login" @click="showLoginForm">Login</button>
    <button class="signup" @click="showSignupForm">Sign Up</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isLoginActive: true
    };
  },
  methods: {
    showSignupForm() {
      this.isLoginActive = false;
      this.$refs.loginForm.classList.remove("active");
      this.$refs.signupForm.classList.add("active");
      this.$refs.backLayer.style.clipPath = "inset(0 0 0 50%)";
    },
    showLoginForm() {
      this.isLoginActive = true;
      this.$refs.signupForm.classList.remove("active");
      this.$refs.loginForm.classList.add("active");
      this.$refs.backLayer.style.clipPath = "";
    }
  }
};
</script>

