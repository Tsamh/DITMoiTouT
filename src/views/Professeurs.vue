<template>
  <h1>&nbsp;</h1>
  <main>
    <section class="card-container" v-reveal>
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
    <div class=".contain" v-reveal>
      <button class="container">
        {{ niveau }}
        <!-- Ancre id et non name : name est obsolète et introuvable par querySelector,
             donc le scrollBehavior du routeur ne saurait pas la cibler. -->
        <a :id="niveau.toLowerCase()" :class="ancre(index)"></a>
      </button>
    </div>

    <div class="team" v-reveal.stagger>
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
