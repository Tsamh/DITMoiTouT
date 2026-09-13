<template>
  <div id="app">
    <header>
      <NavBar />
    </header>
    <main>
      <router-view v-slot="{ Component, route }">
        <Transition name="page" mode="out-in" @after-leave="(el) => signalerSortieTerminee(el.dataset.route)">
          <!-- Ce div n'est pas décoratif, il est indispensable.
               <Transition> ne sait animer qu'un seul élément racine, or
               Revision.vue, Professeurs.vue et Play.vue rendent plusieurs
               nœuds racine. Sans ce conteneur, Vue avertirait que la racine
               ne peut pas être animée et la transition ne jouerait pas sur
               ces trois pages. Le conteneur garantit un élément unique quelle
               que soit la vue, aujourd'hui comme pour celles à venir. -->
          <div :key="route.path" :data-route="route.path" class="page-racine">
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
