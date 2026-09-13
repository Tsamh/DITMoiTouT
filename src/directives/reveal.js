// Révélation des blocs au défilement.
//
// Un seul IntersectionObserver sert toute l'application. Chaque élément
// observé se désabonne dès qu'il a été révélé : la révélation est à sens
// unique, un bloc déjà apparu ne redisparaît pas si l'on remonte.

const ATTRIBUT = 'data-reveal'
// Deux classes : l'élément se révèle lui-même, ou il révèle ses enfants.
const CLASSE_REVELE = 'est-revele'
const CLASSE_REVELE_GROUPE = 'est-revele-groupe'
const DECALAGE_MS = 90
// Au-delà de six enfants le décalage repart à zéro : sinon la quinzième carte
// attendrait une seconde et demie et l'effet deviendrait pénible.
const MAX_DECALAGES = 6

let observateur = null

function mouvementReduit() {
  return typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function obtenirObservateur() {
  if (observateur) return observateur

  observateur = new IntersectionObserver(
    (entrees) => {
      for (const entree of entrees) {
        if (!entree.isIntersecting) continue
        const groupe = entree.target.dataset.revealGroupe === 'oui'
        entree.target.classList.add(groupe ? CLASSE_REVELE_GROUPE : CLASSE_REVELE)
        observateur.unobserve(entree.target)
      }
    },
    {
      // Un bloc s'anime quand il a franchi le bas de l'écran d'environ un
      // huitième de la hauteur de fenêtre. C'est la marge négative du bas qui
      // produit ce retard, et elle seule.
      //
      // Le seuil reste à zéro délibérément. Un seuil exprimé en proportion de
      // la surface de l'élément, 0.15 par exemple, n'est jamais atteint par un
      // conteneur plus haut qu'environ six écrans : le rapport visible plafonne
      // sous le seuil, la fonction de rappel ne part jamais, et les enfants
      // déjà masqués par la directive le resteraient définitivement.
      threshold: 0,
      rootMargin: '0px 0px -12% 0px',
    },
  )

  return observateur
}

export const reveal = {
  mounted(el, binding) {
    // Deux sorties sans effet, qui laissent le contenu visible : c'est le
    // comportement dégradé voulu.
    if (mouvementReduit()) return
    if (typeof IntersectionObserver === 'undefined') return

    if (binding.modifiers.stagger) {
      // Le conteneur n'est pas masqué : il sert seulement de déclencheur.
      el.dataset.revealGroupe = 'oui'
      Array.from(el.children).forEach((enfant, index) => {
        enfant.setAttribute(ATTRIBUT, '')
        enfant.style.setProperty('--reveal-delay', `${(index % MAX_DECALAGES) * DECALAGE_MS}ms`)
        if (binding.modifiers.fondu) enfant.classList.add('fondu')
      })
    } else {
      el.setAttribute(ATTRIBUT, '')
      if (binding.modifiers.fondu) el.classList.add('fondu')
      if (binding.value?.delai) el.style.setProperty('--reveal-delay', `${binding.value.delai}ms`)
    }

    obtenirObservateur().observe(el)
  },

  unmounted(el) {
    observateur?.unobserve(el)
  },
}
