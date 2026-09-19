// Fiches enseignants de la page Professeurs.
// Les noms sont fictifs et les photos sont des portraits libres de droits :
// aucune personne reelle n'est identifiable depuis ce depot public.
// Ce module reste du JavaScript pur, sans import Vue ni Vite, pour que le
// script d'audit puisse l'importer directement sous Node.
//
// Les matieres de L1 et L2 reprennent celles du catalogue des ressources.
// Celles de L3 sont provisoires : la liste des matieres de L3 n'a pas encore
// ete fournie, il faudra les revoir en meme temps que src/data/ressources.js.

export const NIVEAUX = ['L1', 'L2', 'L3']

// Les valeurs de nom et de matiere sont du texte affiche : elles portent
// leurs accents, contrairement aux identifiants de code.
export const professeurs = [
  { id: 'l1-01', nom: 'M. Amadou Ba', matiere: ['Méthodologie de', 'rédaction de rapport'], photo: 'p01.jpg', niveau: 'L1' },
  { id: 'l1-02', nom: 'Dr Ibrahima Sow', matiere: ['Modélisation et conception'], photo: 'p02.jpg', niveau: 'L1' },
  { id: 'l1-03', nom: 'Mme Aïssatou Camara', matiere: ['IOT'], photo: 'p03.jpg', niveau: 'L1' },
  { id: 'l1-04', nom: 'M. Lamine Guèye', matiere: ['Système Unix et', 'installation Linux'], photo: 'p04.jpg', niveau: 'L1' },
  { id: 'l1-05', nom: 'Mme Fatou Mbaye', matiere: ['Maths 1'], photo: 'p05.jpg', niveau: 'L1' },
  { id: 'l1-06', nom: 'M. Mamadou Diallo', matiere: ['Algorithmique'], photo: 'p15.jpg', niveau: 'L1' },
  { id: 'l1-07', nom: 'Mme Ndèye Fall', matiere: ['Bases du web'], photo: 'p16.jpg', niveau: 'L1' },
  { id: 'l1-08', nom: 'M. Ousseynou Gaye', matiere: ['Python'], photo: 'p17.jpg', niveau: 'L1' },

  { id: 'l2-01', nom: 'M. Cheikh Sarr', matiere: ['Stockage cloud'], photo: 'p06.jpg', niveau: 'L2' },
  { id: 'l2-02', nom: 'Dr Moussa Bakayoko', matiere: ['SQL et NoSQL'], photo: 'p07.jpg', niveau: 'L2' },
  { id: 'l2-03', nom: 'M. Alioune Faye', matiere: ['Javascript'], photo: 'p08.jpg', niveau: 'L2' },
  { id: 'l2-04', nom: 'Mme Khady Touré', matiere: ['Langage R'], photo: 'p09.jpg', niveau: 'L2' },
  { id: 'l2-05', nom: 'M. Souleymane Kane', matiere: ['Java'], photo: 'p10.jpg', niveau: 'L2' },
  { id: 'l2-06', nom: 'Dr Awa Cissé', matiere: ['Machine Learning'], photo: 'p18.jpg', niveau: 'L2' },
  { id: 'l2-07', nom: 'M. Serigne Lo', matiere: ['Architecture Big Data'], photo: 'p19.jpg', niveau: 'L2' },
  { id: 'l2-08', nom: 'Mme Bineta Sy', matiere: ['Data engineering'], photo: 'p20.jpg', niveau: 'L2' },

  { id: 'l3-01', nom: 'Mme Coumba Diagne', matiere: ['Techniques de communication'], photo: 'p11.jpg', niveau: 'L3' },
  { id: 'l3-02', nom: 'Mme Rokhaya Seck', matiere: ['Statistiques inférentielles'], photo: 'p12.jpg', niveau: 'L3' },
  { id: 'l3-03', nom: 'Mme Hélène Mendy', matiere: ['Anglais'], photo: 'p13.jpg', niveau: 'L3' },
  { id: 'l3-04', nom: 'M. Babacar Ndour', matiere: ['Gestion de projet'], photo: 'p14.jpg', niveau: 'L3' },
  { id: 'l3-05', nom: 'M. Pape Diouf', matiere: ['Data visualisation'], photo: 'p21.jpg', niveau: 'L3' },
  { id: 'l3-06', nom: 'Mme Maïmouna Barry', matiere: ['UX et design'], photo: 'p22.jpg', niveau: 'L3' },
  { id: 'l3-07', nom: 'M. Idrissa Thiam', matiere: ['Sécurité des systèmes'], photo: 'p23.jpg', niveau: 'L3' },
  { id: 'l3-08', nom: 'Dr Astou Niang', matiere: ['Projet de fin d’études'], photo: 'p24.jpg', niveau: 'L3' },
]

export function parNiveau(niveau) {
  return professeurs.filter((p) => p.niveau === niveau)
}
