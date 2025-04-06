import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import exerciseData from './public/data/exercise.js'; // Use a relative path

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'public', 'views')); // Correct the views path
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'launch.html'));
});

app.get('/homePage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
});

app.get('/exerciseSelection', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'exerciseSelection.html'));
});

app.get('/model', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'modelJJ.html'));
});

app.get('/infoPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'infopage.html'));
});

app.get('/exerciseExplainer', (req, res) => {
    const exercise = req.query.exercise; // Get the exercise from query parameters
    const exerciseInfo = exerciseData.find(item => item.exerciseName === exercise);

    if (exerciseInfo) {
        res.render('exerciseExplainer', { exerciseInfo });
    } else {
        res.render('exerciseExplainer', { exerciseInfo: { exerciseName: 'Not Found', exerciseText: 'Exercise not found.' } });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});