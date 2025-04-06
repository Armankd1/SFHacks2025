
const tracker = {
    // config options
    detectorModel: poseDetection.SupportedModels.BlazePose, // detector model
    detectorConfig: { // detector configuration
        modelType: 'full',
        enableSmoothing: true,
        multiPoseMaxDimension: 256,
        enableTracking: true,
        trackerType: poseDetection.TrackerType.BoundingBox
    },
    autofit: false, // bool, enable autofit on canvas scaling
    enableAI: true, // bool, enable or disable tracking
    enableVideo: true, // bool, enable or disable display original video on canvas on canvas
    enable3D: true, // bool, enable or disable 3D keypoints
    pointWidth: 6, // width of line between points
    pointRadius: 8, // point circle radius
    minScore: 0.35, // minimum threshold for estimated point
    log: true, // bool, enable logging to console
    hooks: { // user defined hooks/events
        'beforeupdate': [], // before poses update
        'afterupdate': [], // after poses update
        'statuschange': [], // when status change
        'detectorerror': [], // if detector error 
        'videoerror': [] // if video error
    },

    // HTML elements
    el3D: '#view_3d', // HTML element for 3D keypoint
    elCanvas: '#canvas', // HTML element for canvas
    elVideo: '#video', // HTML element for video
    
    // internals
    detector: null, // tensor flow detector instance
    reqID: null, // requested frame ID
    isPlaying: false, // bool, current playback state
    isWaiting: false, // bool, waiting for video state
    poses: null, // estimated poses
    video: null, // DOMElement with vidoe
    canvas: null, // DOMElement with canvas 
    ctx: null, // canvas context instance
    container: null, // container for video
    status: '', // current status message
    poseVisibleSince: null, // timestamp
    poseReady: false,        // whether pose has been visible for 2s
    squatCounter: 0,
    squatState: 'up',
    exercise: 'squat',
    jumpingJackCounter: 0,
    jumpingJackState: 'closed',
    legRaiseCounter: 0,
    legRaiseSide: 'left',
    legRaiseState: 'down',
    anchors3D: [ // 3D keypoints anchors
        [0, 0, 0],
        [0, 1, 0],
        [-1, 0, 0],
        [-1, -1, 0]
    ],
    scatterGL: null, // ScatterGL instance
    scatterGLEl: null, // DOMElement with ScatterGL container
    scatterGLInitialized: false, // bool, ScatterGL initialization state
    videoJS: null, // videoJS instance 
    paths: {
        // paths between points configuration
        'blaze_pose': {
            // left hip > left knee
            'l_hip_l_knee': {
                'from_x': ['left_hip'],
                'from_y': ['left_hip'],
                'to_x': ['left_knee'],
                'to_y': ['left_knee'],
                'scores': ['left_knee'],
                'rgb': [42, 163, 69]
            },
            // right hip > right knee
            'r_hip_r_knee': {
                'from_x': ['right_hip'],
                'from_y': ['right_hip'],
                'to_x': ['right_knee'],
                'to_y': ['right_knee'],
                'scores': ['right_knee'],
                'rgb': [42, 163, 69]
            },
            // hips (mid-point)
            'hip_l_m': { // left
                'from_x': ['left_hip'],
                'from_y': ['left_hip'],
                'to_x': ['left_hip', 'right_hip'],
                'to_y': ['left_hip', 'right_hip'],
                'scores': ['left_hip', 'right_hip'],
                'rgb': [140, 232, 90]
            },
            'hip_r_m': { // right
                'from_x': ['right_hip'],
                'from_y': ['right_hip'],
                'to_x': ['left_hip', 'right_hip'],
                'to_y': ['left_hip', 'right_hip'],
                'scores': ['left_hip', 'right_hip'],
                'rgb': [140, 232, 90]
            },
            // hip to shoulders
            'hip_l_shoulder_l': { // left
                'from_x': ['left_hip'],
                'from_y': ['left_hip'],
                'to_x': ['left_shoulder'],
                'to_y': ['left_shoulder'],
                'scores': ['left_hip', 'left_shoulder'],
                'rgb': [242, 85, 240]
            },
            'hip_r_shoulder_r': { // right
                'from_x': ['right_hip'],
                'from_y': ['right_hip'],
                'to_x': ['right_shoulder'],
                'to_y': ['right_shoulder'],
                'scores': ['right_hip', 'right_shoulder'],
                'rgb': [242, 85, 240]
            },
            // left knee > left ankle
            'l_knee_l_ankle': {
                'from_x': ['left_knee'],
                'from_y': ['left_knee'],
                'to_x': ['left_ankle'],
                'to_y': ['left_ankle'],
                'scores': ['left_ankle'],
                'rgb': [140, 232, 90]
            },
            // right knee > right ankle
            'r_knee_r_ankle': {
                'from_x': ['right_knee'],
                'from_y': ['right_knee'],
                'to_x': ['right_ankle'],
                'to_y': ['right_ankle'],
                'scores': ['right_ankle'],
                'rgb': [140, 232, 90]
            },
            // left ankle > left heel
            'l_ankle_l_heel': {
                'from_x': ['left_ankle'],
                'from_y': ['left_ankle'],
                'to_x': ['left_heel'],
                'to_y': ['left_heel'],
                'scores': ['left_ankle', 'left_heel'],
                'rgb': [42, 163, 69]
            },
            // left heel > left foot_index
            'l_heel_l_foot_index': {
                'from_x': ['left_heel'],
                'from_y': ['left_heel'],
                'to_x': ['left_foot_index'],
                'to_y': ['left_foot_index'],
                'scores': ['left_heel', 'left_foot_index'],
                'rgb': [42, 163, 69]
            },
            // left foot_index > left ankle
            'l_foot_index_l_ankle': {
                'from_x': ['left_foot_index'],
                'from_y': ['left_foot_index'],
                'to_x': ['left_ankle'],
                'to_y': ['left_ankle'],
                'scores': ['left_foot_index', 'left_ankle'],
                'rgb': [42, 163, 69]
            },
            // right ankle > right heel
            'r_ankle_r_heel': {
                'from_x': ['right_ankle'],
                'from_y': ['right_ankle'],
                'to_x': ['right_heel'],
                'to_y': ['right_heel'],
                'scores': ['right_ankle', 'right_heel'],
                'rgb': [42, 163, 69]
            },
            // right heel > right foot_index
            'r_heel_r_foot_index': {
                'from_x': ['right_heel'],
                'from_y': ['right_heel'],
                'to_x': ['right_foot_index'],
                'to_y': ['right_foot_index'],
                'scores': ['right_heel', 'right_foot_index'],
                'rgb': [42, 163, 69]
            },
            // right foot_index > right ankle
            'r_foot_index_r_ankle': {
                'from_x': ['right_foot_index'],
                'from_y': ['right_foot_index'],
                'to_x': ['right_ankle'],
                'to_y': ['right_ankle'],
                'scores': ['right_foot_index', 'right_ankle'],
                'rgb': [42, 163, 69]
            },
            // hips > shoulders
            'hips_shoulders_m': {
                'from_x': ['left_hip', 'right_hip'],
                'from_y': ['left_hip', 'right_hip'],
                'to_x': ['left_shoulder', 'right_shoulder'],
                'to_y': ['left_shoulder', 'right_shoulder'],
                'scores': ['left_hip', 'right_hip'],
                'rgb': [242, 85, 240]
            },
            // shoulders (mid-point)
            'shoulder_l_m': { // left
                'from_x': ['left_shoulder'],
                'from_y': ['left_shoulder'],
                'to_x': ['left_shoulder', 'right_shoulder'],
                'to_y': ['left_shoulder', 'right_shoulder'],
                'scores': ['left_shoulder', 'right_shoulder'],
                'rgb': [92, 70, 235]
            },
            'shoulder_r_m': { // right
                'from_x': ['right_shoulder'],
                'from_y': ['right_shoulder'],
                'to_x': ['left_shoulder', 'right_shoulder'],
                'to_y': ['left_shoulder', 'right_shoulder'],
                'scores': ['left_shoulder', 'right_shoulder'],
                'rgb': [92, 70, 235]
            },
            // shoulders (mid-point) > nose (neck)
            'neck': {
                'from_x': ['left_shoulder', 'right_shoulder'],
                'from_y': ['left_shoulder', 'right_shoulder'],
                'to_x': ['left_ear', 'right_ear'],
                'to_y': ['left_ear', 'right_ear'],
                'scores': ['left_shoulder', 'right_shoulder'],
                'rgb': [92, 108, 145]
            },
            // left shoulder > left elbow
            'l_shoulder_l_elbow': {
                'from_x': ['left_shoulder'],
                'from_y': ['left_shoulder'],
                'to_x': ['left_elbow'],
                'to_y': ['left_elbow'],
                'scores': ['left_elbow'],
                'rgb': [245, 129, 66]
            },
            // right shoulder > right elbow
            'r_shoulder_r_elbow': {
                'from_x': ['right_shoulder'],
                'from_y': ['right_shoulder'],
                'to_x': ['right_elbow'],
                'to_y': ['right_elbow'],
                'scores': ['right_elbow'],
                'rgb': [245, 129, 66]
            },
            // left elbow > left wrist
            'l_elbow_l_wrist': {
                'from_x': ['left_elbow'],
                'from_y': ['left_elbow'],
                'to_x': ['left_wrist'],
                'to_y': ['left_wrist'],
                'scores': ['left_wrist'],
                'rgb': [227, 156, 118]
            },
            // right elbow > right wrist
            'r_elbow_r_wrist': {
                'from_x': ['right_elbow'],
                'from_y': ['right_elbow'],
                'to_x': ['right_wrist'],
                'to_y': ['right_wrist'],
                'scores': ['right_wrist'],
                'rgb': [227, 156, 118]
            },

            // left wrist > left_thumb
            'l_wrist_l_thumb': {
                'from_x': ['left_wrist'],
                'from_y': ['left_wrist'],
                'to_x': ['left_thumb'],
                'to_y': ['left_thumb'],
                'scores': ['left_wrist', 'left_thumb'],
                'rgb': [245, 129, 66]
            },
            // left wrist > left_pinky
            'l_wrist_l_pinky': {
                'from_x': ['left_wrist'],
                'from_y': ['left_wrist'],
                'to_x': ['left_pinky'],
                'to_y': ['left_pinky'],
                'scores': ['left_wrist', 'left_pinky'],
                'rgb': [245, 129, 66]
            },
            // left pinky > left index
            'l_pinky_l_index': {
                'from_x': ['left_pinky'],
                'from_y': ['left_pinky'],
                'to_x': ['left_index'],
                'to_y': ['left_index'],
                'scores': ['left_pinky', 'left_index'],
                'rgb': [245, 129, 66]
            },
            // left index > left wrist
            'l_index_l_wrist': {
                'from_x': ['left_index'],
                'from_y': ['left_index'],
                'to_x': ['left_wrist'],
                'to_y': ['left_wrist'],
                'scores': ['left_index', 'left_wrist'],
                'rgb': [245, 129, 66]
            },
            // right wrist > right_thumb
            'r_wrist_r_thumb': {
                'from_x': ['right_wrist'],
                'from_y': ['right_wrist'],
                'to_x': ['right_thumb'],
                'to_y': ['right_thumb'],
                'scores': ['right_wrist', 'right_thumb'],
                'rgb': [245, 129, 66]
            },
            // right wrist > right_pinky
            'r_wrist_r_pinky': {
                'from_x': ['right_wrist'],
                'from_y': ['right_wrist'],
                'to_x': ['right_pinky'],
                'to_y': ['right_pinky'],
                'scores': ['right_wrist', 'right_pinky'],
                'rgb': [245, 129, 66]
            },
            // right pinky > right index
            'r_pinky_r_index': {
                'from_x': ['right_pinky'],
                'from_y': ['right_pinky'],
                'to_x': ['right_index'],
                'to_y': ['right_index'],
                'scores': ['right_pinky', 'right_index'],
                'rgb': [245, 129, 66]
            },
            // right index > right wrist
            'r_index_r_wrist': {
                'from_x': ['right_index'],
                'from_y': ['right_index'],
                'to_x': ['right_wrist'],
                'to_y': ['right_wrist'],
                'scores': ['right_index', 'right_wrist'],
                'rgb': [245, 129, 66]
            },
        }
    },

    /*
        Run predictions
     */
    run: function(source) {
        if(source === 'camera')
            tracker.initCamera();
    },

    /*
        Initialize ScatterGL
     */
    init3D: function() {
        if (tracker.scatterGLEl == null) {
            return;
        }
        // init and store instance
        tracker.scatterGL = new ScatterGL(tracker.scatterGLEl, {
            'rotateOnStart': true,
            'selectEnabled': false,
            'styles': {
                polyline: {
                    defaultOpacity: 1,
                    deselectedOpacity: 1
                },
                fog: {
                    enabled: false
                }
            }
        });
    },

    /*
        Initialize core elements
     */
    init: function() {
        tracker.log('Initializing...');

        // init elements
        tracker.video = document.querySelector(tracker.elVideo);
        tracker.canvas = document.querySelector(tracker.elCanvas);
            tracker.scatterGLEl = document.querySelector(tracker.el3D);
        tracker.ctx = tracker.canvas.getContext("2d");

        // instantiate ScatterGL for 3D points view (BlazePose model only)
        if (tracker.detectorModel === poseDetection.SupportedModels.BlazePose) {
            tracker.init3D();
        }
    },


    /*
        Render video frame
     */
    videoFrame: async function() {

        tracker.setStatus('');

        // check if video is ready
        if (tracker.container !== undefined && tracker.container.ready) {
            if (tracker.enableAI && tracker.container.video != null) {
                // try to detect poses
                try {
                    const estimationConfig = {
                        flipHorizontal: false
                    };
                    const timestamp = performance.now();
                    tracker.poses = await tracker.detector.estimatePoses(tracker.container.video, 
                        estimationConfig, timestamp);
                } catch (err) {
                    tracker.dispatch('detectorerror', err);
                    console.error(err);
                }
            }

            // clear canvas
            tracker.clearCanvas();

            // draw video frame on canvas
            if (tracker.enableVideo) {
                tracker.ctx.drawImage(tracker.container.video,
                    0,
                    0,
                    tracker.container.video.videoWidth,
                    tracker.container.video.videoHeight);
            }

            // handle detected poses
            if (tracker.enableAI) {
                tracker.handlePoses();
            }

            // if video is paused then show controls
            if (tracker.container.video.paused) {
                tracker.showPlaybackControls();
            }
        }

        // next frame
        tracker.reqID = window.requestAnimationFrame(tracker.videoFrame);
    },

    /*
        Initialize camera
     */
    initCamera: async function() {
        tracker.init();

        // init detectot
        tracker.detector = await poseDetection.createDetector(
            tracker.detectorModel,
            tracker.detectorConfig
        );

        // init camera
        try {
            tracker.video = await tracker.setupCamera();
            tracker.video.play();
            tracker.cameraFrame();
        } catch (e) {
            tracker.dispatch('videoerror', e);
            console.error(e);
        }
    },

    /*
        Set-up camera
     */
    setupCamera: async function() {
        tracker.setStatus('Please wait...initializing camera...');
        // init device
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error(
                "Browser API navigator.mediaDevices.getUserMedia not available"
            );
        }
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                width: {
                    ideal: 1280
                },
                height: {
                    ideal: 720
                },
            },
        });
        tracker.video.srcObject = stream; // attach camera stream to video

        // get width and height of the camera video stream
        let stream_settings = stream.getVideoTracks()[0].getSettings();
        let stream_width = stream_settings.width;
        let stream_height = stream_settings.height;

        // re-init width and height with info from stream
        tracker.video.width = stream_width;
        tracker.video.height = stream_height;

        return new Promise((resolve) => {
            tracker.video.onloadedmetadata = () => resolve(video);
        });
    },

    /*
        Render camera frame
     */
    cameraFrame: async function() {
        tracker.setStatus('');

        // predict poses
        tracker.poses = await tracker.detector.estimatePoses(tracker.video);

        // setup dimensions
        tracker.canvas.width = tracker.canvas.scrollWidth;
        tracker.canvas.height = tracker.canvas.scrollHeight;
        if (tracker.video.readyState === tracker.video.HAVE_ENOUGH_DATA) {
            let xOffset;
            const videoSize = {
                width: tracker.video.videoWidth,
                height: tracker.video.videoHeight
            };
            const canvasSize = {
                width: tracker.canvas.width,
                height: tracker.canvas.height
            };
            const renderSize = tracker.calculateSize(videoSize, canvasSize);
            xOffset = (canvasSize.width - renderSize.width) / 2;

            // clear canvas
            tracker.clearCanvas();

            // draw video frame from camera on canvas
            if (tracker.enableVideo) {
                tracker.ctx.drawImage(tracker.video, xOffset, 0, renderSize.width, renderSize.height);
            }
        }

        // handle poses
        if (tracker.enableAI) {
            tracker.handlePoses();
        }

        // next frame
        tracker.reqID = window.requestAnimationFrame(tracker.cameraFrame);
    },

    /*
        Find and return pose keypoints by keypoint's name
     */
    findKeypoint: function(name, pose) {
        for (const keypoint of pose.keypoints) {
            if (keypoint.name === name) {
                return keypoint;
            }
        }
    },

    /*
        Find and return pose keypoint coordinate (X or Y) by keypoint's name
     */
    findPosePoint: function(axis, name, pose) {
        const kp = tracker.findKeypoint(name, pose);
        return kp[axis];
    },

    /*
        Return coordinate (X or Y) for points in path
     */
    getCoord: function(axis, points, pose) {
        // if only one point then return coordinate for this one
        if (points.length === 1) {
            return tracker.findPosePoint(axis, points[0], pose);
        } else {
            // if multiple points then calculate coordinate between them
            let sum = 0.0;
            for (const el of points) {
                sum += tracker.findPosePoint(axis, el, pose);
            }
            return sum / points.length;
        }
    },

    /*
        Return coordinates for path
     */
    getCoords: function(path, pose) {
        return {
            'from_x': tracker.getCoord('x', path.from_x, pose),
            'from_y': tracker.getCoord('y', path.from_y, pose),
            'to_x': tracker.getCoord('x', path.to_x, pose),
            'to_y': tracker.getCoord('y', path.to_y, pose),
        };
    },

    /*
        Get score for path
     */
    getScore: function(path, pose) {
        // if only one point then check score for this one
        if (path.scores.length === 1) {
            return tracker.findKeypoint(path.scores[0], pose).score;
        } else {
            // if multiple points then check score for all
            let sum = 0.0;
            for (const el of path.scores) {
                sum += tracker.findKeypoint(el, pose).score;
            }
            return sum / path.scores.length;
        }
    },

    /*
        Checks if path has required minimum score do draw it on canvas
     */
    hasScore: function(path, pose) {
        let res = true;
        // if only one point then check score for this one
        if (path.scores.length === 1) {
            if (tracker.findKeypoint(path.scores[0], pose).score < tracker.minScore) {
                res = false;
            }
        } else {
            // if multiple points then check score for all
            for (const el of path.scores) {
                if (tracker.findKeypoint(el, pose).score < tracker.minScore) {
                    res = false;
                    break;
                }
            }
        }
        return res;
    },

    /*
        Re-calculate size between source and destination area
     */
    calculateSize: function(srcSize, dstSize) {
        const srcRatio = srcSize.width / srcSize.height;
        const dstRatio = dstSize.width / dstSize.height;
        if (dstRatio > srcRatio) {
            return {
                width: dstSize.height * srcRatio,
                height: dstSize.height
            };
        } else {
            return {
                width: dstSize.width,
                height: dstSize.width / srcRatio
            };
        }
    },

    /*
        Re-calculate/scale X position of point
     */

    scaleX: function(x) {
        const videoSize = {
            width: tracker.video.videoWidth,
            height: tracker.video.videoHeight
        };
        const canvasSize = {
            width: tracker.canvas.width,
            height: tracker.canvas.height
        };
        const renderSize = tracker.calculateSize(videoSize, canvasSize);
        let xOffset = (canvasSize.width - renderSize.width) / 2;
        const factor = (renderSize.width) / videoSize.width;

        if (!tracker.autofit) {
            xOffset = 0;
        }

        return Math.ceil(x * factor) + xOffset;
    },

    /*
        Re-calculate/scale Y position of point
     */
    scaleY: function(y) {
        const videoSize = {
            width: tracker.video.videoWidth,
            height: tracker.video.videoHeight
        };
        const canvasSize = {
            width: tracker.canvas.width,
            height: tracker.canvas.height
        };
        const renderSize = tracker.calculateSize(videoSize, canvasSize);
        let yOffset = (canvasSize.height - renderSize.height) / 2;

        // if vertical then cancel offset
        if (window.innerHeight > window.innerWidth || !tracker.autofit) {
            yOffset = 0;
        }

        const factor = renderSize.height / videoSize.height;
        return Math.ceil(y * factor) + yOffset;
    },

    /*
    Calculate angle in degrees between three 3D keypoints: a, b (vertex), c
*/
    calculate3DAngle: function(a, b, c) {
        const ab = { x: a.x - b.x, y: a.y - b.y };
        const cb = { x: c.x - b.x, y: c.y - b.y };

        const dot = ab.x * cb.x + ab.y * cb.y ;
        const magAB = Math.sqrt(ab.x**2 + ab.y**2);
        const magCB = Math.sqrt(cb.x**2 + cb.y**2);

        const cosineAngle = dot / (magAB * magCB);
        const angle = Math.acos(Math.max(-1, Math.min(1, cosineAngle))); // Clamp to avoid NaN
        return angle * 180 / Math.PI;
    },

    setExercise: function(exName) {
        tracker.exercise = exName;
        tracker.squatCounter = 0;
        tracker.jumpingJackCounter = 0;
        tracker.legRaiseCounter = 0;
        console.log("Exercise selected:", exName);
    },

    detectJumpingJacks: function(pose) {
        const key3D = (name) => {
            const idx = pose.keypoints.findIndex(k => k.name === name);
            return idx >= 0 ? pose.keypoints3D[idx] : null;
        };

        const lWrist = key3D('left_wrist');
        const rWrist = key3D('right_wrist');
        const lElbow = key3D('left_elbow');
        const rElbow = key3D('right_elbow');
        const lAnkle = key3D('left_ankle');
        const rAnkle = key3D('right_ankle');

        if (lWrist && rWrist && lElbow && rElbow && lAnkle && rAnkle) {
            const wristAboveElbow = lWrist.y < lElbow.y && rWrist.y < rElbow.y;
            const feetApart = Math.abs(lAnkle.x - rAnkle.x) > 0.5;
            const isOpen = wristAboveElbow && feetApart;

            const feetClose = Math.abs(lAnkle.x - rAnkle.x) < 0.3;
            const isClosed = !wristAboveElbow && feetClose;

            if (tracker.jumpingJackState === 'closed' && isOpen) {
                tracker.jumpingJackState = 'open';
            }

            if (tracker.jumpingJackState === 'open' && isClosed) {
                tracker.jumpingJackCounter++;
                tracker.jumpingJackState = 'closed';
            }

            tracker.ctx.fillStyle = 'aqua';
            tracker.ctx.font = '28px Arial';
            tracker.ctx.fillText('Jumping Jacks: ' + tracker.jumpingJackCounter, 30, 60);
        }
    },

    detectLegRaises: function(pose) {
        const key3D = (name) => {
            const idx = pose.keypoints.findIndex(k => k.name === name);
            return idx >= 0 ? pose.keypoints3D[idx] : null;
        };

        const lHip = key3D('left_hip');
        const lKnee = key3D('left_knee');
        const lAnkle = key3D('left_ankle');
        const rHip = key3D('right_hip');
        const rKnee = key3D('right_knee');
        const rAnkle = key3D('right_ankle');
        const lWrist = key3D('left_wrist');
        const rWrist = key3D('right_wrist');
        const lShoulder = key3D('left_shoulder');
        const rShoulder = key3D('right_shoulder');

        if (
            lHip && lKnee && lAnkle && rHip && rKnee && rAnkle &&
            lWrist && rWrist && lShoulder && rShoulder
        ) {
            const leftLegAngle = tracker.calculate3DAngle(lHip, lKnee, lAnkle);
            const rightLegAngle = tracker.calculate3DAngle(rHip, rKnee, rAnkle);

            const leftRaised = leftLegAngle < 100;
            const leftLowered = leftLegAngle > 160;
            const rightRaised = rightLegAngle < 100;
            const rightLowered = rightLegAngle > 160;

            // Mid-torso = midpoint between hips and shoulders
            const avgTorsoY = ((lHip.y + rHip.y + lShoulder.y + rShoulder.y) / 4);

            const handsUp = lWrist.y < avgTorsoY && rWrist.y < avgTorsoY;

            if (!handsUp) {
                tracker.ctx.fillStyle = 'red';
                tracker.ctx.font = '24px Arial';
                tracker.ctx.fillText('Raise your hands!', 30, 100);
                return;
            }

            if (tracker.legRaiseSide === 'left') {
                if (tracker.legRaiseState === 'down' && leftRaised) {
                    tracker.legRaiseState = 'up';
                }
                if (tracker.legRaiseState === 'up' && leftLowered) {
                    tracker.legRaiseCounter++;
                    tracker.legRaiseState = 'down';
                    tracker.legRaiseSide = 'right';
                }
            } else if (tracker.legRaiseSide === 'right') {
                if (tracker.legRaiseState === 'down' && rightRaised) {
                    tracker.legRaiseState = 'up';
                }
                if (tracker.legRaiseState === 'up' && rightLowered) {
                    tracker.legRaiseCounter++;
                    tracker.legRaiseState = 'down';
                    tracker.legRaiseSide = 'left';
                }
            }

            tracker.ctx.fillStyle = 'violet';
            tracker.ctx.font = '28px Arial';
            tracker.ctx.fillText('Leg Raises: ' + tracker.legRaiseCounter, 30, 60);
        }
    },

    detectSquats: function(pose) {
        const key3D = (name) => {
            const idx = pose.keypoints.findIndex(k => k.name === name);
            return idx >= 0 ? pose.keypoints3D[idx] : null;
        };

        const lHip = key3D('left_hip');
        const lKnee = key3D('left_knee');
        const lAnkle = key3D('left_ankle');
        const rHip = key3D('right_hip');
        const rKnee = key3D('right_knee');
        const rAnkle = key3D('right_ankle');

        if (lHip && lKnee && lAnkle && rHip && rKnee && rAnkle) {
            const leftKneeAngle = tracker.calculate3DAngle(lHip, lKnee, lAnkle);
            const rightKneeAngle = tracker.calculate3DAngle(rHip, rKnee, rAnkle);

            const kneesCaving = lKnee.x < lAnkle.x - 0.05 && rKnee.x > rAnkle.x + 0.05;
            const isSquatting = leftKneeAngle < 100 && rightKneeAngle < 100;
            const isStanding = leftKneeAngle > 160 && rightKneeAngle > 160;

            if (tracker.squatState === 'up' && isSquatting && !kneesCaving) {
                tracker.squatState = 'down';
            }

            if (tracker.squatState === 'down' && isStanding && !kneesCaving) {
                tracker.squatCounter++;
                tracker.squatState = 'up';
                soundPlayer.play(tracker.squatCounter);//----------------------------------- SOUND
            if(tracker.squatCounter > 5) {
                tracker.squatCounter = 0;
            }

            }

            tracker.ctx.fillStyle = 'lime';
            tracker.ctx.font = '28px Arial';
            tracker.ctx.fillText('Squats: ' + tracker.squatCounter, 30, 60);

            if (kneesCaving) {
                tracker.ctx.fillStyle = 'red';
                tracker.ctx.font = '24px Arial';
                tracker.ctx.fillText('Knees are caving in!', 30, 100);
            }

            if (tracker.squatState === 'down' && isStanding && !kneesCaving) {//------------------------- MOTIVATION AFTER IDLE
                tracker.squatCounter++;
                tracker.squatState = 'up';
                soundPlayer.play(tracker.squatCounter);
                lastSquatTime = performance.now(); // Reset timer on success
            }

            if (performance.now() - lastSquatTime > 8000) {
                soundPlayer.playRandomMotivation();
                lastSquatTime = performance.now(); // avoid repeating every frame
                // Play motivation if idle too long
            }
        }
    },

    /*
        Handle poses and draw them on canvas
     */
    handlePoses: function() {
        // run user defined hooks
        tracker.dispatch('beforeupdate', tracker.poses);

        const now = performance.now();

        if (tracker.poses && tracker.poses.length > 0) {
            // --- Stable pose delay (2 seconds) ---
            if (!tracker.poseVisibleSince) {
                tracker.poseVisibleSince = now;
            }

            const poseDuration = now - tracker.poseVisibleSince;

            if (poseDuration >= 2000 && !tracker.poseReady) {
                tracker.poseReady = true;
                console.log("Pose is stable. Start tracking squats.");
            }

            let pathlist;
            if(tracker.detectorModel === poseDetection.SupportedModels.BlazePose)
                pathlist = tracker.paths['blaze_pose'];

            for (let pose of tracker.poses) {
                // Draw body parts
                for (let k in pathlist) {
                    if (pathlist.hasOwnProperty(k)) {
                        if (!tracker.hasScore(pathlist[k], pose)) continue;
                        const point = tracker.getCoords(pathlist[k], pose);
                        const score = tracker.getScore(pathlist[k], pose);

                        tracker.drawPath(
                            point.from_x,
                            point.from_y,
                            point.to_x,
                            point.to_y,
                            pathlist[k].rgb[0],
                            pathlist[k].rgb[1],
                            pathlist[k].rgb[2],
                            score
                        );
                    }
                }

                // --- Exercise detection only if pose is stable ---
                if (tracker.poseReady && tracker.enable3D && pose.keypoints3D?.length > 0) {
                    switch (tracker.exercise) {
                        case 'squat':
                            tracker.detectSquats(pose);
                            break;
                        case 'jumping_jack':
                            tracker.detectJumpingJacks(pose);
                            break;
                        case 'leg_raise':
                            tracker.detectLegRaises(pose);
                            break;
                    }
                }


                // --- Optional: show "calibrating" message ---
                if (!tracker.poseReady) {
                    tracker.ctx.fillStyle = 'orange';
                    tracker.ctx.font = '24px Arial';
                    tracker.ctx.fillText('Hold still... Calibrating...', 30, 60);
                }

                // Draw 3D points
                if (tracker.enable3D && pose.keypoints3D?.length > 0) {
                    tracker.drawKeypoints3D(pose.keypoints3D);
                }
            }
        } else {
            // No pose detected — reset
            tracker.poseVisibleSince = null;
            tracker.poseReady = false;
        }

        // run user defined hooks
        tracker.dispatch('afterupdate', tracker.poses);
    },


    /*
        Draw point and bone on canvas
     */
    drawPath: function(fromX, fromY, toX, toY, r, g, b, score) {
        // use score to calculate alpha
        let a = score - 0.15;
        if (a < 0) {
            a = 0.0;
        }
        // draw connection
        tracker.drawLine(tracker.scaleX(fromX), tracker.scaleY(fromY), 
            tracker.scaleX(toX), tracker.scaleY(toY), 
            r, g, b, a);

        // draw joint
        tracker.drawCircle(tracker.scaleX(fromX), tracker.scaleY(fromY), 
            r, g, b, a);
    },

    /*
        Draw connection between points on canvas
     */
    drawLine: function(fromX, fromY, toX, toY, r, g, b, a) {
        tracker.ctx.beginPath();
        tracker.ctx.lineWidth = tracker.pointWidth;
        tracker.ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
        tracker.ctx.moveTo(fromX, fromY);
        tracker.ctx.lineTo(toX, toY);
        tracker.ctx.stroke();
        tracker.ctx.closePath();
    },

    /*
        Draw point on canvas
     */
    drawCircle: function(fromX, fromY, r, g, b, a) {
        tracker.ctx.beginPath();
        tracker.ctx.arc(fromX, fromY, tracker.pointRadius, 0, 2 * Math.PI);
        tracker.ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
        tracker.ctx.fill();
        tracker.ctx.closePath();
    },

    /*
        Draw 3D keypoints using ScatterGL
     */
    drawKeypoints3D: function(keypoints) {
        const scoreThreshold = tracker.minScore || 0;
        const pointsData = keypoints.map(keypoint => [keypoint.x, -keypoint.y, -keypoint.z]);
        const dataset = new ScatterGL.Dataset([...pointsData, ...tracker.anchors3D]);
        const keypointInd = poseDetection.util.getKeypointIndexBySide(tracker.detectorModel);

        // defined colors for sizes
        tracker.scatterGL.setPointColorer(i => {
            if (keypoints[i] == null || keypoints[i].score < scoreThreshold) {
                return '#ffffff'; // white if low score
            }
            if (i === 0) {
                return '#ff0000'; // red
            }
            if (keypointInd.left.indexOf(i) > -1) {
                return '#00ff00'; // green
            }
            if (keypointInd.right.indexOf(i) > -1) {
                return '#ffa500'; // orange
            }
        });

        // check if already rendered
        if (!tracker.scatterGLInitialized) {
            tracker.scatterGL.render(dataset);
        } else {
            tracker.scatterGL.updateDataset(dataset);
        }

        const connections = poseDetection.util.getAdjacentPairs(tracker.detectorModel);
        const sequences = connections.map(pair => ({
            indices: pair
        }));
        tracker.scatterGL.setSequences(sequences);
        tracker.scatterGLInitialized = true;
    },

    /*
        Clear canvas area
     */
    clearCanvas: function() {
        tracker.ctx.save();
        tracker.ctx.setTransform(1, 0, 0, 1, 0, 0);
        tracker.ctx.clearRect(0, 0, tracker.canvas.width, tracker.canvas.height);
        tracker.ctx.restore();
    },


    /*
        Log message
     */
    log: function(...args) {
        if (tracker.log) {
            console.log(...args);
        }
    },

    /*
        Set status message
     */
    setStatus: function(msg) {
        tracker.status = msg;
        tracker.dispatch('statuschange', tracker.status);
    },

    /*
        Append external hook/event
     */
    on: function(name, hook) {
        if (typeof tracker.hooks[name] === 'undefined') {
            return;
        }
        tracker.hooks[name].push(hook);
    },

    /*
        Dispatch hook/event
     */
    dispatch: function(name, event) {
        if (typeof tracker.hooks[name] === 'undefined') {
            return;
        }
        for (const hook of tracker.hooks[name]) {
            hook(event);
        }
    },

    /*
        Pre-initialize model by name
     */
    setModel: function(model) {
        switch (model) {
            case 'BlazePoseLite':
                tracker.detectorModel = poseDetection.SupportedModels.BlazePose;
                tracker.detectorConfig = {
                    runtime: 'tfjs',
                    enableSmoothing: true,
                    modelType: 'lite'
                };
                tracker.minScore = 0.65;
                break;

            case 'BlazePoseHeavy':
                tracker.detectorModel = poseDetection.SupportedModels.BlazePose;
                tracker.detectorConfig = {
                    runtime: 'tfjs',
                    enableSmoothing: true,
                    modelType: 'heavy'
                };
                tracker.minScore = 0.65;
                break;

            case 'BlazePoseFull':
                tracker.detectorModel = poseDetection.SupportedModels.BlazePose;
                tracker.detectorConfig = {
                    runtime: 'tfjs',
                    enableSmoothing: true,
                    modelType: 'full'
                };
                tracker.minScore = 0.65;
                break;


        }
    },
}
