
<template>
  
  <h1>&nbsp</h1>
  
  <div class="container">
    <!-- services -->

        <div class="text-appear">
          <p>
            <span>
              Allez
            </span>
          </p>
          <p>
            <span>
              &nbsp |&nbspREVISONS!
            </span>
          </p>
        </div>
    <h1>Mes matières</h1>

    <!-- Barre d'actions -->
    <div class="controls">
      <input v-model="newTaskTitle" placeholder="Nouvelle matière" />
      <button @click="addTask">Ajouter matière</button>

      <button @click="sortAsc">Trier A → Z</button>
      <button @click="sortDesc">Trier Z → A</button>
    </div>

    <!-- Grille des matières -->
    <div class="grid">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="subject-card"
        :style="{ backgroundColor: task.color }"
        @click="selectTask(task)"
      >
        <!-- Bouton supprimer matières -->
        <button class="delete-btn" @click.stop="deleteTask(task.id)">✖</button>
        
        <!-- Icône générique -->
        <div class="icon">📘</div>
        
        <!-- Titre -->
        <div class="title">{{ task.title }}</div>
        
        <!-- Barre de progression -->
        <div class="progress-bar">
          <div
          class="progress"
          :style="{ width: computeProgress(task) + '%' }"
          ></div>
        </div>
        <small>{{ computeProgress(task) }}%</small>

        <p class="message">{{ getMessage(task) }}</p>

        <!-- timer -->
        <div class="timer">
          <!-- icone horloge-->  
          <lord-icon
            src="https://cdn.lordicon.com/gdowkrjt.json"
            trigger="hover"
            colors="primary:#121331,secondary:#ebe6ef,tertiary:#4bb3fd,quaternary:#16c72e"
            style="width:20px;height:20px">
          </lord-icon> {{ formatTimer(timers[task.id]) }}
            
          <div class="timer-buttons">

             <!-- icone commencer--> 
            <button @click.stop="startTimer(task.id)">
              <h1 class="play">▶️</h1>
            </button>

             <!-- icone pause--> 
            <button @click.stop="pauseTimer(task.id)">
              <lord-icon
                src="https://cdn.lordicon.com/dngztxbn.json"
                trigger="hover"
                style="width:20px;height:20px">
              </lord-icon>
            </button>
             <!-- icone reinitialiser--> 
            <button @click.stop="resetTimer(task.id)">
              <lord-icon
                src="https://cdn.lordicon.com/uewczsuz.json"
                trigger="hover"
                style="width:20px;height:20px">
              </lord-icon>
            </button>

          </div>
        </div>

      </div>
    </div>
    
    
    <!-- Sous-tâches -->
   <transition name="fade">
      <div v-if="selectedTask" class="subtasks-overlay">
        <div class="subtasks-popup">
          <button class="close-btn" @click="selectedTask = null">✖</button>
          <h2>{{ selectedTask.title }}</h2>
          <ul>
            <li v-for="sub in selectedTask.subtasks" :key="sub.id">
              <input type="checkbox" v-model="sub.done" />
              {{ sub.title }}
              <button class="delete-sub" @click="deleteSubtask(sub.id)">🗑</button>
            </li>
          </ul>
          <input v-model="newSubtaskTitle" placeholder="Nouvelle leçon" />
          <button @click="addSubtask">Ajouter</button>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>

