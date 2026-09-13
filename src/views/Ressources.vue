<template>
  <div class="resources">
    <!-- sidebar matières -->
    <aside class="sidebar" v-reveal>
      <div class="niveau">Licence 1</div>
      <ul class="matieres">
        <li>SIBD 1 (Modélisation conception) </li>
        <li :class="{ active: selected === 'Maths' }">SIBD 2 (SQL)</li>
        <li>Anglais</li>
        <li>Expressions/Communication 1</li>
        <li>
          Système Unix et Installation Linux 
          <span class="arrow"> &gt; </span> <!-- &gt; est le signe > -->
        </li>
        <li>Bases du web</li>
        <li>Langage R</li>
        <li>Algorithmique</li>
        <li>Langage Python</li>
        <VideoPlayer/>
      </ul>
    </aside>

    <!-- contenu principal -->
    <main class="content">
      <!-- filtres -->
      <div class="filters" v-reveal>
        <button class="active">Vidéos (48)</button>
        <button>Livres  (209)</button>
        <button>Quizzs (7)</button>
        <button>Supports de cours (142)</button>
        <button>Devoirs (93)</button>
        <button>Exams (51)</button>
      </div>

      <!-- grille de ressources -->
      <div class="cards" v-reveal.stagger>
        <div class="card" v-for="(item, i) in resources" :key="i">
          <div class="type">Vidéo</div>
          <img :src="item.img" class="thumbnail" />
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
          <div class="card-footer">
            <span>{{ item.duration }}</span>
            <button class="add-btn"><Video/></button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
// import VideoPlayer from '../components/VideoPlayer.vue';

// export default {
//   components: { VideoPlayer }
// };
import Video from '../components/Video.vue';

export default {
  components: {
    Video
  }
};

</script>
<script setup>
import { ref } from 'vue';
// import PDF from "pdf-vue3"

const selected = ref('Maths');
const resources = ref([
  {
    title: "MySQL",
    desc: "Installez MySQL et mettez en place vos premières bases de données",
    duration: "4min",
    img: "https://www.elbuild.it/assets/img/techs/mysql.png"
  },
  {
    title: "Les requêtes SQL",
    desc: "Apprenez à écrire vos premières requêtes SQL",
    duration: "4min",
    img: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fne949fb9osdwajocvsnd.jpeg"
  },
  {
    title: "SQL et NoSQL",
    desc: "Apprenez les différences entre le SQL et le NoSQL",
    duration: "10min",
    img: "https://wata.es/wp-content/uploads/2024/11/wata-ilNOSQLons-Recovered-1.png"
  },
  {
    title: "Les triggers en SQL",
    desc: "Comment créer des tables triggers",
    duration: "8min",
    img: "data:image/jpeg;base64,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"
  },
  {
    title: "Les jointures",
    desc: "Tout savoir sur les jointures",
    duration: "3min",
    img: "https://cdn.prod.website-files.com/60ec34540d013784844d2ee2/67122f792d36c11d0809c40c_Jointures%20SQL.png"
  },
  {
    title: "Les bases en SQL",
    desc: "SQL pour débutants, apprenez les bases",
    duration: "14min",
    img: "https://cdn.prod.website-files.com/65f854814fd223fc3678ea53/65f854814fd223fc3678f15a_Foreign_Key.png"
  },
  {
    title: "Programmation Systèmes avec C et Unix",
    desc: "Les cours IA - Licence",
    duration: "29min",
    img: "https://static01.nyt.com/images/2022/04/04/multimedia/15ai-nocode/15ai-nocode-videoSixteenByNine3000.jpg?year=2022&h=1687&w=3000&s=00efe62e54ad17f8fbeda724cbabe3638e9f99f1319ee13473f6c0cd0db45267&k=ZQJBKqZ0VN&tw=1"
  },
  {
    title: "Initiation à l’Intelligence Artificielle avec Python",
    desc: "Simplex ou comment la programmation peut...",
    duration: "4min",
    img: "data:image/png;base64,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"
  },
  {
    title: "Initiation à l’Intelligence Artificielle avec Python",
    desc: "Simplex ou comment la programmation peut...",
    duration: "4min",
    img: "https://techcrunch.com/wp-content/uploads/2015/04/codecode.jpg?resize=1200,800"
  },
]);

</script>

<style scoped>
.resources {
  display: flex;
  background: #f1eae2;
  min-height: 100vh;
  font-family: 'Segoe UI', sans-serif;
}

.sidebar {
    margin: 150px 50px 5px 20px ;
  width: 230px;
  background: #fff;
  padding: 1rem;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.niveau {
  background: #3b4cca;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  font-weight: bold;
  margin-bottom: 1rem;
}

.matieres {
  list-style: none;
  padding: 0;
}

.matieres li {
  padding: 1rem;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.matieres li.active {
  color: #3b4cca;
  font-weight: bold;
}

.arrow {
  background: #3b4cca;
  color: white;
  padding: 0 6px;
  border-radius: 50%;
}

.content {
  flex: 1;
  padding: 2rem;
  margin-top: 150px ;
}

.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.filters button {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 20px;
  background: #eee;
  cursor: pointer;
  font-weight: 500;
  box-shadow: 0px 1px 10px 0px
}

.filters button.active {
  background: black;
  color: white;
}

.cards {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.card {
  background: white;
  border-radius: 15px;
  padding: 1rem;
  width: 300px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0px 1px 10px 0px;
  transition : transform 0.2s;
}

.card:hover {
  transform: scale(1.05);
}

.thumbnail {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 0.8rem;
}

.type {
  background: black;
  color: white;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 5px;
  width: fit-content;
  margin-bottom: 0.5rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.8rem;
}

.add-btn {
  background: white;
  border: 2px solid black;
  border-radius: 50%;
  font-size: 1.2rem;
  /* padding: 8 8px; */
  cursor: pointer;
  line-height: 1.2;
}


</style>
