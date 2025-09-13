<template>
  <div class="register-page">
    <div class="register-card">
      <h2>Créer un compte</h2>
      <form @submit.prevent="register">
        <input v-model="name" type="text" placeholder="Entrez votre nom complet" required />
        <input v-model="classe" type="text" placeholder="Entrez votre classe" required />
        <input v-model="email" type="email" placeholder="Entrez votre Email" required />
        <input v-model="password" type="password" placeholder="Créez un mot de passe" required />
        <button type="submit">S'inscrire</button>
      </form>
      <router-link to="/connexion" class="login-link">
        Déjà un compte ? <strong>Se connecter</strong>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: '',
      classe: '',
      email: '',
      password: '',
    };
  },
  methods: {
    register() {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const exists = users.find(user => user.email === this.email);

      if (exists) {
        alert("Cet utilisateur existe déjà.");
        return;
      }

      users.push({ email: this.email, password: this.password });
      localStorage.setItem('users', JSON.stringify(users));

      alert("Compte créé avec succès !");
      this.$router.push('/connexion');
    },
  },
};
</script>

<style scoped src="../assets/css/registerPage.css">
</style>
