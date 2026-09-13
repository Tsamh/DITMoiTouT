// La barre de navigation vit hors de la vue routée et ne se remonte donc
// jamais lors d'une navigation. Si chaque composant lisait la session une
// seule fois à son montage, une connexion réussie resterait invisible dans
// la barre jusqu'à un rechargement manuel. La session est donc un état
// réactif partagé, lu une fois puis mis à jour par les fonctions ci-dessous.
import { ref } from 'vue'

const CLE_SESSION = 'connectedUser'

function lireSession() {
  try {
    return JSON.parse(localStorage.getItem(CLE_SESSION))
  } catch {
    return null
  }
}

export const utilisateurConnecte = ref(lireSession())

export function ouvrirSession(utilisateur) {
  localStorage.setItem(CLE_SESSION, JSON.stringify(utilisateur))
  utilisateurConnecte.value = utilisateur
}

export function fermerSession() {
  localStorage.removeItem(CLE_SESSION)
  utilisateurConnecte.value = null
}
