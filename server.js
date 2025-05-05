const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // For future CSS/JS support
app.set('view engine', 'ejs');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ MongoDB Connected');
}).catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
});

// Schema & Model
const taskSchema = new mongoose.Schema({
    name: String,
    email: String,
    selectedTasks: [String]
});
const Task = mongoose.model('Task', taskSchema);

// Routes

// Home - Show form
app.get('/', (req, res) => {
    res.render('form');
});

// Form Submit - Save to DB and Show Result
app.post('/submit', (req, res) => {
    const { name, email, tasks } = req.body;

    // Handle case where no tasks are selected
    const selected = Array.isArray(tasks) ? tasks : (tasks ? [tasks] : []);

    const newTask = new Task({
        name,
        email,
        selectedTasks: selected
    });

    newTask.save()
        .then(() => {
            // Convert task values to integers (if numeric) to calculate cost
            const numericTasks = selected.map(task => parseInt(task)).filter(n => !isNaN(n));
            const totalCost = numericTasks.reduce((sum, t) => sum + t, 0);

            res.render('result', {
                name,
                email,
                selectedTasks: selected,
                totalCost
            });
        })
        .catch(err => {
            console.error('❌ Error saving to DB:', err);
            res.status(500).send('❌ Server Error');
        });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
