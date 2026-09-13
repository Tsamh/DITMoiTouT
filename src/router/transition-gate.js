// Le routeur déclenche le défilement dès la navigation confirmée, c'est-à-dire
// pendant que l'ancienne page est encore visible en train de disparaître. Sans
// ce portail, la page sortante saute vers le haut avant de s'effacer.
//
// App.vue signale la fin de la transition de sortie, le scrollBehavior l'attend,
// et le défilement se produit donc dans l'intervalle où le DOM est vide.
//
// Chaque attente porte l'identité du chemin qu'elle quitte : c'est ce chemin,
// et non un simple ordre d'arrivée, qui permet de relier un signal de sortie
// à l'attente qui lui correspond, même quand plusieurs navigations
// s'enchaînent ou se chevauchent rapidement. Un signal sans attente
// correspondante est donc ignoré sans effet de bord sur une autre attente.
//
// Sécurité : une transition avortée, annulée ou jamais déclenchée ne doit
// jamais empêcher le défilement. Chaque attente possède ainsi son propre
// délai de secours, qui la résout et la retire de la liste si aucun signal
// n'est jamais arrivé pour elle.
//
// La correspondance entre un signal et une attente se fait par chemin, seule
// identité que les deux extrémités peuvent déterminer indépendamment ; elle
// n'est donc pas exacte. Cas limite documenté : si une sortie dépasse sa
// propre sécurité de 600 ms puis que le visiteur revient sur ce même chemin
// avant que le signal tardif n'arrive, une seconde attente de clé identique
// est alors en cours, et ce signal tardif la résout à sa place.
const SECURITE_MS = 600

const attentesEnCours = []

export function attendreSortie(cle) {
  return new Promise((resoudre) => {
    const entree = { cle, resoudre, minuteur: null }
    attentesEnCours.push(entree)

    entree.minuteur = setTimeout(() => {
      const index = attentesEnCours.indexOf(entree)
      if (index !== -1) {
        attentesEnCours.splice(index, 1)
      }

      // Une promesse doit toujours se résoudre, même quand aucun signal n'est
      // jamais arrivé pour elle : sinon cette attente-ci reste bloquée pour
      // toujours, ce qui viole le contrat de ce module.
      resoudre()
    }, SECURITE_MS)
  })
}

export function signalerSortieTerminee(cle) {
  if (cle === undefined || cle === null) return

  const index = attentesEnCours.findIndex((entree) => entree.cle === cle)
  if (index === -1) return

  const [entree] = attentesEnCours.splice(index, 1)
  clearTimeout(entree.minuteur)
  entree.resoudre()
}
