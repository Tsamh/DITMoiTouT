<template>
  <main>
    <!-- HERO SECTION -->
    <section class="hero" v-reveal.fondu>
      <video autoplay loop muted playsinline class="back-video">
        <source src="../assets/videos/background.mp4" />
      </video>
      <section class="content">
        <h1>DITMoiTout</h1>
        <p class="slogan">"Réviser malin, réussissez DITement"</p>
        <router-link to="/revision">Commencer à réviser</router-link>
      </section>
    </section>

    <!-- AVANTAGES -->
    <section class="features" v-reveal>
      <h2>Pourquoi choisir DITMoiTout ?</h2>
      <div class="feature-grid" v-reveal.stagger>
        <div class="feature-item">
          <i class="fas fa-brain"></i>
          <h3>Organisation intelligente</h3>
          <p>Classez vos matières, leçons et progrès avec fluidité.</p>
        </div>
        <div class="feature-item">
          <i class="fas fa-chart-line"></i>
          <h3>Suivi en temps réel</h3>
          <p>Visualisez votre progression et boostez votre motivation.</p>
        </div>
        <div class="feature-item">
          <i class="fas fa-mobile-alt"></i>
          <h3>Responsive & accessible</h3>
          <p>Utilisable sur mobile, tablette ou PC sans installation.</p>
        </div>
      </div>
    </section>

    <!-- CITATION MOTIVANTE -->
    <section class="quote" v-reveal>
      <blockquote>
        “La répétition est la mère de l’apprentissage.”
      </blockquote>
    </section>
    
    
    
    <!-- À propos -->
    <section class="audience" v-reveal>
      <h2>À propos</h2>
      <p>
        Chez DITMoiTout, nous croyons qu'apprendre peut être efficace, ludique et accessible à tous.
        
        Notre mission est de fournir aux étudiants une plateforme claire et organisée pour réviser leurs 
        cours à leur rythme. Grâce à une interface intuitive, des outils de suivi et une approche visuelle, 
        chaque matière devient plus simple à aborder. Nous mettons l’accent sur l’autonomie, la motivation et la progression personnelle. 
        Notre équipe est composée d'étudiants passionnés, à l’écoute des besoins réels de leurs pairs.
      </p>
      
      <!-- CALL TO ACTION -->
      <section class="final-cta" v-reveal>
        <h2>Prêt à booster vos révisions ?</h2>
        <router-link to="/revision" class="cta">Commencer maintenant</router-link>
      </section>
    </section>
  </main>
</template>

<style scoped>
main {
  font-family: 'Poppins', sans-serif;
  line-height: 1.6;
  color: #333;
}

.hero {
  position: relative;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
}

.back-video {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  top: 0;
  left: 0;
  z-index: -1;
}

.hero .content {
  z-index: 10;
}

.cta {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #3B4CCA;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.cta:hover {
  background-color: #2a36a8;
}

.features, .demo-preview, .audience, .quote, .how-it-works, .final-cta {
  padding: 4rem 2rem;
  max-width: 1100px;
  margin: auto;
}

.features h2, .demo-preview h2, .how-it-works h2, .final-cta h2 {
  text-align: center;
  margin-bottom: 2rem;
}

.feature-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
}

.feature-item {
  flex: 1 1 250px;
  background: #f0f4ff;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.feature-item i {
  font-size: 2rem;
  color: #3B4CCA;
  margin-bottom: 1rem;
}

.demo-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
}

.demo-cards .card {
  background-color: #e8f0fe;
  padding: 2rem;
  border-radius: 10px;
  min-width: 200px;
  text-align: center;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.quote blockquote {
  text-align: center;
  font-size: 1.5rem;
  font-style: italic;
  color: #555;
  border-left: 4px solid #3B4CCA;
  padding-left: 1rem;
}

.how-it-works ol {
  list-style: none;
  counter-reset: step;
  padding: 0;
}

.how-it-works li {
  counter-increment: step;
  margin: 1rem 0;
  padding-left: 2rem;
  position: relative;
}

.how-it-works li::before {
  content: counter(step);
  position: absolute;
  left: 0;
  top: 0;
  background: #3B4CCA;
  color: white;
  width: 1.5rem;
  height: 1.5rem;
  text-align: center;
  border-radius: 50%;
}

.final-cta {
  text-align: center;
}


/* avantages */
.container {
  width: 30rem;
  height: 30rem;
  position: relative;
  overflow: hidden;
}

.container img {
  width: 100%;
  transition: all 1s;
}

.vantage {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* center the text */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  transition: all 1s;
  background: rgb(23, 23, 23);
  transform: translateX(-100%);
}

.container:hover .vantage {
  transform: translateX(0);
}

.container:hover img {
  transform: translateX(100%);
}

/* Adaptation aux petits écrans ------------------------------------------------ */
/* Le titre du hero est déjà fluide grâce à clamp() dans global.css : il n'a pas
   besoin de point de rupture. Ne restent que les respirations à resserrer. */
@media screen and (max-width: 738px) {
  .features,
  .demo-preview,
  .audience,
  .quote,
  .how-it-works,
  .final-cta {
    padding: 2.5rem 1.25rem;
  }

  .feature-grid {
    gap: 1.25rem;
  }

  .feature-item {
    padding: 1.5rem;
  }

  .cta {
    /* Zone tactile confortable, et le bouton ne dépasse jamais l'écran. */
    display: inline-block;
    min-height: 44px;
    max-width: 100%;
  }

  blockquote {
    font-size: 1.1rem;
  }
}
</style>
