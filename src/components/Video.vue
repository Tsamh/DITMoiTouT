<template>
  <div>
    <div class="image-container">
      <img src="../assets/images/icones/vp2.png" class="btn" @click="toggleVideo" />
    </div>

    <div class="video-container" :class="{ active: !isActive }">
      <video ref="video" src="../assets/videos/cours/14-Les_jointures_internes.mp4" controls></video>
      <p class="close-icon" @click="closeVideo">X</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoComponent',
  data() {
    return {
      isActive: false
    };
  },
  methods: {
    toggleVideo() {
      this.isActive = true;
    },
    closeVideo() {
      this.isActive = false;
      this.$refs.video.pause();
      this.$refs.video.currentTime = 0;
    }
  }
};
</script>

<style scoped>
img {
  width: 50px;
  cursor: pointer;
}
img:hover{    
  animation-name: bounce;
  animation-duration: 1s;
  animation-timing-function: ease-in;
  animation-iteration-count: infinite;
}
@keyframes bounce {
  0% {
    transform: translateY(0);
    animation-timing-function: ease-out;
  }
  50% {
    transform: translateY(-5px);
    animation-timing-function: ease-in;
  }
  100% {
    transform: translateY(0);
    animation-timing-function: ease-out;
  }
}


.video-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #000;
  width: 10%;
  height: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 1;
  transition: opacity 0.7s;
  z-index: 20;
}

.video-container video {
  position: relative;
  max-width: 900px;
  outline: none;
}

.close-icon {
  position: absolute;
  top: -220px;
  right: -350px;
  color: #118a21;
  font-size: 40px;
  cursor: pointer;
  font-family: sans-serif;
  padding: 10px;
  border-radius: 100%;
}

@media (max-width: 991px) {
  .video-container video {
    max-width: 90%;
  }
}

.active.video-container {
  visibility: hidden;
  opacity: 0;
}
</style>
