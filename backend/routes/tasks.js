const express = require('express')
const router = express.Router()
const pool = require('../config/db')


router.get('/', async (req, res) => {
  try {
const result = await pool.query('SELECT * FROM tasks')
    res.json(result.rows)
  } catch (error) {
console.error(error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})


router.post('/', async (req, res) => {
  try {
    const { titre, description, priority, status, date_limite } = req.body

    if (!titre) {
    return res.status(400).json({
        message: 'Le titre est obligatoire'
      })
    }

const result = await pool.query(
  `INSERT INTO tasks (titre, description, priority, status, date_limite)
   VALUES ($1, $2, $3, $4, $5)
   RETURNING *`,
  [titre, description, priority, status, date_limite]
)

res.status(201).json(result.rows[0])

  } catch (error) {
console.error(error)
    res.status(500).json({
    message: 'Erreur lors de la création de la tâche'
    })
  }
})

// Modifier une tâche existante
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { titre, description, priority, status, date_limite } = req.body

    const result = await pool.query(
      `UPDATE tasks
       SET titre = $1,
           description = $2,
           priority = $3,
           status = $4,
           date_limite = $5
       WHERE id = $6
       RETURNING *`,
      [titre, description, priority, status, date_limite, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Tâche introuvable'
      })
    }

    res.json(result.rows[0])

  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Erreur lors de la modification'
    })
  }
})

// Supprimer une tâche
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Tâche introuvable'
      })
    }

    res.json({
      message: 'Tâche supprimée avec succès',
      task: result.rows[0]
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Erreur lors de la suppression'
    })
  }
})

module.exports = router