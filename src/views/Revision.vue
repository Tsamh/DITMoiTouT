<template>
  <div class="revision">
    <!-- Ecran 1 : choix de la technique de revision -->
    <section v-if="!technique" class="etape" v-reveal>
      <p class="surtitre">Révision</p>
      <h1>Comment voulez-vous réviser ?</h1>
      <p class="chapeau">
        Choisissez une méthode. Vous pourrez en changer à tout moment.
      </p>

      <div class="grille-techniques" v-reveal.stagger>
        <article
          v-for="t in techniques"
          :key="t.id"
          class="carte-technique"
          :class="{ indisponible: !t.disponible }"
        >
          <span class="pastille"><i class="fa-solid" :class="t.icone" aria-hidden="true"></i></span>
          <h2>{{ t.nom }}</h2>
          <p>{{ t.description }}</p>
          <button
            v-if="t.disponible"
            type="button"
            class="action"
            @click="technique = t.id"
          >Commencer</button>
          <span v-else class="bientot">Bientôt disponible</span>
        </article>
      </div>
    </section>

    <!-- Ecran 2 : choix de la classe, avant toute matiere -->
    <section v-else-if="!classe" class="etape" v-reveal>
      <button type="button" class="retour" @click="technique = null">
        <i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Changer de méthode
      </button>
      <p class="surtitre">Suivi du temps</p>
      <h1>Quelle classe révisez-vous ?</h1>
      <p class="chapeau">Les matières affichées seront celles de cette classe.</p>

      <div class="grille-classes" v-reveal.stagger>
        <button
          v-for="c in CLASSES"
          :key="c"
          type="button"
          class="carte-classe"
          :disabled="!matieresDe(c).length"
          @click="choisirClasse(c)"
        >
          <span class="niveau">{{ c }}</span>
          <span class="nb">
            {{ matieresDe(c).length ? matieresDe(c).length + ' matières' : 'à renseigner' }}
          </span>
        </button>
      </div>
    </section>

    <!-- Ecran 3 : le suivi du temps proprement dit -->
    <section v-else class="etape" v-reveal>
      <button type="button" class="retour" @click="classe = null">
        <i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Changer de classe
      </button>
      <p class="surtitre">Suivi du temps · {{ classe }}</p>
      <h1>Mes matières</h1>

      <div class="recherche" v-reveal>
        <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
        <label class="visuellement-cache" for="rech-rev">Rechercher une matière</label>
        <input id="rech-rev" v-model="recherche" type="search" placeholder="Rechercher une matière" />
        <button
          v-if="recherche"
          type="button"
          class="effacer"
          aria-label="Effacer la recherche"
          @click="recherche = ''"
        ><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
      </div>

      <div class="controls" v-reveal>
        <input v-model="nouvelleMatiere" placeholder="Ajouter une matière" @keyup.enter="ajouterMatiere" />
        <button type="button" @click="ajouterMatiere">
          <i class="fa-solid fa-plus" aria-hidden="true"></i> Ajouter
        </button>
        <button type="button" @click="trier(1)">
          <i class="fa-solid fa-arrow-down-a-z" aria-hidden="true"></i> A vers Z
        </button>
        <button type="button" @click="trier(-1)">
          <i class="fa-solid fa-arrow-up-a-z" aria-hidden="true"></i> Z vers A
        </button>
      </div>

      <div class="grid" v-reveal.stagger>
        <article
          v-for="m in matieresAffichees"
          :key="m.id"
          class="subject-card"
          @click="selection = m"
        >
          <button
            v-if="m.ajoutee"
            type="button"
            class="delete-btn"
            aria-label="Retirer cette matière"
            @click.stop="retirer(m)"
          ><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>

          <span class="icone-matiere">
            <i class="fa-solid" :class="iconeMatiere(m.nom)" aria-hidden="true"></i>
          </span>

          <h2 class="title">{{ m.nom }}</h2>

          <div class="progress-bar">
            <div class="progress" :style="{ width: progression(m) + '%' }"></div>
          </div>
          <small>{{ progression(m) }}%</small>

          <p class="message">{{ message(m) }}</p>

          <div class="timer" @click.stop>
            <span class="chrono">
              <i class="fa-regular fa-clock" aria-hidden="true"></i>
              {{ formaterChrono(chronos[m.id]) }}
            </span>
            <div class="timer-buttons">
              <button type="button" aria-label="Démarrer" @click="demarrer(m.id)">
                <i class="fa-solid fa-play" aria-hidden="true"></i>
              </button>
              <button type="button" aria-label="Mettre en pause" @click="pause(m.id)">
                <i class="fa-solid fa-pause" aria-hidden="true"></i>
              </button>
              <button type="button" aria-label="Remettre à zéro" @click="remettreAZero(m.id)">
                <i class="fa-solid fa-rotate-left" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- Lecons de la matiere selectionnee -->
    <Transition name="page">
      <div v-if="selection" class="subtasks-overlay" @click.self="selection = null">
        <div class="subtasks-popup">
          <button type="button" class="close-btn" aria-label="Fermer" @click="selection = null">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
          <h2>{{ selection.nom }}</h2>
          <ul>
            <li v-for="l in leconsDe(selection)" :key="l.id">
              <label>
                <input type="checkbox" v-model="l.faite" />
                <span>{{ l.titre }}</span>
              </label>
              <button type="button" class="delete-sub" aria-label="Supprimer la leçon" @click="supprimerLecon(l.id)">
                <i class="fa-solid fa-trash" aria-hidden="true"></i>
              </button>
            </li>
            <li v-if="!leconsDe(selection).length" class="aucune">Aucune leçon pour le moment.</li>
          </ul>
          <div class="ajout-lecon">
            <input v-model="nouvelleLecon" placeholder="Nouvelle leçon" @keyup.enter="ajouterLecon" />
            <button type="button" @click="ajouterLecon">Ajouter</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onBeforeUnmount } from 'vue'
