<script>
import HLSCore from '@cloudgeek/playcore-hls';
import PictureInPicture from './PictureInPicture.vue';
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

<template>
  <div class="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->
    <vitar show-mesh />
    <h4>
      <carbon-tool-kit /> Customize Controls <carbon-language /> i18n
      <a href="https://github.com/LarchLiu/vue3-video-player" target="_blank">
        vue3-vedio-player@v0.3.10</a
      >
    </h4>
    <h4>
      <carbon-user-avatar /> Live avatar -
      <a href="https://github.com/LarchLiu/vitar" target="_blank"> Vitar</a>
    </h4>

    <div class="test-player-wrap">
      <vue3-video-player
        autoplay
        :src="source"
        title="Smartisan JianGuo Pro3"
        @ended="playEnded"
        cover="//static.smartisanos.cn/pr/assets/images/coming-for-u-video-cover.f8caa5277476d5cdb97ae189c68846b2.jpg"
        :view-core="viewCore.bind(null, 'video1')"
      >
        <template #cusControls>
          <picture-in-picture :player="players['video1']" />
          <span class="btn-play" @click="play('video1')">play</span>
        </template>
      </vue3-video-player>
    </div>
    <div class="test-player-wrap">
      <vue3-video-player
        :src="source2"
        title="Smartisan R2"
        cover="//static.smartisanos.cn/pr/assets/images/coming-for-u-video-cover.5d34893a6e241b21bbf181b9243957b7.png"
        :view-core="viewCore.bind(null, 'video2')"
      >
        <template #cusControls>
          <span class="btn-play" @click="play('video2')">play</span>
        </template>
      </vue3-video-player>
    </div>
    <button @click="play('video1')">play 1st video</button>
    <button style="margin-left: 20px" @click="play('video2')">
      play 2nd video
    </button>
    <button style="margin-left: 20px" @click="destroy('video2')">
      destroy 2nd video
    </button>
    <button style="margin-left: 20px" @click="volumeDown('video2')">
      volume -
    </button>
    <button style="margin-left: 20px" @click="volumeUp('video2')">
      volume +
    </button>
    <span style="margin-left: 20px">{{ volume }}</span>
    <div class="test-player-wrap">
      <vue3-video-player
        :core="HLSCore"
        :src="liveStrSource"
        title="test"
        resolution="408p"
        :view-core="viewCore.bind(null, 'video3')"
      >
      </vue3-video-player>
    </div>
    <button @click="destroy('video3')">destroy hls video</button>
    <button style="margin-left: 20px" @click="pip('video3')">pip</button>
  </div>
</template>

<style scoped>
.app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}
.test-player-wrap {
  width: 720px;
  height: 405px;
  position: relative;
  margin: 20px auto;
}
.btn-play {
  color: white;
  margin-right: 10px;
  cursor: pointer;
}
.btn-play svg {
  width: 16px;
}
</style>
