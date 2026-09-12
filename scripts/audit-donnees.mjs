// Audit des données sensibles.
// Échoue si un motif interdit réapparaît dans les sources publiées.
// Les dossiers docs/ et scripts/ ne sont pas scannés : ils citent
// volontairement ces motifs pour les documenter et les détecter.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, extname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { professeurs, NIVEAUX } from '../src/data/professeurs.js'

const RACINE = fileURLToPath(new URL('..', import.meta.url))

const CIBLES = ['src', 'public', 'index.html']
const EXTENSIONS = ['.vue', '.js', '.mjs', '.ts', '.css', '.html', '.json', '.md']

const MOTIFS = [
  {
    nom: 'lien Slack de l\'espace de travail de l\'école',
    regex: /ditdakar\.slack\.com/i,
  },
  {
    nom: 'numéro de téléphone sénégalais',
    regex: /\+221[\s\d]{8,}/,
  },
  {
    nom: 'compte Snapchat personnel',
    regex: /snapchat\.com\/add/i,
  },
  {
    nom: 'lien WhatsApp personnel',
    regex: /wa\.me\//i,
  },
  {
    nom: 'ancienne photo d\'enseignant réel',
    regex: /\b(dominique|dr_sylla|sarah|robert|adji|mrdieng|diop|ndiaye|awa|jeune|suzanne|deguene|marie|diallo|dieng|sam|sampil|incon|Nico-Robine|Yor-Forger)\.(webp|jpg|jpeg|png)\b/i,
  },
]

function listerFichiers(chemin) {
  const infos = statSync(chemin)
  if (infos.isFile()) return [chemin]
  return readdirSync(chemin).flatMap((entree) => listerFichiers(join(chemin, entree)))
}

function scanner() {
  const occurrences = []
  for (const cible of CIBLES) {
    for (const fichier of listerFichiers(join(RACINE, cible))) {
      if (!EXTENSIONS.includes(extname(fichier))) continue
      const lignes = readFileSync(fichier, 'utf8').split('\n')
      lignes.forEach((ligne, index) => {
        for (const motif of MOTIFS) {
          if (motif.regex.test(ligne)) {
            occurrences.push({
              fichier: relative(RACINE, fichier).replace(/\\/g, '/'),
              ligne: index + 1,
              motif: motif.nom,
            })
          }
        }
      })
    }
  }
  return occurrences
}

function verifierDonneesProfesseurs() {
  const problemes = []
  const champs = ['id', 'nom', 'matiere', 'photo', 'niveau']
  const identifiants = new Set()

  for (const prof of professeurs) {
    for (const champ of champs) {
      if (prof[champ] === undefined) problemes.push(`fiche ${prof.id ?? '?'} : champ ${champ} manquant`)
    }
    if (!Array.isArray(prof.matiere)) problemes.push(`fiche ${prof.id} : matière doit être un tableau`)
    if (!NIVEAUX.includes(prof.niveau)) problemes.push(`fiche ${prof.id} : niveau ${prof.niveau} inconnu`)
    if (prof.photo?.includes('/')) problemes.push(`fiche ${prof.id} : photo doit être un nom de fichier nu`)
    if (identifiants.has(prof.id)) problemes.push(`identifiant ${prof.id} en double`)
    identifiants.add(prof.id)
    for (const [cle, valeur] of Object.entries(prof)) {
      if (typeof valeur === 'string' && /slack|https?:/i.test(valeur)) {
        problemes.push(`fiche ${prof.id} : le champ ${cle} contient un lien, ce qui n'est plus attendu`)
      }
    }
  }
  return problemes
}

const occurrences = scanner()
const problemes = verifierDonneesProfesseurs()

if (occurrences.length > 0 || problemes.length > 0) {
  console.error(`Audit échoué : ${occurrences.length} occurrence(s) et ${problemes.length} problème(s) de données.\n`)
  for (const o of occurrences) {
    console.error(`  ${o.fichier}:${o.ligne}  ${o.motif}`)
  }
  for (const p of problemes) {
    console.error(`  données professeurs : ${p}`)
  }
  process.exit(1)
}

console.log('Audit réussi : aucune donnée sensible détectée, données professeurs conformes.')
