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

// Un signal peut arriver en retard : la securite a deja resolu l'attente A,
// une attente B a commence, puis le signal destine a A arrive et trouverait B
// dans la case partagee. Ce drapeau retient qu'un signal est encore du pour
// une attente deja resolue par la securite, afin de le consommer sans agir
// sur l'attente suivante.
let signalEnRetardAttendu = false

export function attendreSortie() {
  return new Promise((resoudre) => {
    resoudreEnCours = resoudre

    setTimeout(() => {
      if (resoudreEnCours === resoudre) {
        resoudreEnCours = null
        signalEnRetardAttendu = true
        resoudre()
      }
    }, SECURITE_MS)
  })
}

export function signalerSortieTerminee() {
  // Ce signal est celui, en retard, d'une attente deja resolue par la
  // securite : on l'absorbe sans toucher a l'attente en cours.
  // Limite acceptee : si la transition en retard n'envoie finalement jamais
  // son signal, ce drapeau reste leve et avale le prochain signal legitime,
  // qui retombera alors sur sa propre securite de 600 ms, un defilement plus
  // lent mais jamais desynchronise.
  if (signalEnRetardAttendu) {
    signalEnRetardAttendu = false
    return
  }

  if (!resoudreEnCours) return

  const resoudre = resoudreEnCours
  resoudreEnCours = null
  resoudre()
}