export default {
  data() {
    return {
      tasks: [
        {
          id: 1,
          title: "MATHS",
          color: "#3B4CCA",
          subtasks: [
            { id: 1, title: "Sous espace vectoriel", done: true },
            { id: 2, title: "Matrices", done: false }
          ]
        },
        {
          id: 2,
          title: "Système Unix",
          color: "#00BCD4",
          subtasks: []
        },
        {
          id: 3,
          title: "Python",
          color: "#F28C8C",
          subtasks: [
            { id: 1, title: "Dictionnaires", done: true },
            { id: 2, title: "Fonctions", done: false }
          ]
        },
        {
          id: 4,
          title: "SQL",
          color: "#FFA726",
          subtasks: [
            { id: 1, title: "Triggers", done: true },
            { id: 2, title: "Notion des tables", done: false }
          ]
        },
        {
          id: 5,
          title: "Anglais",
          color: "#9575CD",
          subtasks: [
            { id: 1, title: "Present simple", done: true },
            { id: 2, title: "Present continuous", done: false }
          ]
        },
        {
          id: 6,
          title: "Bases du web",
          color: "#F06292",
          subtasks: [
            { id: 1, title: "HTML", done: true },
            { id: 2, title: "CSS", done: false }
          ]
        },
        {
          id: 7,
          title: "Langage R",
          color: "#F06292",
          subtasks: [
            { id: 1, title: "Les vecteurs", done: true },
            { id: 2, title: "Les plots", done: false }
          ]
        },
        {
          id: 8,
          title: "Algorithmique",
          color: "#4DD0E1",
          subtasks: [
            { id: 1, title: "Les conditions", done: true },
            { id: 2, title: "Les boucles", done: false }
          ]
        },
      ],
      timers: {},         // Stocke { taskId: { hours, minutes, seconds } }
      intervals: {},      // Stocke les setInterval actifs pour chaque tâche
      selectedTask: null,
      newTaskTitle: "",
      newSubtaskTitle: "",
      nextTaskId: 3,
      colors: ["#3B4CCA", "#00BCD4", "#F28C8C", "#FFA726", "#9575CD", "#F06292", "#FFD54F", "#4DD0E1"]
    };
  },
  methods: {
    selectTask(task) {
      this.selectedTask = task;
    },
    
    // Ajouter
    addTask() {
      const title = this.newTaskTitle.trim();
      if (title === "") return;

      this.tasks.push({
        id: this.nextTaskId++,
        title: title.toUpperCase(),
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        subtasks: []
      });
      this.newTaskTitle = "";
    },

    // Supprimer matiere
    deleteTask(id) {
      this.tasks = this.tasks.filter(task => task.id !== id);
      if (this.selectedTask && this.selectedTask.id === id) {
        this.selectedTask = null;
      }
    },
    
    // Ajouter lecon
    addSubtask() {
      if (this.newSubtaskTitle.trim() === "") return;

      const newId = this.selectedTask.subtasks.length + 1;
      this.selectedTask.subtasks.push({
        id: newId,
        title: this.newSubtaskTitle,
        done: false
      });

      this.newSubtaskTitle = "";
    },
    
     deleteSubtask(subId) {
      this.selectedTask.subtasks = this.selectedTask.subtasks.filter(sub => sub.id !== subId);
    },
    // Barre de progression
    computeProgress(task) {
      if (!task.subtasks.length) return 0;
      const completed = task.subtasks.filter(sub => sub.done).length;
      return Math.round((completed / task.subtasks.length) * 100);
    },

    // Trier
    sortAsc() {
      this.tasks.sort((a, b) => a.title.localeCompare(b.title));
    },
    sortDesc() {
      this.tasks.sort((a, b) => b.title.localeCompare(a.title));
    },

    // timer
    startTimer(taskId) {
  if (this.intervals[taskId]) return;

  if (!this.timers[taskId]) {
    this.timers[taskId] = { hours: 0, minutes: 0, seconds: 0 };
  }

  this.intervals[taskId] = setInterval(() => {
    let time = this.timers[taskId];
    time.seconds++;

    if (time.seconds === 60) {
      time.seconds = 0;
      time.minutes++;
    }

    if (time.minutes === 60) {
      time.minutes = 0;
      time.hours++;
    }
  }, 1000);
},

pauseTimer(taskId) {
  clearInterval(this.intervals[taskId]);
  this.intervals[taskId] = null;
},

resetTimer(taskId) {
  this.pauseTimer(taskId);
  this.timers[taskId] = { hours: 0, minutes: 0, seconds: 0 };
},

formatTimer(time) {
  if (!time) return "00:00:00";
  const h = String(time.hours).padStart(2, "0");
  const m = String(time.minutes).padStart(2, "0");
  const s = String(time.seconds).padStart(2, "0");
  return `${h}:${m}:${s}`;
},
getMessage(task) {
    const total = task.subtasks.length;
    const doneCount = task.subtasks.filter(sub => sub.done).length;

    if (total === 0) {
      // Pas de leçon ajoutée
      return "Vous n'avez pas encore de leçon ajoutée... (►__◄)";
    }
    if (doneCount === total) {
      // Toutes les leçons cochées
      return "（づ￣3￣）づ❤️～Félicitations ! Vous avez terminé la révision de cette matière 🤩";
    }
    if (doneCount === total - 1) {
      // Toutes sauf une cochées
      return "Allez-y, vous y êtes presque ! 🫣";
    }
    if (total > 1) {
      // Plus d'une leçon ajoutée
      return "Bravo, vous avez plusieurs leçons... ヾ(＠⌒‿⌒＠)ノ";
    }
    // (Optionnel) Cas d'une seule leçon non cochée 
    return "";
  }

  }
};

</script>

<style scoped src="../assets/css/revision.css"></style>
