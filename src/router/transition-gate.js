// Le routeur déclenche le défilement dès la navigation confirmée, c'est-à-dire
// pendant que l'ancienne page est encore visible en train de disparaître. Sans
// ce portail, la page sortante saute vers le haut avant de s'effacer.
//
// App.vue signale la fin de la transition de sortie, le scrollBehavior l'attend,
// et le défilement se produit donc dans l'intervalle où le DOM est vide.

// Sécurité : une transition avortée ou jamais déclenchée ne doit jamais
// empêcher le défilement.
const SECURITE_MS = 600

let resoudreEnCours = null

export function attendreSortie() {
  return new Promise((resoudre) => {
    resoudreEnCours = resoudre

    setTimeout(() => {
      if (resoudreEnCours === resoudre) {
        resoudreEnCours = null
        resoudre()
      }
    }, SECURITE_MS)
  })
}

export function signalerSortieTerminee() {
  if (!resoudreEnCours) return

  const resoudre = resoudreEnCours
  resoudreEnCours = null
  resoudre()
}
