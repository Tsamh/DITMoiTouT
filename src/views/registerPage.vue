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

      <p v-if="erreur" class="message-erreur" role="alert">{{ erreur }}</p>
      <router-link to="/connexion" class="login-link">
        Déjà un compte ? <strong>Se connecter</strong>
      </router-link>
    </div>
  </div>
</template>

<script>
import { calculerEmpreinte, ecrireUtilisateurs, genererSel, lireUtilisateurs } from '@/utils/password'

export default {
  data() {
    return {
      name: '',
      classe: '',
      email: '',
      password: '',
      erreur: '',
    }
  },
  methods: {
    async register() {
      this.erreur = ''

      const utilisateurs = lireUtilisateurs()
      if (utilisateurs.some((u) => u.email === this.email)) {
        this.erreur = 'Cet utilisateur existe déjà.'
        return
      }

      // Le mot de passe lui-même n'est jamais écrit : seule son empreinte l'est.
      const sel = genererSel()
      let empreinte
      try {
        empreinte = await calculerEmpreinte(sel, this.password)
      } catch {
        // crypto.subtle est absent hors contexte sécurisé (HTTPS ou localhost).
        this.erreur = 'Inscription impossible : cette page doit être servie en HTTPS ou depuis localhost.'
        return
      }

      utilisateurs.push({
        nom: this.name,
        classe: this.classe,
        email: this.email,
        sel,
        empreinte,
      })
      ecrireUtilisateurs(utilisateurs)

      this.$router.push('/connexion')
    },
  },
}
</script>

<style scoped src="../assets/css/registerPage.css">
</style>
