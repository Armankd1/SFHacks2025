// Copyright Marcin "szczyglis" Szczyglinski, 2022. All Rights Reserved.
// Email: szczyglis@protonmail.com
// WWW: https://github.com/szczyglis-dev/js-ai-body-tracker
// Library: app.js
// Version: 1.0.0
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const app = {
    debug: false, // bool, enable/disable debug
        init: function() {
            const source = 'camera';

            soundPlayer.preload();//-------------------- SOUND

            document.getElementById('source-' + source)?.classList.add('active');

            const sources = document.querySelectorAll('.source-select');
            sources.forEach(el => {
                el.addEventListener('click', function() {
                    let href = '?source=' + this.getAttribute('data-source');
                    window.location.href = href;
                });
            });

            if (source === 'camera') {
                document.getElementById('canvas').classList.add('camera');
            }

            // Debug + Controls toggles
            document.getElementById('btn_toggle_debug')?.addEventListener('click', app.toggleDebug);
            document.getElementById('btn_toggle_controls')?.addEventListener('click', app.toggleControls);
        },


    // handle toggle button
    toggleAI: function() {
        if (tracker.enableAI) {
            tracker.enableAI = false;
            console.log('AI ON');
        } else {
            tracker.enableAI = true;
            console.log('AI OFF');
        }
    },

    // handle toggle button
    toggleVideo: function() {
        if (tracker.enableVideo) {
            tracker.enableVideo = false;
            console.log('Video OFF');
        } else {
            console.log('Video ON');
            tracker.enableVideo = true;
        }
    },

    // handle toggle button
    toggle3D: function() {
        if (tracker.detectorModel != poseDetection.SupportedModels.BlazePose) {
            alert('3D is available for BlazePose model only!');
            return;
        }

        if (tracker.scatterGL == null) {
            console.error('ScatterGL is not initialized');
            return;
        }

        if (tracker.enable3D) {
            tracker.enable3D = false;
            tracker.scatterGLEl.style.display = "none";
            console.log('3D OFF');
        } else {
            console.log('3D ON');
            tracker.enable3D = true;
            tracker.scatterGLEl.style.display = "block";
            tracker.scatterGL.resize();
        }
    },

    // handle toggle button
    toggleDebug: function() {
        if (app.debug) {
            app.debug = false;
            document.getElementById('info_debug').innerHTML = '';
            console.log('Debug OFF');
        } else {
            app.debug = true;
            console.log('Debug ON');
        }
    },

    // handle toggle button
    toggleControls: function() {
        const controls = document.getElementById('controls');
        if (controls.style.display == 'none') {
            controls.style.display = 'block';
        } else {
            controls.style.display = 'none';
        }
    },

    // draw status
    updateStatus: function(msg) {
        document.getElementById('status').innerHTML = msg;
    },

    // draw counter
    updateCounter: function(poses) {
        let i = 0;
        if (poses) {
            i = poses.length;
        }
        document.getElementById('info_counter').innerHTML = i;
    },

    // draw debug coords
    updateDebug: function(poses) {
        if (!app.debug) {
            return;
        }
        let str = '',
            n = 0,
            i = 0;
        for (let pose of poses) {
            str = str + '[ pose ' + i + ' ]<br>';
            for (let kp of pose.keypoints) {
                str = str + i + ': ' + kp.name;
                str = str + ', ';
                str = str + 'x:' + kp.x;
                str = str + ', ';
                str = str + 'y:' + kp.y;
                if (typeof kp.z !== 'undefined') {
                    str = str + ', ';
                    str = str + 'z:' + kp.z;
                }
                str = str + ', ';
                str = str + 's:' + kp.score;
                str = str + '<br>';
                i++;
            }
            n++;
        }
        document.getElementById('info_debug').innerHTML = str;
    },
}
