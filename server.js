const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Your route for rendering the result page
app.post('/result', (req, res) => {
    let selectedTasks = req.body.tasks || [];
    
    // If no tasks were selected, send back an empty result
    if (selectedTasks.length === 0) {
        return res.render('result', { selectedTasks: [], totalCost: 0 });
    }

    // Convert selected task values to integers
    selectedTasks = selectedTasks.map(task => parseInt(task));

    // Calculate the total cost
    let totalCost = selectedTasks.reduce((sum, task) => sum + task, 0);

    // Render the result page with the selected tasks and total cost
    res.render('result', { selectedTasks, totalCost });
});


// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));  // Agar future me CSS/JS add karoge

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB Connected');
}).catch(err => {
    console.error('MongoDB Connection Error:', err);
});

// Schema
const taskSchema = new mongoose.Schema({
    name: String,
    email: String,
    selectedTasks: [String]
});

const Task = mongoose.model('Task', taskSchema);

// Routes

// Form Display
app.get('/', (req, res) => {
    res.render('form');
});

// Form Submit
app.post('/submit', (req, res) => {
    const { name, email, tasks } = req.body;
    
    const newTask = new Task({
        name,
        email,
        selectedTasks: Array.isArray(tasks) ? tasks : [tasks]
    });

    newTask.save()
        .then(() => {
            res.render('result', { name, tasks: Array.isArray(tasks) ? tasks : [tasks] });
        })
        .catch(err => {
            console.error('Error saving to database:', err);
            res.send('Error saving data');
        });
});

// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
