// Catalogue des ressources : classes, matieres et types de documents.
//
// Les matieres de L1 et L2 reprennent exactement l'arborescence des dossiers
// de cours de l'ecole. La L3 est en place mais vide, prete a recevoir sa liste.
//
// Le champ dossier est le nom du repertoire sous src/assets/ressources : il
// doit correspondre au dossier reel, sans accent ni espace, car c'est lui qui
// relie une matiere aux fichiers deposes.
//
// Ce module reste du JavaScript pur, sans import Vue ni Vite, pour rester
// verifiable par un script sous Node.

export const CLASSES = ['L1', 'L2', 'L3']

// L'ordre est celui demande : les supports de cours d'abord, puis les videos,
// puis les devoirs et enfin les examens.
export const TYPES = [
  { id: 'supports', nom: 'Supports de cours', icone: 'fa-file-lines' },
  { id: 'videos', nom: 'Vidéos', icone: 'fa-circle-play' },
  { id: 'devoirs', nom: 'Devoirs', icone: 'fa-pen-to-square' },
  { id: 'examens', nom: 'Examens', icone: 'fa-graduation-cap' },
]

export const matieres = {
  L1: [
    { id: 'algorithmique', nom: 'Algorithmique', dossier: 'Algorithmique' },
    { id: 'anglais-2', nom: 'Anglais 2', dossier: 'Anglais_2' },
    { id: 'bases-du-web', nom: 'Bases du web', dossier: 'Bases_du_web' },
    { id: 'english', nom: 'English', dossier: 'English' },
    { id: 'iot', nom: 'IOT', dossier: 'IOT' },
    { id: 'langage-r', nom: 'Langage R', dossier: 'Langage_R' },
    { id: 'langage-r-2', nom: 'Langage R 2', dossier: 'Langage_R_2' },
    { id: 'maths-1', nom: 'Maths 1', dossier: 'Maths_1' },
    { id: 'modelisation-conception', nom: 'Modélisation et conception', dossier: 'Modelisation_Conception' },
    { id: 'projet-final', nom: 'Projet final', dossier: 'Projet_final' },
    { id: 'python', nom: 'Python', dossier: 'Python' },
    { id: 'python-2', nom: 'Python 2', dossier: 'Python_2' },
    { id: 'sql', nom: 'SQL', dossier: 'SQL' },
    { id: 'statistiques-1', nom: 'Statistiques 1', dossier: 'Statistiques_1' },
    { id: 'stockage-cloud', nom: 'Stockage cloud', dossier: 'Stockage_cloud' },
    { id: 'systeme-unix', nom: 'Système Unix et installation Linux', dossier: 'Systeme_Unix_Linux' },
    { id: 'tec', nom: 'TEC', dossier: 'TEC' },
    { id: 'tec2', nom: 'TEC 2', dossier: 'TEC2' },
    { id: 'technique-expression', nom: "Technique d'expression", dossier: 'Technique_d_expression' },
  ],
  L2: [
    { id: 'anglais-3', nom: 'Anglais 3', dossier: 'Anglais_3' },
    { id: 'anglais-4', nom: 'Anglais 4', dossier: 'Anglais_4' },
    { id: 'architecture-big-data', nom: 'Architecture Big Data', dossier: 'Architecture_Big_Data' },
    { id: 'bases-comptabilites', nom: 'Bases comptabilités', dossier: 'Bases_comptabilites' },
    { id: 'containers-virtualisation', nom: 'Containers et virtualisation', dossier: 'Containers_virtualisation' },
    { id: 'data-collection', nom: 'Data collection', dossier: 'Data_collection' },
    { id: 'data-engineering', nom: 'Data engineering', dossier: 'Data_engineering' },
    { id: 'data-visualisation', nom: 'Data visualisation', dossier: 'Data_visualisation' },
    { id: 'ges-agile', nom: 'Gestion Agile', dossier: 'GES_Agile' },
    { id: 'infosec', nom: 'Infosec', dossier: 'Infosec' },
    { id: 'java', nom: 'Java', dossier: 'Java' },
    { id: 'javascript', nom: 'Javascript', dossier: 'Javascript' },
    { id: 'machine-learning', nom: 'Machine Learning', dossier: 'Machine_Learning' },
    { id: 'maths-2', nom: 'Maths 2', dossier: 'Maths_2' },
    { id: 'maths-3', nom: 'Maths 3', dossier: 'Maths_3' },
    { id: 'nosql', nom: 'NoSQL', dossier: 'Nosql' },
    { id: 'projet-informatique-2', nom: 'Projet informatique 2', dossier: 'Projet_informatique_2' },
    { id: 'projets', nom: 'Projets', dossier: 'Projets' },
    { id: 'python-l2', nom: 'Python', dossier: 'Python_L2' },
    { id: 'statistiques-2', nom: 'Statistiques 2, probabilités', dossier: 'Statistiques_2_Probabilites' },
    { id: 'statistiques-3', nom: 'Statistiques 3, inférentielle', dossier: 'Statistiques_3_Inferentielle' },
    { id: 'ux', nom: 'UX', dossier: 'UX' },
  ],
  // La liste de L3 n'a pas encore ete fournie. Ajouter les entrees ici suffit :
  // creer ensuite les dossiers correspondants sous src/assets/ressources/L3.
  L3: [],
}

export function matieresDe(classe) {
  return matieres[classe] ?? []
}
