// Audit des donnees sensibles.
// Echoue si un motif interdit reapparait dans les sources publiees.
// Les dossiers docs/ et scripts/ ne sont pas scannes : ils citent
// volontairement ces motifs pour les documenter et les detecter.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, extname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const RACINE = fileURLToPath(new URL('..', import.meta.url))

const CIBLES = ['src', 'public', 'index.html']
const EXTENSIONS = ['.vue', '.js', '.mjs', '.ts', '.css', '.html', '.json', '.md']

const MOTIFS = [
  {
    nom: 'lien Slack de l espace de travail de l ecole',
    regex: /ditdakar\.slack\.com/i,
  },
  {
    nom: 'numero de telephone senegalais',
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
    nom: 'ancienne photo d enseignant reel',
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

const occurrences = scanner()

if (occurrences.length > 0) {
  console.error(`Audit echoue : ${occurrences.length} occurrence(s) de donnees sensibles.\n`)
  for (const o of occurrences) {
    console.error(`  ${o.fichier}:${o.ligne}  ${o.motif}`)
  }
  process.exit(1)
}

console.log('Audit reussi : aucune donnee sensible detectee.')
