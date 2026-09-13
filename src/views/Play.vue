<template>
    <h1>&nbsp</h1>
    <h1>&nbsp</h1>
    <h1>&nbsp</h1>
    <h1>&nbsp</h1>
    <h1>&nbsp</h1>
    <h1>&nbsp</h1>
    <h1>&nbsp</h1>
    <h1>&nbsp</h1>
    <h1>&nbsp</h1>
    <h1>&nbsp</h1>
    <h1>&nbsp</h1>
    <h1>&nbsp</h1>
    <h1>&nbsp</h1>
    <h1>&nbsp</h1>
    <h1>&nbsp</h1>
    <h1>&nbsp</h1>
    <h1>&nbsp</h1>
    <h1>&nbsp</h1>
    <h1>&nbsp</h1>
    <div v-reveal>
        <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->
        <vitar show-mesh :display="{ scale:1.2, offsetX:0, offsetY:2 }"/>
    </div>
    <!-- <Footer v-if="$route.path !== '/amuser'"></Footer> -->
</template>
<script>
import HLSCore from '@cloudgeek/playcore-hls';
import PictureInPicture from '../components/PictureInPicture.vue';
import { Vitar } from '@cloudgeek/vitar';

export default {
  name: 'App',
  components: {
    PictureInPicture,
    Vitar,
  },
  data() {
    return {
      players: {},
      HLSCore,
      volume: 80,
      source:
        '../assets/videos/noir.mp4',
      source2:
        'https://static.smartisanos.cn/common/video/production/delta/r2.mp4',
      liveStrSource:
        'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    };
  },
  methods: {
    viewCore(id, player) {
      console.log(id, player);
      this.players[id] = player;
    },
    play(id) {
      console.log('custom play: id =', id);
      this.players && this.players[id] && this.players[id].play();
    },
    destroy(id) {
      this.players && this.players[id] && this.players[id].destroy();
    },
    playEnded(e) {
      console.log(e);
      if (e.target === document.pictureInPictureElement) {
        document.exitPictureInPicture();
      }
    },
    volumeUp(id) {
      this.volume += 5;
      if (this.volume > 100) {
        this.volume = 100;
      }
      this.players &&
        this.players[id] &&
        this.players[id].setVolume(this.volume / 100, true);
    },
    volumeDown(id) {
      this.volume -= 5;
      if (this.volume < 0) {
        this.volume = 0;
      }
      this.players &&
        this.players[id] &&
        this.players[id].setVolume(this.volume / 100, true);
    },
    pip(id) {
      // you can also use this.players[id].$video to do what u want just like playEnded
      console.log(this.players[id].$video);
      this.players &&
        this.players[id] &&
        this.players[id].requestPictureInPicture();
    },
  },
};
</script>

<style scoped>

</style>
