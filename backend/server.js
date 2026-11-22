const express = require('express')
const cors = require('cors')
const pool = require('./config/db')
const taskRoutes = require('./routes/tasks')

require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api/tasks', taskRoutes)

app.get('/', (req, res) => {
    res.send('Bienvenue sur l\'API Task Manager !')
})

const PORT = process.env.PORT || 5000



app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`)
})