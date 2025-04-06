// sound.js

const soundPlayer = {
  cache: {},
  motivational: [
    'Keep_Going.mp3',
    'Keep_Going1.mp3'
  ],
  lastPlayTime: null,
  lastMistakeTime: 0,
  mistakeCooldown: 5000, // 5 seconds

  playIntro: function(callback) {
    const intro = new Audio('sounds/instructions_squads.mp3');
    intro.onended = () => {
      if (typeof callback === 'function') callback();
    };
    intro.play();
  },

  playIntro: function(callback, exercise = 'squads') {
    const file = `sounds/instructions_${exercise}.mp3`;
    const intro = new Audio(file);
    intro.onended = () => {
      if (typeof callback === 'function') callback();
    };
    intro.play();
  },


  playMistake: function(file = 'bad_posture.mp3') {
    const now = performance.now();
    if (now - this.lastMistakeTime > this.mistakeCooldown) {
      if (!this.cache[file]) {
        this.cache[file] = new Audio(`sounds/${file}`);
      }
      const audio = this.cache[file];
      audio.pause();
      audio.currentTime = 0;
      audio.play();
      this.lastMistakeTime = now;
    }
  },

  playFinal: function(callback) {
    const final = this.cache[20];
    if (final) {
      final.pause();
      final.currentTime = 0;
      final.play();
      final.onended = () => {
        if (typeof callback === 'function') {
          callback();
        }
      };
    }
  },


  preload: function(max = 20) {
    for (let i = 1; i <= max; i++) {
      this.cache[i] = new Audio(`sounds/${i}.mp3`);
    }
    this.cache['instructions_squads'] = new Audio('sounds/instructions_squads.mp3');
    this.cache['done'] = new Audio('sounds/Well_Done.mp3');
    this.cache['bad_posture.mp3'] = new Audio('sounds/bad_posture.mp3');
    this.cache['knees_caving.mp3'] = new Audio('sounds/knees_caving.mp3');


    // Preload exact motivational files
    this.motivational.forEach(file => {
      this.cache[file] = new Audio(`sounds/${file}`);
    });
  },

  play: function(num) {
    if (this.cache[num]) {
      this.cache[num].pause();
      this.cache[num].currentTime = 0;
      this.cache[num].play();
      this.lastPlayTime = performance.now();

      // 🧠 Custom logic after 20.mp3
      if (num === 20) {
        this.cache[num].onended = () => {
          console.log("✅ 20 reps reached. Redirecting...");
          const ctx = document.getElementById('canvas')?.getContext('2d');
          if (ctx) {
            ctx.fillStyle = 'green';
            ctx.font = '28px Arial';
            ctx.fillText('Workout complete! Redirecting...', 30, 130);
          }
          setTimeout(() => {
            window.location.href = '/exerciseSelection';
          }, 3000);
        };
      }
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
