<template>
  <div class="login-page">
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

      <p v-if="erreur" class="message-erreur" role="alert">{{ erreur }}</p>

      <router-link to="/register">Pas encore de compte ? Créez-en un</router-link>
    </div>
  </div>
</template>
<script>
import { calculerEmpreinte, lireUtilisateurs } from '@/utils/password'

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

      // Message identique que le compte soit introuvable ou le mot de passe
      // faux : sinon le formulaire révélerait quelles adresses sont inscrites.
      if (!compte) {
        this.erreur = 'Identifiants incorrects.'
        return
      }

      const empreinte = await calculerEmpreinte(compte.sel, this.password)
      if (empreinte !== compte.empreinte) {
        this.erreur = 'Identifiants incorrects.'
        return
      }

      // La session n'est écrite qu'après vérification réussie.
      localStorage.setItem('connectedUser', JSON.stringify({ email: compte.email, nom: compte.nom }))
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
  background: linear-gradient(135deg, #e0eafc, #cfdef3);
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
  animation: popin 0.5s ease;
}

@keyframes popin {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.login-card h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
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
  border-color: #4bb3fd;
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
  background: #4bb3fd;
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s;
}
button[type="submit"]:hover {
  background: #3498db;
  transform: translateY(-2px);
}

.message-erreur {
  margin-top: 1rem;
  color: #c0392b;
  font-size: 0.95rem;
}

a {
  display: block;
  margin-top: 1rem;
  color: #3498db;
  font-size: 0.95rem;
  text-decoration: none;
  transition: color 0.3s;
}
a:hover {
  color: #2c3e50;
}
</style>











