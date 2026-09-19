// Techniques de révision proposées sur la page Révision.
//
// Seul le suivi du temps est en service. Les trois autres sont annoncées et
// clairement marquées comme telles : mieux vaut une carte honnête qu'un bouton
// qui ne fait rien.

export const techniques = [
  {
    id: 'suivi',
    nom: 'Suivi du temps de révision',
    description:
      'Chronométrez chaque matière, cochez vos leçons et suivez votre progression classe par classe.',
    icone: 'fa-stopwatch',
    disponible: true,
  },
  {
    id: 'flashcards',
    nom: 'Flashcards',
    description:
      'Des cartes question et réponse par matière, à retourner et à réviser par répétition espacée.',
    icone: 'fa-clone',
    disponible: false,
  },
  {
    id: 'quiz',
    nom: 'Quiz',
    description:
      'Des séries de questions pour vérifier ce qui est acquis et repérer ce qui ne l’est pas.',
    icone: 'fa-circle-question',
    disponible: false,
  },
  {
    id: 'fiches',
    nom: 'Fiches de révision',
    description:
      'Des synthèses courtes par chapitre, à écrire soi-même puis à relire avant les examens.',
    icone: 'fa-file-lines',
    disponible: false,
  },
]

// Icône associée à une matière, choisie sur les mots de son intitulé.
// Une icône de la police du site plutôt qu'un emoji : même rendu partout, et
// une couleur qui suit celle du texte.
const REGLES = [
  [/python|java|javascript|algorith|programm/i, 'fa-code'],
  [/sql|nosql|donn|data|base/i, 'fa-database'],
  [/math|statis|probab/i, 'fa-square-root-variable'],
  [/anglais|english|langue/i, 'fa-language'],
  [/web|ux|design/i, 'fa-palette'],
  [/unix|linux|syst|container|virtualis/i, 'fa-terminal'],
  [/cloud|stockage|big.?data|architecture/i, 'fa-cloud'],
  [/machine.?learning|intellig|ia\b/i, 'fa-robot'],
  [/r\b|langage r/i, 'fa-chart-line'],
  [/iot|reseau|infosec|secur/i, 'fa-shield-halved'],
  [/comptab|gestion|agile|projet/i, 'fa-diagram-project'],
  [/express|communic|tec\b|rapport|méthodo/i, 'fa-comments'],
  [/visualis|graph/i, 'fa-chart-pie'],
]

export function iconeMatiere(nom) {
  for (const [motif, icone] of REGLES) {
    if (motif.test(nom)) return icone
  }
  return 'fa-book'
}
