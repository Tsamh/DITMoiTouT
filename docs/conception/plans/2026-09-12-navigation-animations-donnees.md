# Navigation fluide, animations premium et retrait des données sensibles : plan d'implémentation

> Plan a executer tache par tache. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Faire repartir chaque changement de page depuis le haut, ajouter une transition de page et une révélation au défilement sur tout le site, et retirer du dépôt public toute donnée personnelle réelle, historique git compris.

**Architecture:** Trois couches indépendantes. Une directive `v-reveal` autonome adossée à un `IntersectionObserver` unique, qui ne connaît ni le routeur ni les vues. Un portail de transition de quinze lignes qui synchronise le `scrollBehavior` du routeur avec la fin de la transition de sortie, seul point de contact entre routeur et animation. Un module de données enseignants et un utilitaire de mot de passe, tous deux purement JavaScript et importables par Node, ce qui permet à un script d'audit de les vérifier sans navigateur.

**Tech Stack:** Vue 3.5 (Options API et `<script setup>` mélangés dans le projet existant), Vue Router 4.5, Vite 6, aucune dépendance ajoutée, Node 20 pour le script d'audit.

## Global Constraints

- **Aucune dépendance npm ajoutée.** Le `package.json` ne gagne qu'un script, pas un paquet.
- **Aucun tiret cadratin** dans le code, les commentaires, les commits, la documentation ou le texte affiché. Utiliser deux-points, parenthèses ou virgules.
- **Aucun pied de page d'attribution** dans les messages de commit. Pas de `Co-Authored-By`, pas de lien de session, pas de mention de generation automatique.
- **Français sans accents dans les identifiants de code** (noms de fonctions, de variables, de fichiers). Les accents sont autorisés et attendus dans les commentaires et le texte affiché.
- **Courbe d'accélération unique pour tout le site :** `cubic-bezier(0.22, 0.61, 0.36, 1)`.
- **`prefers-reduced-motion: reduce` doit supprimer toute animation**, sans exception.
- **La dégradation par défaut est le contenu visible.** Aucun élément ne doit pouvoir rester invisible si le JavaScript échoue.
- **Branche de travail :** `principal`. Ne jamais pousser sans instruction explicite.
- Commande de construction de référence : `npm run build`, qui doit passer à chaque commit.

---

## Structure des fichiers

### Créés

| Fichier | Responsabilité unique |
|---|---|
| `scripts/audit-donnees.mjs` | Échouer si un motif de donnée sensible réapparaît dans les sources |
| `src/data/professeurs.js` | Les 14 fiches enseignants, JavaScript pur, sans import Vue ni Vite |
| `src/utils/password.js` | Sel, empreinte, lecture et écriture du stockage de comptes, purge de l'ancien |
| `src/assets/css/motion.css` | Toutes les valeurs de mouvement et toutes les classes d'animation |
| `src/directives/reveal.js` | La directive `v-reveal` et l'observateur partagé |
| `src/router/transition-gate.js` | Synchroniser le défilement avec la fin de la transition de sortie |

### Modifiés

| Fichier | Nature du changement |
|---|---|
| `src/components/Footer.vue` | Retrait des numéros et des comptes personnels, correction du LinkedIn |
| `src/views/Professeurs.vue` | Passage de 14 blocs copiés à une boucle sur les données |
| `src/views/loginPage.vue` | Ordre de vérification corrigé, empreinte, message d'erreur en ligne |
| `src/views/registerPage.vue` | Nouveau format de compte avec sel et empreinte |
| `src/router/index.js` | `scrollBehavior` |
| `src/App.vue` | `<Transition>` autour du `<router-view>` |
| `src/main.js` | Enregistrement de la directive, import du CSS, purge au démarrage |
| Les huit vues | Pose des `v-reveal` |
| `.gitignore` | `.env` et `.env.*` |
| `package.json` | Script `audit` |
| `.github/workflows/pages.yml` | Étape d'audit avant la construction |

### Hors périmètre, signalé mais non corrigé

`src/views/RegisterLogin.vue` appelle `login` et `register` dans son template, alors qu'aucune de ces deux méthodes n'est définie dans le composant. Cette vue est déjà cassée avant notre intervention et n'écrit rien dans le stockage, donc elle ne pose pas de problème de sécurité. Ne pas la réparer dans ce plan.

---

## Tâches

### Task 1 : Script d'audit des données sensibles

Ce script est le test qui pilote tout le volet données. Il doit échouer maintenant, et ce sont les tâches 2 à 5 qui le feront passer au vert.

**Files:**
- Create: `scripts/audit-donnees.mjs`
- Modify: `package.json` (bloc `scripts`)
- Modify: `.gitignore` (fin du fichier)

**Interfaces:**
- Consumes: rien.
- Produces: la commande `npm run audit`, qui sort en code 1 avec la liste des occurrences trouvées, ou en code 0 si tout est propre. La tâche 6 la branchera dans la CI. Le script importera `src/data/professeurs.js` à partir de la tâche 3 ; à cette étape il se contente de scanner les fichiers.

- [ ] **Step 1 : Écrire le script d'audit**

Créer `scripts/audit-donnees.mjs` :

```js
// Audit des données sensibles.
// Échoue si un motif interdit réapparaît dans les sources publiées.
// Les dossiers docs/ et scripts/ ne sont pas scannés : ils citent
// volontairement ces motifs pour les documenter et les détecter.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, extname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

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

const occurrences = scanner()

if (occurrences.length > 0) {
  console.error(`Audit échoué : ${occurrences.length} occurrence(s) de données sensibles.\n`)
  for (const o of occurrences) {
    console.error(`  ${o.fichier}:${o.ligne}  ${o.motif}`)
  }
  process.exit(1)
}

console.log('Audit réussi : aucune donnée sensible détectée.')
```

- [ ] **Step 2 : Ajouter le script au `package.json`**

Dans le bloc `scripts`, après la ligne `"preview": "vite preview"`, ajouter une virgule puis :

```json
    "audit": "node scripts/audit-donnees.mjs"
```

Le bloc complet doit devenir :

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "audit": "node scripts/audit-donnees.mjs"
  },
