// sound.js

const soundPlayer = {
  cache: {},
  motivational: ['Keep_Going.mp3', 'Dont_Stop.mp3', 'Push_Through.mp3'],
  lastPlayTime: null,

  preload: function(max = 15) {
    for (let i = 1; i <= max; i++) {
      this.cache[i] = new Audio(`sounds/${i}.mp3`);
    }
    this.cache['done'] = new Audio('sounds/Well_Done.mp3');
    this.motivational.forEach((file) => {
      this.cache[file] = new Audio(`sounds/${file}`);
    });
  },

  play: function(num) {
    if (this.cache[num]) {
      this.cache[num].pause();
      this.cache[num].currentTime = 0;
      this.cache[num].play();
      this.lastPlayTime = performance.now();
    }
  },

  playRandomMotivation: function() {
    const now = performance.now();
    if (!this.lastPlayTime || now - this.lastPlayTime > 10000) {
      const file = this.motivational[Math.floor(Math.random() * this.motivational.length)];
      const audio = this.cache[file];
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.play();
        this.lastPlayTime = now;
      }
    }
  }
};

window.soundPlayer = soundPlayer;
