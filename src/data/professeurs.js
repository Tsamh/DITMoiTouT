// Fiches enseignants de la page Professeurs.
// Les noms sont fictifs et les photos sont des portraits libres de droits :
// aucune personne réelle n'est identifiable depuis ce dépôt public.
// Ce module reste du JavaScript pur, sans import Vue ni Vite, pour que le
// script d'audit puisse l'importer directement sous Node.

export const NIVEAUX = ['L1', 'L2', 'L3']

// Les valeurs de nom et de matière sont du texte affiché : elles portent
// leurs accents, contrairement aux identifiants de code.
export const professeurs = [
  { id: 'l1-01', nom: 'M. Amadou Ba', matiere: ['Méthodologie de', 'rédaction de rapport'], photo: 'p01.jpg', niveau: 'L1' },
  { id: 'l1-02', nom: 'Dr Ibrahima Sow', matiere: ['Outils IA en ligne'], photo: 'p02.jpg', niveau: 'L1' },
  { id: 'l1-03', nom: 'Mme Aïssatou Camara', matiere: ['Initiation IOT'], photo: 'p03.jpg', niveau: 'L1' },
  { id: 'l1-04', nom: 'M. Lamine Guèye', matiere: ['Système Unix et', 'installation Linux'], photo: 'p04.jpg', niveau: 'L1' },
  { id: 'l1-05', nom: 'Mme Fatou Mbaye', matiere: ['Mathématiques'], photo: 'p05.jpg', niveau: 'L1' },

  { id: 'l2-01', nom: 'M. Cheikh Sarr', matiere: ['Gestion des données Cloud'], photo: 'p06.jpg', niveau: 'L2' },
  { id: 'l2-02', nom: 'Dr Moussa Bakayoko', matiere: ['SIBD2, SQL'], photo: 'p07.jpg', niveau: 'L2' },
  { id: 'l2-03', nom: 'M. Alioune Faye', matiere: ['Python et', 'bases du web'], photo: 'p08.jpg', niveau: 'L2' },
  { id: 'l2-04', nom: 'Mme Khady Touré', matiere: ['Langage R'], photo: 'p09.jpg', niveau: 'L2' },
  { id: 'l2-05', nom: 'M. Souleymane Kane', matiere: ['Langage R'], photo: 'p10.jpg', niveau: 'L2' },

  { id: 'l3-01', nom: 'Mme Coumba Diagne', matiere: ['Techniques de communication'], photo: 'p11.jpg', niveau: 'L3' },
  { id: 'l3-02', nom: 'Mme Rokhaya Seck', matiere: ['Outils statistiques'], photo: 'p12.jpg', niveau: 'L3' },
  { id: 'l3-03', nom: 'Mme Hélène Mendy', matiere: ['Anglais'], photo: 'p13.jpg', niveau: 'L3' },
  { id: 'l3-04', nom: 'M. Babacar Ndour', matiere: ['Algorithmique'], photo: 'p14.jpg', niveau: 'L3' },
]

export function parNiveau(niveau) {
  return professeurs.filter((p) => p.niveau === niveau)
}