```

- [ ] **Step 3 : Lancer l'audit et vérifier qu'il échoue**

Run: `npm run audit`

Expected: sortie en code 1, avec au minimum ces catégories listées :
- 14 occurrences de `lien Slack` dans `src/views/Professeurs.vue`
- 3 occurrences de `numero de telephone senegalais` dans `src/components/Footer.vue`
- 1 occurrence de `compte Snapchat personnel` dans `src/components/Footer.vue`
- 1 occurrence de `lien WhatsApp personnel` dans `src/components/Footer.vue`
- 15 occurrences de `ancienne photo d enseignant reel` dans `src/views/Professeurs.vue`

Si le script sort en code 0, il ne scanne pas les bons fichiers : vérifier que `CIBLES` pointe bien sur `src`.

- [ ] **Step 4 : Ajouter la protection `.env` au `.gitignore`**

Ajouter à la fin de `.gitignore` :

```
# Variables d'environnement
.env
.env.*
!.env.example
```

- [ ] **Step 5 : Commit**

```bash
git add scripts/audit-donnees.mjs package.json .gitignore
git commit -m "Ajouter un audit des donnees sensibles et proteger les fichiers .env"
```

---

### Task 2 : Nettoyage du footer

**Files:**
- Modify: `src/components/Footer.vue:9-20` (liste `media-icons`) et `:30-40` (bloc Coordonnées)

**Interfaces:**
- Consumes: la commande `npm run audit` de la tâche 1.
- Produces: rien que d'autres tâches consomment.

- [ ] **Step 1 : Remplacer la liste des réseaux sociaux**

Dans `src/components/Footer.vue`, remplacer intégralement le bloc `<ul class="media-icons"> … </ul>` par :

```html
        <ul class="media-icons">
          <li><a href="https://www.youtube.com/@DITSenegal"><i class="fa-brands fa-youtube"></i></a></li>
          <li><a href="https://www.instagram.com/ditdakar"><i class="fa-brands fa-instagram"></i></a></li>
          <li><a href="https://x.com/DITSenegal"><i class="fa-brands fa-twitter"></i></a></li>
          <li><a href="https://www.facebook.com/share/1F1kEupDxK/"><i class="fa-brands fa-facebook"></i></a></li>
          <li><a href="https://www.tiktok.com/@ditdakar"><i class="fa-brands fa-tiktok"></i></a></li>
          <li><a href="https://www.linkedin.com/in/samba-hama-traore-925309351"><i class="fa-brands fa-linkedin"></i></a></li>
          <li><a href="https://discord.com/invite/K9MHYABb"><i class="fa-brands fa-discord"></i></a></li>
          <li><a href="https://github.com/Tsamh"><i class="fa-brands fa-github"></i></a></li>
        </ul>
```

Trois changements par rapport à l'existant : les entrées Snapchat et WhatsApp disparaissent, le LinkedIn nominatif d'un tiers est remplacé par celui du propriétaire du dépôt, et les paramètres de suivi (`?igsh=`, `?t=`, `?_t=`) sont retirés des liens conservés car ils identifient la session qui a produit le partage.

- [ ] **Step 2 : Retirer les numéros de téléphone**

Remplacer le bloc `<li><a href="#">Coordonnées</a> … </li>` par :

```html
          <li><a href="#">Coordonnées</a>
            <ul>
              <br />
              <li>Contact via le formulaire ci-contre</li>
            </ul>
          </li>
```

- [ ] **Step 3 : Vérifier que le footer ne déclenche plus l'audit**

Run: `npm run audit`

Expected: sortie toujours en code 1, mais plus aucune ligne mentionnant `src/components/Footer.vue`. Il ne doit rester que les occurrences de `src/views/Professeurs.vue`.

- [ ] **Step 4 : Vérifier que la construction passe**

Run: `npm run build`

Expected: `built in …`, sans erreur.

- [ ] **Step 5 : Commit**

```bash
git add src/components/Footer.vue
git commit -m "Retirer les numeros de telephone et les comptes personnels du pied de page"
```

---

### Task 3 : Extraction et anonymisation des données enseignants

**Files:**
- Create: `src/data/professeurs.js`
- Modify: `src/views/Professeurs.vue` (template entier, plus ajout d'un bloc `<script setup>`)
- Modify: `scripts/audit-donnees.mjs` (ajout de la vérification d'intégrité des données)

**Interfaces:**
- Consumes: rien.
- Produces:
  - `export const NIVEAUX` : `['L1', 'L2', 'L3']`
  - `export const professeurs` : tableau d'objets `{ id: string, nom: string, matiere: string[], photo: string, niveau: 'L1' | 'L2' | 'L3' }`. `photo` est un nom de fichier nu, sans chemin, résolu par la vue. `matiere` est un tableau pour reproduire les fiches d'origine qui affichaient la matière sur deux lignes.
  - `export function parNiveau(niveau)` : renvoie le sous-tableau des enseignants de ce niveau.
  - Le module est du JavaScript pur, sans import Vue ni chemin `@/` ni import d'image, afin que Node puisse l'importer directement depuis le script d'audit.

- [ ] **Step 1 : Créer le module de données**

Créer `src/data/professeurs.js` :

```js
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
```

- [ ] **Step 2 : Réécrire le template de la page Professeurs**

Remplacer intégralement le contenu de `src/views/Professeurs.vue` par :

```vue
<template>
  <h1>&nbsp;</h1>
  <main>
    <section class="card-container">
      <article class="content">
        <h2>Les professeurs</h2>
        <p class="presentation">
          Besoin d’aide ?
          Ici, vous retrouverez tous les professeurs qui vous accompagnent tout au long de votre parcours académique.

          La réussite ne dépend pas uniquement de la quantité de révisions, mais aussi de la qualité de l’accompagnement. Alors ne restez pas bloqué·e seul·e face à vos difficultés : explorez cette section, identifiez les enseignants liés à vos matières, et n’hésitez pas à vous appuyer sur leur expertise.
          Ce projet vise justement à recréer ce lien d’encadrement, même en dehors des heures de cours, pour que vous ne perdiez jamais de vue que, dans cette aventure d’apprentissage, vous n’êtes pas seul·e.
        </p>
        <a href="#l1">Voir plus sur nous</a>
      </article>
    </section>
  </main>

  <template v-for="(niveau, index) in NIVEAUX" :key="niveau">
    <div class=".contain">
      <button class="container">
        {{ niveau }}
        <!-- Ancre id et non name : name est obsolète et introuvable par querySelector,
             donc le scrollBehavior du routeur ne saurait pas la cibler. -->
        <a :id="niveau.toLowerCase()" :class="ancre(index)"></a>
      </button>
    </div>

    <div class="team">
      <section class="card" v-for="prof in parNiveau(niveau)" :key="prof.id">
        <section class="imgBox">
          <img class="people" :src="photoUrl(prof.photo)" :alt="`Portrait de ${prof.nom}`" />
        </section>
        <article class="details">
          <span v-for="(ligne, i) in prof.matiere" :key="i">{{ ligne }}</span>
          <h1>{{ prof.nom }}</h1>
          <!-- Bouton sans destination : les anciens liens pointaient vers de vrais
               identifiants de membres Slack, qui ont été retirés. -->
          <button type="button" class="contact" disabled>Contacter</button>
        </article>
      </section>

      <section class="card" v-if="niveau === 'L3'">
        <section class="imgBox">
          <img class="people" :src="photoUrl('recrutement.jpg')" alt="Poste à pourvoir" />
        </section>
        <article class="details">
          <span>Ceci pourrait être vous !</span>
          <h1>Nous recrutons !</h1>
          <button type="button" class="contact" disabled>Postuler</button>
        </article>
      </section>
    </div>
  </template>
</template>

<script setup>
import { NIVEAUX, parNiveau } from '@/data/professeurs'

