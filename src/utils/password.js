// Gestion des comptes côté navigateur.
//
// À lire avant de faire confiance à ce fichier : le site est statique, sans
// serveur, donc tout ce code s'exécute chez le visiteur et il est public.
// SHA-256 n'est pas une fonction de dérivation de mot de passe et n'offre
// aucune protection contre un attaquant déterminé. Ce que ce module garantit,
// et c'est son seul objectif, c'est qu'aucun mot de passe en clair ne subsiste
// dans un stockage que toute autre page de l'origine peut lire.

export const CLE_UTILISATEURS = 'ditmt.users.v2'
const ANCIENNE_CLE = 'users'

function enHexa(octets) {
  return Array.from(octets, (o) => o.toString(16).padStart(2, '0')).join('')
}

// Supprime l'ancien stockage, qui contenait les mots de passe en clair.
// Appelé au démarrage de l'application, pour nettoyer aussi les navigateurs
// des visiteurs qui ont utilisé la version précédente du site.
export function purgerAncienStockage() {
  try {
    localStorage.removeItem(ANCIENNE_CLE)
  } catch {
    // Stockage indisponible (navigation privée stricte) : rien à purger.
  }
}

export function genererSel() {
  const octets = new Uint8Array(16)
  crypto.getRandomValues(octets)
  return enHexa(octets)
}

export async function calculerEmpreinte(sel, motDePasse) {
  const donnees = new TextEncoder().encode(`${sel}:${motDePasse}`)
  const condense = await crypto.subtle.digest('SHA-256', donnees)
  return enHexa(new Uint8Array(condense))
}

export function lireUtilisateurs() {
  try {
    const brut = localStorage.getItem(CLE_UTILISATEURS)
    const valeur = JSON.parse(brut ?? '[]')
    return Array.isArray(valeur) ? valeur : []
  } catch {
    return []
  }
}

export function ecrireUtilisateurs(utilisateurs) {
  localStorage.setItem(CLE_UTILISATEURS, JSON.stringify(utilisateurs))
}
