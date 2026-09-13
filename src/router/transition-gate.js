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

// Un signal peut arriver en retard : la sécurité a déjà résolu l'attente A,
// une attente B a commencé, puis le signal destiné à A arrive et trouverait B
// dans la case partagée. Ce drapeau retient qu'un signal est encore dû pour
// une attente déjà résolue par la sécurité, afin de le consommer sans agir
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
  // Ce signal est celui, en retard, d'une attente déjà résolue par la
  // sécurité : on l'absorbe sans toucher à l'attente en cours.
  // Limite acceptée : si la transition en retard n'envoie finalement jamais
  // son signal, ce drapeau reste levé et avale le prochain signal légitime,
  // qui retombera alors sur sa propre sécurité de 600 ms, un défilement plus
  // lent mais jamais désynchronisé.
  if (signalEnRetardAttendu) {
    signalEnRetardAttendu = false
    return
  }

  if (!resoudreEnCours) return

  const resoudre = resoudreEnCours
  resoudreEnCours = null
  resoudre()
}