// import.meta.glob résout les images à la construction. Le module de données
// ne porte que des noms de fichiers, ce qui le garde importable par Node.
const images = import.meta.glob('../assets/images/professeurs/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})

function photoUrl(fichier) {
  return images[`../assets/images/professeurs/${fichier}`]
}

const CLASSES_ANCRE = ['encre', 'encre2', 'encre3']

function ancre(index) {
  return CLASSES_ANCRE[index]
}
</script>

<style src="../assets/css/professeurs.css" scoped></style>
```

- [ ] **Step 3 : Donner au bouton Contacter l'apparence de l'ancien lien**

Les fiches stylaient un `<a>`, pas un `<button>`. Ajouter à la fin de `src/assets/css/professeurs.css` :

```css
/* Espacement entre les niveaux : remplace les <br><br> du template d'origine. */
.team {
  margin-bottom: 3rem;
}

/* Le bouton Contacter remplace un lien : on lui redonne l'apparence du lien
   d'origine et on marque clairement son état inactif. */
.details .contact {
  font: inherit;
  border: none;
  cursor: not-allowed;
  opacity: 0.65;
}
```

- [ ] **Step 4 : Ajouter la vérification d'intégrité des données au script d'audit**

Dans `scripts/audit-donnees.mjs`, ajouter cet import en tête de fichier, sous les imports existants :

```js
import { professeurs, NIVEAUX } from '../src/data/professeurs.js'
```

Puis, juste avant le bloc `const occurrences = scanner()`, insérer :

```js
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
```

Enfin, remplacer le bloc final du script par :

```js
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
```

- [ ] **Step 5 : Lancer l'audit**

Run: `npm run audit`

Expected: sortie en code 0, message `Audit reussi`. Les 14 liens Slack et les 15 références de photos ont disparu du template, et les nouvelles photos `p01.jpg` à `p14.jpg` ne correspondent à aucun motif interdit.

Si le script échoue à l'import avec `Cannot find module`, vérifier que `package.json` contient bien `"type": "module"`, ce qui est déjà le cas.

- [ ] **Step 6 : Commit**

```bash
git add src/data/professeurs.js src/views/Professeurs.vue src/assets/css/professeurs.css scripts/audit-donnees.mjs
git commit -m "Anonymiser les fiches enseignants et les extraire dans un module de donnees"
```

Ne pas lancer `npm run build` à cette étape : les fichiers `p01.jpg` à `p14.jpg` n'existent pas encore, la construction échouerait. C'est l'objet de la tâche suivante.

---

### Task 4 : Remplacement des photos

**Files:**
- Delete: les 19 fichiers de `src/assets/images/professeurs/`
- Create: `src/assets/images/professeurs/p01.jpg` à `p14.jpg` et `recrutement.jpg`

**Interfaces:**
- Consumes: la liste des noms de fichiers attendus par `src/data/professeurs.js` (tâche 3).
- Produces: les 15 images résolues par `import.meta.glob` dans `Professeurs.vue`.

- [ ] **Step 1 : Télécharger les portraits de remplacement**

Les portraits viennent de `randomuser.me`, qui fournit un jeu de photos libres d'usage. Depuis la racine du projet :

```bash
cd src/assets/images/professeurs
for i in 01 02 03 04 05 06 07; do
  curl -fsSL "https://randomuser.me/api/portraits/men/${i#0}.jpg" -o "p$i.jpg"
done
for i in 08 09 10 11 12 13 14; do
  curl -fsSL "https://randomuser.me/api/portraits/women/${i#0}.jpg" -o "p$i.jpg"
done
curl -fsSL "https://randomuser.me/api/portraits/lego/1.jpg" -o "recrutement.jpg"
cd -
```

- [ ] **Step 2 : Vérifier que les 15 fichiers sont des images valides**

```bash
ls -l src/assets/images/professeurs/p*.jpg src/assets/images/professeurs/recrutement.jpg | wc -l
file src/assets/images/professeurs/p01.jpg src/assets/images/professeurs/recrutement.jpg
```

Expected: `15`, puis deux lignes contenant `JPEG image data`.

**Si le téléchargement échoue** (réseau bloqué, service indisponible), ne pas improviser une autre source et ne pas continuer : s'arrêter et demander à l'utilisateur de fournir lui-même 15 images, qu'il suffira de nommer `p01.jpg` à `p14.jpg` et `recrutement.jpg`. Il a explicitement proposé cette solution de repli.

- [ ] **Step 3 : Supprimer les anciennes photos**

```bash
git rm src/assets/images/professeurs/adji.webp \
       src/assets/images/professeurs/awa.jpg \
       src/assets/images/professeurs/deguene.webp \
       src/assets/images/professeurs/diallo.webp \
       src/assets/images/professeurs/dieng.jpg \
       src/assets/images/professeurs/diop.jpg \
       src/assets/images/professeurs/dominique.webp \
       src/assets/images/professeurs/dr_sylla.webp \
       src/assets/images/professeurs/incon.jpg \
       src/assets/images/professeurs/jeune.jpg \
       src/assets/images/professeurs/marie.jpg \
       src/assets/images/professeurs/mrdieng.jpg \
       src/assets/images/professeurs/ndiaye.png \
       src/assets/images/professeurs/Nico-Robine.jpg \
       src/assets/images/professeurs/robert.webp \
       src/assets/images/professeurs/sam.jpg \
       src/assets/images/professeurs/sampil.jpg \
       src/assets/images/professeurs/sarah.webp \
       src/assets/images/professeurs/suzanne.webp \
       src/assets/images/professeurs/Yor-Forger.jpg
```

Les cinq derniers noms de cette liste n'étaient référencés par aucune fiche, mais ils étaient tout de même publiés par le dépôt. Ils partent aussi.

- [ ] **Step 4 : Vérifier qu'il ne reste que les nouvelles photos**

```bash
ls src/assets/images/professeurs/
```

Expected: exactement `p01.jpg` à `p14.jpg` et `recrutement.jpg`, rien d'autre.

- [ ] **Step 5 : Vérifier la construction et l'audit**

Run: `npm run build && npm run audit`

Expected: `built in …` sans erreur d'import d'image, puis `Audit reussi`.

- [ ] **Step 6 : Commit**

```bash
git add -A src/assets/images/professeurs/
git commit -m "Remplacer les photos des enseignants par des portraits libres de droits"
```

---

### Task 5 : Corriger la faille de connexion et le stockage des mots de passe

**Files:**
- Create: `src/utils/password.js`
- Modify: `src/views/loginPage.vue` (bloc `<script>` et template, ajout d'un message d'erreur)
- Modify: `src/views/registerPage.vue` (bloc `<script>` et template)
- Modify: `src/main.js` (purge au démarrage)

**Interfaces:**
- Consumes: rien.
- Produces:
  - `export const CLE_UTILISATEURS` : `'ditmt.users.v2'`
  - `export function purgerAncienStockage(): void`
  - `export function genererSel(): string` (32 caractères hexadécimaux)
  - `export async function calculerEmpreinte(sel: string, motDePasse: string): Promise<string>` (64 caractères hexadécimaux)
  - `export function lireUtilisateurs(): Array<{ nom, classe, email, sel, empreinte }>`
  - `export function ecrireUtilisateurs(utilisateurs): void`

- [ ] **Step 1 : Créer l'utilitaire de mot de passe**

Créer `src/utils/password.js` :

```js
// Gestion des comptes côté navigateur.
//
// À lire avant de faire confiance à ce fichier : le site est statique, sans
// serveur, donc tout ce code s'exécute chez le visiteur et il est public.
// SHA-256 n'est pas une fonction de dérivation de mot de passe et n'offre
// aucune protection contre un attaquant déterminé. Ce que ce module garantit,
// et c'est son seul objectif, c'est qu'aucun mot de passe en clair ne subsiste
// dans un stockage que toute autre page de l'origine peut lire.

export const CLE_UTILISATEURS = 'ditmt.users.v2'
const ANCIENNE_CLE = 'users'

function enHexa(octets) {
  return Array.from(octets, (o) => o.toString(16).padStart(2, '0')).join('')
}

// Supprime l'ancien stockage, qui contenait les mots de passe en clair.
// Appelé au démarrage de l'application, pour nettoyer aussi les navigateurs
// des visiteurs qui ont utilisé la version précédente du site.
export function purgerAncienStockage() {
  try {
    localStorage.removeItem(ANCIENNE_CLE)
  } catch {
    // Stockage indisponible (navigation privée stricte) : rien à purger.
  }
}

export function genererSel() {
  const octets = new Uint8Array(16)
  crypto.getRandomValues(octets)
  return enHexa(octets)
}

export async function calculerEmpreinte(sel, motDePasse) {
  const donnees = new TextEncoder().encode(`${sel}:${motDePasse}`)
  const condense = await crypto.subtle.digest('SHA-256', donnees)
  return enHexa(new Uint8Array(condense))
}

export function lireUtilisateurs() {
  try {
    const brut = localStorage.getItem(CLE_UTILISATEURS)
    const valeur = JSON.parse(brut ?? '[]')
    return Array.isArray(valeur) ? valeur : []
  } catch {
    return []
  }
}

export function ecrireUtilisateurs(utilisateurs) {
  localStorage.setItem(CLE_UTILISATEURS, JSON.stringify(utilisateurs))
}
```

`crypto.subtle` n'existe que dans un contexte sécurisé. C'est le cas sur GitHub Pages, qui sert en HTTPS, et sur `http://localhost` en développement, que les navigateurs traitent comme sécurisé. Aucune configuration supplémentaire n'est nécessaire.

- [ ] **Step 2 : Purger l'ancien stockage au démarrage**

Dans `src/main.js`, ajouter l'import après les imports CSS existants :

```js
import { purgerAncienStockage } from './utils/password'
```

et, juste avant la ligne `createApp(App).use(router).mount('#app')` :

```js
// Efface les mots de passe en clair laisses par la version precedente du site.
purgerAncienStockage()
```

- [ ] **Step 3 : Corriger la page de connexion**

Dans `src/views/loginPage.vue`, remplacer le bloc `<script> … </script>` par :

```vue
<script>
import { calculerEmpreinte, lireUtilisateurs } from '@/utils/password'

export default {
  data() {
    return {
      email: '',
      password: '',
      erreur: '',
    }
  },
  methods: {
    async login() {
      this.erreur = ''

      const utilisateurs = lireUtilisateurs()
      const compte = utilisateurs.find((u) => u.email === this.email)

      // Message identique que le compte soit introuvable ou le mot de passe
      // faux : sinon le formulaire révélerait quelles adresses sont inscrites.
      if (!compte) {
        this.erreur = 'Identifiants incorrects.'
        return
      }

      const empreinte = await calculerEmpreinte(compte.sel, this.password)
      if (empreinte !== compte.empreinte) {
        this.erreur = 'Identifiants incorrects.'
        return
      }

      // La session n'est écrite qu'après vérification réussie.
      localStorage.setItem('connectedUser', JSON.stringify({ email: compte.email, nom: compte.nom }))
      this.$router.push('/')
    },
  },
}
</script>
```

Puis, dans le template, insérer le message d'erreur entre le bouton et le lien d'inscription. Remplacer :

```html
        <button type="submit">Se connecter</button>
      </form>

      <router-link to="/register">Pas encore de compte ? Créez-en un</router-link>
```

par :

```html
        <button type="submit">Se connecter</button>
      </form>

      <p v-if="erreur" class="message-erreur" role="alert">{{ erreur }}</p>

      <router-link to="/register">Pas encore de compte ? Créez-en un</router-link>
```

Enfin, ajouter le style du message dans le bloc `<style scoped>` de ce même fichier, juste avant la règle `a {` :

```css
.message-erreur {
  margin-top: 1rem;
  color: #c0392b;
  font-size: 0.95rem;
}
```

- [ ] **Step 4 : Corriger la page d'inscription**

Dans `src/views/registerPage.vue`, remplacer le bloc `<script> … </script>` par :

```vue
<script>
import { calculerEmpreinte, ecrireUtilisateurs, genererSel, lireUtilisateurs } from '@/utils/password'

export default {
  data() {
    return {
      name: '',
      classe: '',
      email: '',
      password: '',
      erreur: '',
    }
  },
  methods: {
    async register() {
      this.erreur = ''

      const utilisateurs = lireUtilisateurs()
      if (utilisateurs.some((u) => u.email === this.email)) {
        this.erreur = 'Cet utilisateur existe déjà.'
        return
      }

      // Le mot de passe lui-même n'est jamais écrit : seule son empreinte l'est.
      const sel = genererSel()
      const empreinte = await calculerEmpreinte(sel, this.password)

      utilisateurs.push({
        nom: this.name,
        classe: this.classe,
        email: this.email,
        sel,
        empreinte,
      })
      ecrireUtilisateurs(utilisateurs)

      this.$router.push('/connexion')
    },
  },
}
</script>
```

Et dans le template, remplacer :

```html
        <button type="submit">S'inscrire</button>
      </form>
```

par :

```html
        <button type="submit">S'inscrire</button>
      </form>

      <p v-if="erreur" class="message-erreur" role="alert">{{ erreur }}</p>
```

Ajouter enfin à la fin de `src/assets/css/registerPage.css` :

```css
.message-erreur {
  margin-top: 1rem;
  color: #c0392b;
  font-size: 0.95rem;
}
```

- [ ] **Step 5 : Vérifier la construction**

Run: `npm run build`

Expected: `built in …`, sans erreur.

- [ ] **Step 6 : Vérifier le comportement dans le navigateur**

Run: `npm run dev`, puis dans le navigateur :

1. Ouvrir `/register`, créer un compte avec `test@test.fr` et le mot de passe `secret123`.
2. Ouvrir la console, onglet Application, stockage local. Vérifier que la clé `users` n'existe pas, que la clé `ditmt.users.v2` existe, et que la chaîne `secret123` n'apparaît nulle part dans sa valeur.
3. Aller sur `/connexion`, saisir `test@test.fr` avec le mot de passe `mauvais`. Attendu : le message `Identifiants incorrects.` s'affiche sous le formulaire, aucune redirection, et la clé `connectedUser` n'est pas créée.
4. Ressaisir avec `secret123`. Attendu : redirection vers l'accueil, `connectedUser` créée, et l'adresse affichée dans la barre de navigation.
5. Saisir une adresse jamais inscrite. Attendu : le même message, mot pour mot, qu'à l'étape 3.

- [ ] **Step 7 : Commit**

```bash
git add src/utils/password.js src/main.js src/views/loginPage.vue src/views/registerPage.vue src/assets/css/registerPage.css
git commit -m "Verifier les identifiants avant d ouvrir la session et cesser de stocker les mots de passe en clair"
```

---

### Task 6 : Verrouiller l'audit dans la chaîne de déploiement

**Files:**
- Modify: `.github/workflows/pages.yml` (job `build`, entre l'installation et la construction)

**Interfaces:**
- Consumes: le script `npm run audit` de la tâche 1, désormais vert.
- Produces: un déploiement qui échoue si une donnée sensible réapparaît.

- [ ] **Step 1 : Confirmer que l'audit est vert avant de le rendre bloquant**

Run: `npm run audit`

Expected: code 0, `Audit reussi`. Si ce n'est pas le cas, ne pas continuer : une étape des tâches 2 à 5 est incomplète, et brancher l'audit maintenant casserait tous les déploiements.

- [ ] **Step 2 : Ajouter l'étape au workflow**

Dans `.github/workflows/pages.yml`, insérer cette étape entre `Installer les dependances` et `Construire le site` :

```yaml
      - name: Vérifier l'absence de données sensibles
        run: npm run audit
```

Le job `build` doit alors se lire ainsi, dans cet ordre : `checkout`, `setup-node`, `Installer les dependances`, `Verifier l absence de donnees sensibles`, `Construire le site`, `Rediriger les routes profondes vers l'application`, `upload-pages-artifact`.

- [ ] **Step 3 : Vérifier la syntaxe du fichier**

```bash
node -e "const{readFileSync}=require('fs');const t=readFileSync('.github/workflows/pages.yml','utf8');console.log(t.includes('npm run audit')?'etape presente':'etape absente')"
```

Expected: `etape presente`.

- [ ] **Step 4 : Commit**

```bash
git add .github/workflows/pages.yml
git commit -m "Bloquer le deploiement si une donnee sensible reapparait"
```

---

### Task 7 : Fondations du mouvement

**Files:**
- Create: `src/assets/css/motion.css`
- Create: `src/directives/reveal.js`
- Modify: `src/main.js`

**Interfaces:**
- Consumes: rien.
- Produces:
  - `export const reveal` : objet directive Vue exposant `mounted(el, binding)` et `unmounted(el)`, enregistré sous le nom `reveal`, donc utilisable en template sous la forme `v-reveal`.
  - Modificateurs acceptés : `.stagger` (masque les enfants directs et les décale) et `.fondu` (supprime la translation, ne garde que l'opacité).
  - Valeur acceptée : `v-reveal="{ delai: 200 }"`, en millisecondes, ignorée en mode `.stagger`.
  - Contrat CSS : la directive pose l'attribut `data-reveal` sur les éléments à masquer, puis, à l'entrée dans l'écran, la classe `est-revele` sur un élément qui se révèle lui-même, ou `est-revele-groupe` sur un conteneur en mode cascade. Ces deux classes sont volontairement distinctes : un unique sélecteur descendant ferait apparaître d'un coup tout bloc imbriqué dans un bloc déjà révélé. `motion.css` définit le reste.
  - Variables CSS publiées par `motion.css` : `--motion-courbe`, `--motion-duree-revele`, `--motion-distance-revele`, `--motion-duree-sortie`, `--motion-duree-entree`. Régler le mouvement du site entier se fait ici.

- [ ] **Step 1 : Créer la feuille de mouvement**

Créer `src/assets/css/motion.css` :

```css
/* Toutes les valeurs de mouvement du site sont ici.
   Régler l'animation de l'ensemble revient à changer ces cinq variables. */
:root {
  --motion-courbe: cubic-bezier(0.22, 0.61, 0.36, 1);
  --motion-duree-revele: 700ms;
  --motion-distance-revele: 28px;
  --motion-duree-sortie: 220ms;
  --motion-duree-entree: 420ms;
}

/* Révélation au défilement.
   L'état masqué n'est jamais écrit dans le HTML : c'est la directive qui pose
   data-reveal au montage. Sans JavaScript, la page reste entièrement lisible. */
[data-reveal] {
  opacity: 0;
  transform: translateY(var(--motion-distance-revele));
  transition:
    opacity var(--motion-duree-revele) var(--motion-courbe),
    transform var(--motion-duree-revele) var(--motion-courbe);
  transition-delay: var(--reveal-delay, 0ms);
}

/* Deux classes distinctes, et non un sélecteur descendant unique.
   est-revele marque un élément qui se révèle lui-même, est-revele-groupe un
   conteneur qui révèle ses enfants directs. Les confondre ferait apparaître
   d'un coup tout bloc imbriqué dans un autre bloc révélé, par exemple
   final-cta qui vit à l'intérieur de audience sur la page d'accueil. */
[data-reveal].est-revele,
.est-revele-groupe > [data-reveal] {
  opacity: 1;
  transform: none;
}

/* Fondu seul, pour les blocs pleine hauteur où une translation laisserait
   apparaître une bande de fond. */
[data-reveal].fondu {
  transform: none;
}

/* Transition entre les pages.
   Sortie brève et entrée posée : l'ancien contenu libère la place sans se
   faire attendre, le nouveau s'installe. */
.page-leave-active {
  transition:
    opacity var(--motion-duree-sortie) var(--motion-courbe),
    transform var(--motion-duree-sortie) var(--motion-courbe);
}

.page-enter-active {
  transition:
    opacity var(--motion-duree-entree) var(--motion-courbe),
    transform var(--motion-duree-entree) var(--motion-courbe);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(24px);
}

@media (prefers-reduced-motion: reduce) {
  [data-reveal],
  [data-reveal].est-revele,
  .est-revele-groupe > [data-reveal],
  .page-enter-active,
  .page-leave-active,
  .page-enter-from,
  .page-leave-to {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
```

- [ ] **Step 2 : Créer la directive**

Créer `src/directives/reveal.js` :

```js
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
    (entrées) => {
      for (const entrée of entrées) {
        if (!entrée.isIntersecting) continue
        const groupe = entrée.target.dataset.revealGroupe === 'oui'
        entrée.target.classList.add(groupe ? CLASSE_REVELE_GROUPE : CLASSE_REVELE)
        observateur.unobserve(entrée.target)
      }
    },
    {
      // Un bloc s'anime quand il a franchi le bas de l'écran d'environ un
      // huitième de la hauteur de fenêtre.
      threshold: 0.15,
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
```

Note pour la suite : en mode `.stagger`, seuls les enfants présents au montage sont masqués. Un élément ajouté plus tard, comme une nouvelle matière dans la page Révision, apparaît immédiatement sans animation. C'est le comportement souhaité, une matière que l'on vient de créer ne doit pas attendre pour s'afficher.

- [ ] **Step 3 : Enregistrer la directive et importer le CSS**

Dans `src/main.js`, ajouter l'import du CSS après `import './assets/css/global.css'` :

```js
import './assets/css/motion.css'
```

ajouter l'import de la directive après les autres imports :

```js
import { reveal } from './directives/reveal'
```

et remplacer la ligne de montage par :

```js
createApp(App)
  .use(router)
  .directive('reveal', reveal)
  .mount('#app')
```

Le fichier `src/main.js` doit alors se lire ainsi :

```js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import './assets/css/global.css'
import './assets/css/motion.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import lottie from "lottie-web"
import { defineElement } from "@lordicon/element"
import { reveal } from './directives/reveal'
import { purgerAncienStockage } from './utils/password'

// define "lord-icon" custom element with default properties
defineElement(lottie.loadAnimation);

// Efface les mots de passe en clair laissés par la version précédente du site.
purgerAncienStockage()

createApp(App)
  .use(router)
  .directive('reveal', reveal)
  .mount('#app')
```

- [ ] **Step 4 : Vérifier la construction**

Run: `npm run build`

Expected: `built in …`, sans erreur. Aucune animation n'est encore visible : aucune vue ne porte de `v-reveal`.

- [ ] **Step 5 : Commit**

```bash
git add src/assets/css/motion.css src/directives/reveal.js src/main.js
git commit -m "Ajouter la feuille de mouvement et la directive de revelation au defilement"
```

---

### Task 8 : Transition de page et retour en haut

**Files:**
- Create: `src/router/transition-gate.js`
- Modify: `src/router/index.js` (fonction `createRouter`)
- Modify: `src/App.vue` (template et script)
- Modify: `src/views/Professeurs.vue` (déjà traité en tâche 3, vérification seulement)

**Interfaces:**
- Consumes: les classes `page-enter-active`, `page-enter-from`, `page-leave-active`, `page-leave-to` de `motion.css` (tâche 7).
- Produces:
  - `export function attendreSortie(): Promise<void>`
  - `export function signalerSortieTerminee(): void`
  - Le `<Transition>` de `App.vue` porte `name="page"` et `mode="out-in"`, ce qui fixe le préfixe des classes CSS ci-dessus.

- [ ] **Step 1 : Créer le portail de transition**

Créer `src/router/transition-gate.js` :

```js
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

export function attendreSortie() {
  return new Promise((resoudre) => {
    resoudreEnCours = resoudre

    setTimeout(() => {
      if (resoudreEnCours === resoudre) {
        resoudreEnCours = null
        resoudre()
      }
    }, SECURITE_MS)
  })
}

export function signalerSortieTerminee() {
  if (!resoudreEnCours) return

  const resoudre = resoudreEnCours
  resoudreEnCours = null
  resoudre()
}
```

- [ ] **Step 2 : Ajouter le `scrollBehavior` au routeur**

Dans `src/router/index.js`, ajouter l'import après les imports de vues :

```js
import { attendreSortie } from './transition-gate'
```

puis remplacer le bloc `createRouter` par :

```js
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  async scrollBehavior(to, from, savedPosition) {
    // savedPosition n'est renseigné que sur précédent et suivant : on restaure
    // alors exactement ce que l'utilisateur avait sous les yeux.
    const cible = savedPosition ?? (to.hash ? { el: to.hash } : { top: 0 })

    // Premier chargement : aucune transition de sortie ne va se produire,
    // attendre bloquerait le défilement pendant la durée de sécurité.
    if (from.matched.length === 0) return cible

    await attendreSortie()
    return cible
  },
})
```

- [ ] **Step 3 : Envelopper le `router-view` dans une transition**

Remplacer intégralement `src/App.vue` par :

```vue
<template>
  <div id="app">
    <header>
      <NavBar />
    </header>
    <main>
      <router-view v-slot="{ Component, route }">
        <Transition name="page" mode="out-in" @after-leave="signalerSortieTerminee">
          <!-- Ce div n'est pas décoratif, il est indispensable.
               <Transition> ne sait animer qu'un seul élément racine, or
               Revision.vue, Professeurs.vue et Play.vue rendent plusieurs
               nœuds racine. Sans ce conteneur, Vue avertirait que la racine
               ne peut pas être animée et la transition ne jouerait pas sur
               ces trois pages. Le conteneur garantit un élément unique quelle
               que soit la vue, aujourd'hui comme pour celles à venir. -->
          <div :key="route.path" class="page-racine">
            <component :is="Component" />
          </div>
        </Transition>
      </router-view>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import { signalerSortieTerminee } from './router/transition-gate'
</script>
```

`mode="out-in"` évite que deux pages se superposent, et c'est aussi ce qui rend le portail nécessaire et suffisant : la sortie se termine avant que l'entrée commence.

Le `:key="route.path"` est porté par le conteneur et non par le `<component>` : c'est lui qui change d'identité à chaque navigation, donc c'est lui qui doit déclencher la transition.

- [ ] **Step 4 : Vérifier que les ancres de la page Professeurs utilisent bien `id`**

```bash
grep -n 'name="l1"\|name="l2"\|name="l3"' src/views/Professeurs.vue ; echo "code=$?"
grep -n ':id="niveau.toLowerCase()"' src/views/Professeurs.vue
```

Expected: la première commande ne renvoie aucune ligne et affiche `code=1`, la seconde renvoie une ligne. Si la première trouve quelque chose, la tâche 3 est incomplète : le `scrollBehavior` ne saurait pas cibler ces ancres, car `document.querySelector('#l1')` ne trouve pas un attribut `name`.

- [ ] **Step 5 : Vérifier la construction**

Run: `npm run build`

Expected: `built in …`, sans erreur.

- [ ] **Step 6 : Vérifier le comportement dans le navigateur**

Run: `npm run dev`, puis :

1. Depuis l'accueil, défiler jusqu'en bas, cliquer sur Révision dans la barre de navigation. Attendu : la page sortante s'efface sur place sans sauter vers le haut, puis la page Révision apparaît depuis le haut.
2. Cliquer sur le bouton précédent du navigateur. Attendu : retour à l'accueil, à la position de défilement où l'on était.
3. Aller sur Professeurs, cliquer sur `Voir plus sur nous`. Attendu : défilement jusqu'au bloc L1.
4. Ouvrir directement `http://localhost:5173/professeurs#l2`. Attendu : la page s'ouvre positionnée sur le bloc L2, sans attendre.
5. Ouvrir la console. Attendu : aucun avertissement Vue du type `Component inside <Transition> renders non-element root node that cannot be animated`. Si cet avertissement apparaît, le conteneur `page-racine` de l'étape 3 est absent ou mal placé.
6. Revenir sur l'accueil et vérifier que la vidéo du hero occupe toujours toute la hauteur de l'écran. Le conteneur ajouté s'intercale entre `<main>` et la vue : si un jour une règle de mise en page s'appuyait sur cette relation directe, c'est ici que cela se verrait.

- [ ] **Step 7 : Commit**

```bash
git add src/router/transition-gate.js src/router/index.js src/App.vue
git commit -m "Remonter en haut a chaque changement de page et animer la transition"
```

---

### Task 9 : Pose des révélations sur les vues

**Files:**
- Modify: `src/views/Home.vue` (template)
- Modify: `src/views/Revision.vue` (template)
- Modify: `src/views/Ressources.vue` (template)
- Modify: `src/views/Professeurs.vue` (template)
- Modify: `src/views/loginPage.vue` (template et bloc `<style>`)
- Modify: `src/views/registerPage.vue` (template)
- Modify: `src/views/Play.vue` (template)
- Modify: `src/views/RegisterLogin.vue` (template)

**Interfaces:**
- Consumes: la directive `v-reveal` et ses modificateurs `.stagger` et `.fondu` (tâche 7).
- Produces: rien que d'autres tâches consomment.

- [ ] **Step 1 : Accueil**

Dans `src/views/Home.vue`, ajouter les directives sur ces six balises existantes, sans rien changer d'autre :

```html
    <section class="hero" v-reveal.fondu>
```
```html
    <section class="features" v-reveal>
```
```html
      <div class="feature-grid" v-reveal.stagger>
```
```html
    <section class="quote" v-reveal>
```
```html
    <section class="audience" v-reveal>
```
```html
      <section class="final-cta" v-reveal>
```

Le hero reçoit `.fondu` et non une translation : il fait 100vh, et une translation d'entrée sur un bloc de cette taille laisse apparaître une bande de fond en bas de l'écran.

- [ ] **Step 2 : Révision**

Dans `src/views/Revision.vue` :

```html
        <div class="text-appear" v-reveal>
```
```html
    <h1 v-reveal>Mes matières</h1>
```
```html
    <div class="controls" v-reveal>
```
```html
    <div class="grid" v-reveal.stagger>
```

- [ ] **Step 3 : Ressources**

Dans `src/views/Ressources.vue` :

```html
    <aside class="sidebar" v-reveal>
```
```html
      <div class="filters" v-reveal>
```
```html
      <div class="cards" v-reveal.stagger>
```

- [ ] **Step 4 : Professeurs**

Dans `src/views/Professeurs.vue`, tel que réécrit en tâche 3 :

```html
    <section class="card-container" v-reveal>
```
```html
    <div class=".contain" v-reveal>
```
```html
    <div class="team" v-reveal.stagger>
```

La classe `.contain` s'écrit bien avec un point dans l'attribut `class` : c'est une coquille du code d'origine, inoffensive, que ce plan ne corrige pas pour rester dans son périmètre.

- [ ] **Step 5 : Connexion**

Dans `src/views/loginPage.vue` :

```html
    <div class="login-card" v-reveal>
```

Puis retirer l'animation concurrente. Dans le bloc `<style scoped>` du même fichier, supprimer la ligne suivante de la règle `.login-card` :

```css
  animation: popin 0.5s ease;
```

et supprimer intégralement le bloc :

```css
@keyframes popin {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
```

Sans cette suppression, deux animations d'entrée se superposeraient sur le même élément.

- [ ] **Step 6 : Inscription**

Dans `src/views/registerPage.vue` :

```html
    <div class="register-card" v-reveal>
```

Puis vérifier qu'aucune animation d'entrée concurrente n'existe :

```bash
grep -n 'animation\|@keyframes' src/assets/css/registerPage.css
```

Si une animation d'apparition est trouvée sur `.register-card`, la retirer comme à l'étape 5. Si la commande ne renvoie rien, il n'y a rien à faire.

- [ ] **Step 7 : Récréation et page combinée**

Dans `src/views/Play.vue`, ajouter la directive sur le `<div>` qui entoure le composant `vitar` :

```html
    <div v-reveal>
        <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->
        <vitar show-mesh :display="{ scale:1.2, offsetX:0, offsetY:2 }"/>
    </div>
```

Dans `src/views/RegisterLogin.vue`, poser la directive uniquement sur le `<div>` racine :

```html
  <div v-reveal>
```

Ne pas la poser sur `.login-form` ni sur `.signup-form` : ces deux blocs sont déjà animés par un basculement de `clip-path`, et une seconde animation d'opacité entrerait en conflit avec lui.

- [ ] **Step 8 : Vérifier la construction**

Run: `npm run build`

Expected: `built in …`, sans erreur.

- [ ] **Step 9 : Commit**

```bash
git add src/views/
git commit -m "Reveler les blocs au defilement sur toutes les vues"
```

---

### Task 10 : Vérification de bout en bout dans le navigateur

Aucun fichier modifié. Cette tâche constate que l'ensemble fonctionne, et corrige uniquement ce qu'elle révèle de cassé.

**Files:**
- Aucun, sauf correction ponctuelle si un point échoue.

**Interfaces:**
- Consumes: tout ce qui précède.
- Produces: la confirmation que le travail peut être livré.

- [ ] **Step 1 : Lancer le serveur de développement**

Run: `npm run dev`

Expected: `Local: http://localhost:5173/`.

- [ ] **Step 2 : Parcourir les huit routes**

Visiter dans l'ordre `/`, `/revision`, `/ressources`, `/professeurs`, `/amuser`, `/connexion`, `/register`, `/register_login`, en naviguant par la barre de navigation quand c'est possible.

Vérifier pour chacune :
- L'arrivée se fait en haut de page.
- La page sortante ne saute pas avant de s'effacer.
- Aucun bloc ne reste invisible après le passage du défilement.
- La console ne montre aucune erreur nouvelle.

`/register_login` affichera des erreurs au clic sur ses boutons de formulaire : ses méthodes `login` et `register` ne sont pas définies. C'est un défaut préexistant, hors périmètre, à ne pas corriger ici.

- [ ] **Step 3 : Vérifier les cascades**

Sur `/`, `/revision`, `/ressources` et `/professeurs`, défiler lentement et vérifier que les cartes de chaque grille apparaissent les unes après les autres, et non toutes ensemble, puis que remonter ne les fait pas redisparaître.

- [ ] **Step 4 : Vérifier le respect du mouvement réduit**

Dans les outils de développement Chrome : `Ctrl+Maj+P`, taper `reduced motion`, choisir `Emulate CSS prefers-reduced-motion: reduce`. Recharger, puis reparcourir les huit routes.

Expected: aucune animation nulle part, aucun fondu entre les pages, tout le contenu immédiatement visible, et le retour en haut de page toujours fonctionnel.

- [ ] **Step 5 : Vérifier la dégradation sans JavaScript**

Toujours dans les outils de développement, désactiver JavaScript (`Ctrl+Maj+P`, `Disable JavaScript`), puis recharger `/`.

Expected: la page affiche son contenu. L'application Vue ne se montera pas, c'est normal pour une application monopage, mais il ne doit apparaître aucune règle CSS qui masquerait durablement du contenu. Ce point vérifie que l'état masqué vient bien de la directive et non de la feuille de style.

- [ ] **Step 6 : Vérifier le rendu en largeur téléphone**

Activer la barre d'outils d'appareil, choisir une largeur de 390 px, puis reparcourir `/`, `/revision`, `/ressources` et `/professeurs`.

Expected: aucun défilement horizontal, et les animations restent fluides.

- [ ] **Step 7 : Relancer l'audit et la construction une dernière fois**

Run: `npm run audit && npm run build`

Expected: `Audit réussi`, puis `built in …`.

- [ ] **Step 8 : Commit si une correction a été nécessaire**

S'il a fallu corriger quelque chose :

```bash
git add -A
git commit -m "Corriger les defauts releves a la verification en navigateur"
```

Sinon, ne rien committer.

---

### Task 11 : Réécriture de l'historique git

**Opération destructive et irréversible sur le dépôt distant.** Elle ne peut pas être annulée une fois le push effectué.

**Files:**
- Aucun fichier de travail. L'opération porte sur l'historique du dépôt.

**Interfaces:**
- Consumes: toutes les tâches précédentes, terminées et committées. Rien ne doit être ajouté après, sous peine de devoir recommencer.
- Produces: un historique public exempt des anciennes photos et des identifiants de membres Slack.

- [ ] **Step 1 : Vérifier que l'arbre de travail est propre**

```bash
git status --short
git log --oneline -8
```

Expected: aucune ligne pour la première commande. `git filter-repo` refuse de travailler sur un dépôt modifié.

- [ ] **Step 2 : Sauvegarder le dépôt entier**

```bash
cd ..
cp -r projet_dit projet_dit_sauvegarde_avant_reecriture
ls -d projet_dit_sauvegarde_avant_reecriture/.git
cd projet_dit
```

Expected: la dernière commande liste le dossier `.git`, ce qui confirme que la sauvegarde contient bien l'historique et pas seulement les fichiers.

- [ ] **Step 3 : Lister les branches à réécrire**

```bash
git branch -a
```

Noter le résultat. `git filter-repo` réécrit toutes les références du dépôt local, donc chaque branche listée ici sera traitée.

- [ ] **Step 4 : Supprimer les anciennes photos de tout l'historique**

```bash
git filter-repo --force --invert-paths \
  --path src/assets/images/professeurs/adji.webp \
  --path src/assets/images/professeurs/awa.jpg \
  --path src/assets/images/professeurs/deguene.webp \
  --path src/assets/images/professeurs/diallo.webp \
  --path src/assets/images/professeurs/dieng.jpg \
  --path src/assets/images/professeurs/diop.jpg \
  --path src/assets/images/professeurs/dominique.webp \
  --path src/assets/images/professeurs/dr_sylla.webp \
  --path src/assets/images/professeurs/incon.jpg \
  --path src/assets/images/professeurs/jeune.jpg \
  --path src/assets/images/professeurs/marie.jpg \
  --path src/assets/images/professeurs/mrdieng.jpg \
  --path src/assets/images/professeurs/ndiaye.png \
  --path src/assets/images/professeurs/Nico-Robine.jpg \
  --path src/assets/images/professeurs/robert.webp \
  --path src/assets/images/professeurs/sam.jpg \
  --path src/assets/images/professeurs/sampil.jpg \
  --path src/assets/images/professeurs/sarah.webp \
  --path src/assets/images/professeurs/suzanne.webp \
  --path src/assets/images/professeurs/Yor-Forger.jpg
```

- [ ] **Step 5 : Remplacer les chaînes sensibles dans l'historique**

Créer le fichier de règles hors du dépôt, pour ne pas le committer :

```bash
cat > ../remplacements-historique.txt <<'FIN'
regex:https://ditdakar\.slack\.com/team/U[A-Z0-9]+==>#
regex:\+221[ ]?\d{2}[ ]?\d{3}[ ]?\d{2}[ ]?\d{2}==>[numero retire]
regex:https://www\.snapchat\.com/add/[A-Za-z0-9._-]+==>#
regex:https://wa\.me/[A-Za-z0-9/]+==>#
FIN
```

Puis l'appliquer :

```bash
git filter-repo --force --replace-text ../remplacements-historique.txt
```

- [ ] **Step 6 : Vérifier que plus rien de sensible ne subsiste**

```bash
echo "identifiants Slack restants :"
git log --all -p | grep -cE 'ditdakar\.slack\.com/team/U[A-Z0-9]{6,}' || echo 0

echo "numeros de telephone restants :"
git log --all -p | grep -cE '\+221[ ]?[0-9]{2}[ ]?[0-9]{3}' || echo 0

echo "anciennes photos restantes :"
git rev-list --objects --all | grep -cE 'professeurs/(adji|awa|deguene|diallo|dieng|diop|dominique|dr_sylla|incon|jeune|marie|mrdieng|ndiaye|Nico-Robine|robert|sam|sampil|sarah|suzanne|Yor-Forger)\.' || echo 0
```

Expected: `0` pour les trois compteurs.

Le domaine `ditdakar.slack.com` seul subsistera dans le document de spécification et dans le script d'audit, ce qui est voulu : le script doit contenir le motif pour pouvoir le détecter, et le domaine d'un espace de travail est une information publique. Ce sont les identifiants de membres qui étaient sensibles, et c'est eux que les compteurs ci-dessus vérifient.

- [ ] **Step 7 : Vérifier que l'arbre de travail est intact**

```bash
git log --oneline | head -12
npm run audit && npm run build
```

Expected: l'historique est présent avec les mêmes messages de commit, puis `Audit réussi` et `built in …`. La réécriture ne doit avoir changé aucun fichier de l'état courant.

- [ ] **Step 8 : Remettre le dépôt distant**

`git filter-repo` retire `origin` par sécurité, pour empêcher un push accidentel.

```bash
git remote -v
git remote add origin https://github.com/Tsamh/DITMoiTouT.git
git remote -v
```

Expected: la première commande ne renvoie rien, la dernière renvoie les deux lignes `origin`.

- [ ] **Step 9 : ARRÊT OBLIGATOIRE, demander confirmation**

Ne pas exécuter l'étape suivante sans un accord explicite de l'utilisateur, donné maintenant, pour ce push précis.

Lui présenter : le résultat des trois compteurs de l'étape 6, la sortie de `git log --oneline`, et le rappel que le push forcé remplace définitivement l'historique public et redéclenche le déploiement.

- [ ] **Step 10 : Push forcé**

Uniquement après accord explicite :

```bash
git push --force origin principal
```

- [ ] **Step 11 : Demander à GitHub de purger les objets devenus inaccessibles**

Les anciens objets peuvent rester accessibles par leur empreinte pendant un temps. Indiquer à l'utilisateur d'ouvrir un ticket auprès du support GitHub pour demander un `gc` sur `Tsamh/DITMoiTouT`, en mentionnant une réécriture d'historique pour retrait de données personnelles. C'est une action manuelle, qui ne peut pas être automatisée.

- [ ] **Step 12 : Vérifier le redéploiement**

Suivre l'exécution du workflow dans l'onglet Actions du dépôt, puis ouvrir `https://tsamh.github.io/DITMoiTouT/`.

Vérifier : le site se charge, la page Professeurs affiche les nouveaux portraits et les noms fictifs, le pied de page ne contient plus de numéro de téléphone, et la navigation entre pages est animée et repart du haut.

- [ ] **Step 13 : Supprimer la sauvegarde une fois le résultat confirmé**

Uniquement après que l'utilisateur a confirmé que le site déployé est correct :

```bash
rm -rf ../projet_dit_sauvegarde_avant_reecriture ../remplacements-historique.txt
```

---

## Traçabilité par rapport à la spécification

| Section de la spec | Tâche |
|---|---|
| 4, retour en haut de page | 8 |
| 5, transition entre les pages | 8 |
| 6, révélation au défilement | 7 et 9 |
| 7, faille de connexion | 5 |
| 7, mots de passe et purge | 5 |
| 7, page Professeurs | 3 et 4 |
| 7, footer | 2 |
| 7, prévention `.env` | 1 |
| 8, réécriture d'historique | 11 |
| 9, script d'audit et CI | 1, 3 et 6 |
| 9, vérification navigateur | 10 |