import { CLASSES, matieresDe } from '@/data/ressources'
import { techniques, iconeMatiere } from '@/data/techniques'

const technique = ref(null)
const classe = ref(null)
const selection = ref(null)
const nouvelleMatiere = ref('')
const nouvelleLecon = ref('')
const recherche = ref('')
const sens = ref(0)

// Matieres ajoutees a la main par l'utilisateur, par classe.
const ajouts = reactive({})
// Lecons et chronos, indexes par identifiant de matiere.
const lecons = reactive({})
const chronos = reactive({})
const intervalles = {}

function choisirClasse(c) {
  if (!matieresDe(c).length) return
  classe.value = c
}

// Recherche insensible a la casse et aux accents : taper "mathematiques" doit
// trouver "Mathematiques" comme "Mathématiques".
function normaliser(texte) {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

const matieresAffichees = computed(() => {
  if (!classe.value) return []
  const base = matieresDe(classe.value).map((m) => ({ ...m, ajoutee: false }))
  const perso = (ajouts[classe.value] ?? []).map((m) => ({ ...m, ajoutee: true }))
  let liste = [...base, ...perso]
  const q = normaliser(recherche.value)
  if (q) liste = liste.filter((m) => normaliser(m.nom).includes(q))
  if (sens.value) liste.sort((a, b) => sens.value * a.nom.localeCompare(b.nom))
  return liste
})

function trier(direction) {
  sens.value = direction
}

function ajouterMatiere() {
  const nom = nouvelleMatiere.value.trim()
  if (!nom || !classe.value) return
  if (!ajouts[classe.value]) ajouts[classe.value] = []
  ajouts[classe.value].push({ id: `perso-${classe.value}-${Date.now()}`, nom })
  nouvelleMatiere.value = ''
}

function retirer(m) {
  const liste = ajouts[classe.value] ?? []
  const i = liste.findIndex((x) => x.id === m.id)
  if (i !== -1) liste.splice(i, 1)
  if (selection.value && selection.value.id === m.id) selection.value = null
}

// Lecons ---------------------------------------------------------------------

function leconsDe(m) {
  if (!lecons[m.id]) lecons[m.id] = []
  return lecons[m.id]
}

function ajouterLecon() {
  const titre = nouvelleLecon.value.trim()
  if (!titre || !selection.value) return
  leconsDe(selection.value).push({ id: `l-${Date.now()}`, titre, faite: false })
  nouvelleLecon.value = ''
}

function supprimerLecon(id) {
  const liste = leconsDe(selection.value)
  const i = liste.findIndex((l) => l.id === id)
  if (i !== -1) liste.splice(i, 1)
}

function progression(m) {
  const liste = lecons[m.id] ?? []
  if (!liste.length) return 0
  return Math.round((liste.filter((l) => l.faite).length / liste.length) * 100)
}

function message(m) {
  const liste = lecons[m.id] ?? []
  const faites = liste.filter((l) => l.faite).length
  if (!liste.length) return 'Ajoutez vos leçons pour suivre votre avancée.'
  if (faites === liste.length) return 'Matière terminée. Bravo.'
  if (faites === liste.length - 1) return 'Plus qu’une leçon, vous y êtes presque.'
  return `${faites} leçon${faites > 1 ? 's' : ''} sur ${liste.length}.`
}

// Chronos --------------------------------------------------------------------

function demarrer(id) {
  if (intervalles[id]) return
  if (!chronos[id]) chronos[id] = 0
  intervalles[id] = setInterval(() => {
    chronos[id] = (chronos[id] ?? 0) + 1
  }, 1000)
}

function pause(id) {
  clearInterval(intervalles[id])
  intervalles[id] = null
}

function remettreAZero(id) {
  pause(id)
  chronos[id] = 0
}

function formaterChrono(secondes) {
  const s = secondes ?? 0
  const h = String(Math.floor(s / 3600)).padStart(2, '0')
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const r = String(s % 60).padStart(2, '0')
  return `${h}:${m}:${r}`
}

// Les chronos survivaient au depart de la page dans la version precedente :
// autant d'intervalles laisses tourner pour rien.
onBeforeUnmount(() => {
  for (const id of Object.keys(intervalles)) clearInterval(intervalles[id])
})
</script>

<style scoped src="../assets/css/revision.css"></style>
