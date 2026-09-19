<template>
  <div class="login-page">
    <div class="login-card" v-reveal>
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

      <p v-if="erreur" class="message-erreur" role="alert">{{ erreur }}</p>

      <router-link to="/register">Pas encore de compte ? Créez-en un</router-link>
    </div>
  </div>
</template>
<script>
import { calculerEmpreinte, lireUtilisateurs } from '@/utils/password'
import { ouvrirSession } from '@/utils/session'

export default {
  data() {
    return {
      email: '',
      password: '',
      erreur: '',
    }
  },
  methods: {
    async login() {
      this.erreur = ''

      const utilisateurs = lireUtilisateurs()
      const compte = utilisateurs.find((u) => u.email === this.email)

      // Les deux cas renvoient le même message par convention, étant entendu
      // que sur un stockage local au navigateur cela ne protège rien qu'une inspection du stockage ne révélerait.
      if (!compte) {
        this.erreur = 'Identifiants incorrects.'
        return
      }

      let empreinte
      try {
        empreinte = await calculerEmpreinte(compte.sel, this.password)
      } catch {
        // crypto.subtle est absent hors contexte sécurisé (HTTPS ou localhost).
        this.erreur = 'Connexion impossible : cette page doit être servie en HTTPS ou depuis localhost.'
        return
      }
      if (empreinte !== compte.empreinte) {
        this.erreur = 'Identifiants incorrects.'
        return
      }

      // La session n'est écrite qu'après vérification réussie.
      ouvrirSession({ email: compte.email, nom: compte.nom })
      this.$router.push('/')
    },
  },
}
</script>
<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f1eae2;
  font-family: 'Segoe UI', sans-serif;
}

.login-card {
  background: white;
  padding: 2.5rem 3rem;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.login-card h2 {
  margin-bottom: 1.5rem;
  color: #10331a;
}

.input-group {
  display: flex;
  align-items: center;
  background-color: #f1f3f5;
  padding: 0.7rem 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  gap: 10px;
  border: 2px solid transparent;
  transition: border-color 0.3s ease;
}
.input-group:focus-within {
  border-color: #118a21;
}

.input-group input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1rem;
  color: #333;
}

button[type="submit"] {
  background: #118a21;
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s;
}
button[type="submit"]:hover {
  background: #0d6b19;
  transform: translateY(-2px);
}

a {
  display: block;
  margin-top: 1rem;
  color: #118a21;
  font-size: 0.95rem;
  text-decoration: none;
  transition: color 0.3s;
}
a:hover {
  color: #10331a;
}
</style>











