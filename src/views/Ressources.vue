<template>
  <div class="ressources">
    <header class="entete" v-reveal>
      <p class="surtitre">Ressources</p>
      <h1>Vos cours, classés par classe et par matière</h1>

      <!-- Navigation par classe, directement sur la page : plus besoin de
           passer par le survol du menu pour changer de niveau. -->
      <nav class="onglets-classe" aria-label="Choix de la classe">
        <button
          v-for="c in CLASSES"
          :key="c"
          type="button"
          class="onglet"
          :class="{ actif: classe === c }"
          :aria-pressed="classe === c ? 'true' : 'false'"
          @click="choisirClasse(c)"
        >{{ c }}</button>
      </nav>
    </header>

    <div class="corps">
      <aside class="sidebar" v-reveal>
        <h2 class="titre-colonne">Matières</h2>

        <div class="recherche">
          <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <label class="visuellement-cache" for="rech-matiere">Rechercher une matière</label>
          <input id="rech-matiere" v-model="recherche" type="search" placeholder="Rechercher une matière" />
          <button
            v-if="recherche"
            type="button"
            class="effacer"
            aria-label="Effacer la recherche"
            @click="recherche = ''"
          ><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
        </div>

        <p v-if="!listeMatieres.length" class="vide-matieres">
          Les matières de {{ classe }} ne sont pas encore renseignées.
        </p>

        <p v-else-if="!matieresFiltrees.length" class="vide-matieres">
          Aucune matière ne correspond à « {{ recherche }} ».
        </p>

        <ul v-else class="matieres">
          <li v-for="m in matieresFiltrees" :key="m.id">
            <button
              type="button"
              class="lien-matiere"
              :class="{ actif: matiere && matiere.id === m.id }"
              @click="matiere = m"
            >
              <span>{{ m.nom }}</span>
              <span class="compte">{{ compteParMatiere[m.id] || 0 }}</span>
            </button>
          </li>
        </ul>
      </aside>

      <main class="contenu">
        <div class="filtres" v-reveal>
          <button
            v-for="t in TYPES"
            :key="t.id"
            type="button"
            :class="{ active: type === t.id }"
            @click="type = t.id"
          >
            <i class="fa-solid" :class="t.icone" aria-hidden="true"></i>
            {{ t.nom }}
            <span class="pastille-compte">{{ compteParType[t.id] || 0 }}</span>
          </button>
        </div>

        <p v-if="matiere" class="fil">{{ classe }} <span aria-hidden="true">›</span> {{ matiere.nom }}</p>

        <div v-if="documents.length" class="cards" v-reveal.stagger>
          <article class="card" v-for="doc in documents" :key="doc.url">
            <div class="type">{{ libelleType }}</div>
            <h3>{{ doc.nom }}</h3>
            <div class="card-footer">
              <a class="action" :href="doc.url" target="_blank" rel="noopener">Lire</a>
              <a class="action secondaire" :href="doc.url" :download="doc.fichier">Télécharger</a>
            </div>
          </article>
        </div>

        <p v-else class="vide">
          <i class="fa-regular fa-folder-open" aria-hidden="true"></i>
          <span v-if="!matiere">Choisissez une matière dans la colonne de gauche.</span>
          <span v-else>Aucun document pour le moment dans {{ libelleType.toLowerCase() }} de {{ matiere.nom }}.</span>
        </p>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CLASSES, TYPES, matieresDe } from '@/data/ressources'

const route = useRoute()
const router = useRouter()

// Vite parcourt l'arborescence a la construction : deposer un PDF dans le bon
// dossier suffit pour qu'il apparaisse, sans fichier de catalogue a tenir a jour.
const fichiers = import.meta.glob('../assets/ressources/**/*.{pdf,mp4}', {
  eager: true,
  query: '?url',
  import: 'default',
})

// Chaque chemin a la forme .../ressources/<classe>/<dossier>/<type>/<fichier>
const catalogue = Object.entries(fichiers).map(([chemin, url]) => {
  const parts = chemin.split('/')
  const fichier = parts[parts.length - 1]
  return {
    classe: parts[parts.length - 4],
    dossier: parts[parts.length - 3],
    type: parts[parts.length - 2],
    fichier,
    nom: fichier.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '),
    url,
  }
})

const classe = ref(CLASSES.includes(route.query.classe) ? route.query.classe : 'L1')
const recherche = ref('')
const listeMatieres = computed(() => matieresDe(classe.value))

// Recherche insensible a la casse et aux accents : taper "modelisation" doit
// trouver "Modélisation et conception", sinon la barre ne sert a rien.
function normaliser(texte) {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

const matieresFiltrees = computed(() => {
  const q = normaliser(recherche.value)
  if (!q) return listeMatieres.value
  return listeMatieres.value.filter((m) => normaliser(m.nom).includes(q))
})
const matiere = ref(listeMatieres.value[0] ?? null)
const type = ref(TYPES[0].id)

const libelleType = computed(() => TYPES.find((t) => t.id === type.value)?.nom ?? '')

const documents = computed(() => {
  if (!matiere.value) return []
  return catalogue.filter(
    (d) => d.classe === classe.value && d.dossier === matiere.value.dossier && d.type === type.value,
  )
})

// Compteurs affiches a cote des matieres et des filtres, pour qu'on voie d'un
// coup d'oeil ou il y a quelque chose a lire.
const compteParMatiere = computed(() => {
  const total = {}
  for (const m of listeMatieres.value) {
    total[m.id] = catalogue.filter((d) => d.classe === classe.value && d.dossier === m.dossier).length
  }
  return total
})

const compteParType = computed(() => {
  const total = {}
  for (const t of TYPES) {
    total[t.id] = matiere.value
      ? catalogue.filter(
          (d) => d.classe === classe.value && d.dossier === matiere.value.dossier && d.type === t.id,
        ).length
      : 0
  }
  return total
})

function choisirClasse(c) {
  classe.value = c
  router.replace({ query: { ...route.query, classe: c } })
}

// Changer de classe remet la selection sur la premiere matiere disponible,
// sinon on garderait une matiere qui n'appartient plus a la classe affichee.
watch(listeMatieres, (liste) => {
  matiere.value = liste[0] ?? null
})

// Le menu de la barre de navigation pointe vers /ressources?classe=L2 : on suit
// ce parametre quand il change sans que la page soit remontee.
watch(
  () => route.query.classe,
  (valeur) => {
    if (CLASSES.includes(valeur) && valeur !== classe.value) classe.value = valeur
  },
)

onMounted(() => {
  if (!CLASSES.includes(route.query.classe)) {
    router.replace({ query: { ...route.query, classe: classe.value } })
  }
})
</script>

<style scoped src="../assets/css/ressources.css"></style>
