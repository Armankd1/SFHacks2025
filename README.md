# SFHacks2025 

MoveMate 🏃‍♀️🧠🎵

**Empowering motion with AI — your hands-free personal trainer.**

MoveMate is a voice-activated, AI-powered workout assistant that helps users stay active using just a smartphone or PC camera. It uses TensorFlow.js and BlazePose for real-time pose detection, counts your reps, checks your form, and even motivates you with audio feedback — all within your browser.

> 🎤 Say “Start”, “One”, “Two”, or “Three” to choose and control your exercises — no buttons needed.

## 🌟 Key Features

- 🎯 **Real-time Body Tracking** (via TensorFlow.js and BlazePose)
- 📐 **Angle Calculation & Form Feedback** (e.g., knee and hip joint monitoring)
- 📢 **Voice-activated Navigation**
- 🎧 **Audio Feedback System** (motivation, mistakes, instructions)
- 🔊 **Idle Detection & Encouragement** (plays motivational sounds if you pause too long)
- 👀 **3D Visualization** of body posture using ScatterGL (for supported devices)

## 🚀 How It Works

1. Open the app in a browser or install as the APK.
2. Tap or say “Start” to begin.
3. Choose an exercise by saying “One” (Jumping Jacks), “Two” (Squats), or “Three” (High Knee Raises).
4. Follow voice instructions and visual feedback.
5. The app counts reps, checks form (e.g. knees caving in), and motivates you in real time.

## 🧩 Exercises Supported

- 🤸 Jumping Jacks
- 🏋️‍♂️ Squats
- 🦵 High Knee Raises

Each comes with:
- Real-time rep counter
- Audio guide and feedback
- 3D pose overlay (optional)
- Voice-enabled stop functionality (“Stop” command)

## 🧠 Tech Stack

- **TensorFlow.js** + **BlazePose**: Pose detection and 3D keypoint estimation
- **JavaScript (Vanilla)**: Core logic and DOM control
- **Web Speech API**: Voice recognition and control
- **HTML5 Canvas & Video**: Real-time drawing and feedback
- **Three.js + ScatterGL**: 3D keypoint visualization
- **Bootstrap**: Responsive layout and UI buttons

## 🛠️ Setup & Deployment

This is a static web app. You can run it locally or host it via GitHub Pages, Firebase, or any static server.

### Local Setup

```bash
git clone https://github.com/YOUR_USERNAME/movemate.git
cd movemate
# Use local server
npm start
```

### Or use Live Server in VSCode.

## 📣 Team & Hackathon

Built with 💪 during **SF Hacks 2025** by:
- Ayk Harutyunyan, Akmal Shovkatov, Shohabbos Mukhammatov, Arman Daghbashyan
- Special thanks to the TensorFlow.js open source community!

---

> Move your body. Use your voice. No excuses. Just MoveMate. 💥
