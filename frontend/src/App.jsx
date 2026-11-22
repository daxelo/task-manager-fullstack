
import { useState, useEffect } from 'react'
import './App.css'

function App() {
  
  const [showForm, setShowForm] = useState(false)
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [dueDate, setDueDate] = useState('')
  const [editingTask, setEditingTask] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const[dueDateFilter, setDueDateFilter] = useState('ALL')

  useEffect(() => {
  async function fetchTasks() {
    try {
      const response = await fetch('http://localhost:5000/api/tasks')

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des tâches')
      }

      const data = await response.json()

      const formattedTasks = data.map((task) => ({
        ...task,
        dateLimite: task.date_limite
          ? task.date_limite.slice(0, 10)
          : '',
        priority: (
          { Haute: 'HIGH', Moyenne: 'MEDIUM', Basse: 'LOW' }[task.priority]
          || task.priority
        ),
        status: (
          { 'A faire': 'TODO', 'En cours': 'IN_PROGRESS', 'Terminée': 'COMPLETED' }[task.status]
          || task.status
        )
      }))

      setTasks(formattedTasks)

    } catch (error) {
      console.error('Erreur API :', error)
    }
  }

  fetchTasks()
}, [])

  async function handleSubmit(e) {

    

    e.preventDefault()

    if (editingTask) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/tasks/${editingTask.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          titre: title,
          description: description,
          priority: priority,
          status: editingTask.status,
          date_limite: dueDate
        })
      }
    )

    if (!response.ok) {
      throw new Error('Erreur lors de la modification')
    }

    const updatedTask = await response.json()

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === editingTask.id
          ? {
              ...updatedTask,
              dateLimite: updatedTask.date_limite
                ? updatedTask.date_limite.slice(0, 10)
                : ''
            }
          : task
      )
    )

    setEditingTask(null)

  } catch (error) {
    console.error(error)
    alert('Impossible de modifier la tâche')
    return
  }
} else {
  try {
    const response = await fetch('http://localhost:5000/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
         titre: title,
    description: description,
      priority: priority,
         status: 'TODO',
        date_limite: dueDate
      })
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la création de la tâche')
    }

    const nouvelleTache = await response.json()

    setTasks((prevTasks) => [
      ...prevTasks,
      {
        ...nouvelleTache,
        dateLimite: nouvelleTache.date_limite
          ? nouvelleTache.date_limite.slice(0, 10)
          : ''
      }
    ])

  } catch (error) {
    console.error(error)
  alert("Impossible d'enregistrer la tâche")
    return
  }
}

setTitle('')
   setDescription('')
    setPriority('MEDIUM')
  setDueDate('')
    setShowForm(false)
  
  }


async function updateTaskStatus(id, newStatus) {
  try {
    const task = tasks.find((task) => task.id === id)

    if (!task) return

    const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        titre: task.titre,
        description: task.description,
        priority: task.priority,
        status: newStatus,
        date_limite: task.dateLimite
      })
    })

    if (!response.ok) {
      throw new Error('Erreur lors du changement de statut')
    }

    const updatedTask = await response.json()

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id
          ? {
              ...updatedTask,
              dateLimite: updatedTask.date_limite
                ? updatedTask.date_limite.slice(0, 10)
                : ''
            }
          : task
      )
    )

  } catch (error) {
    console.error(error)
    alert('Impossible de modifier le statut')
  }
}

async function deleteTask(id) {
  const confirmation = window.confirm(
    'Voulez-vous vraiment supprimer cette tâche ?'
  )

  if (!confirmation) return

  try {
    const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression')
    }

    setTasks((prevTasks) =>
      prevTasks.filter((task) => task.id !== id)
    )

  } catch (error) {
    console.error(error)
    alert('Impossible de supprimer la tâche')
  }
}
function editTask(task) {
  setEditingTask(task)

setTitle(task.titre)
  setDescription(task.description)
    setPriority(task.priority)
  setDueDate(task.dateLimite)

  setShowForm(true)
}

function resetFilters() {
   setSearch('')
    setStatusFilter('ALL')
   setPriorityFilter('ALL')
   setDueDateFilter('ALL')
}

const totalTasks = tasks.length
 const todoTasks = tasks.filter(task => task.status === "TODO")
const inProgressTasks = tasks.filter(task => task.status === "IN_PROGRESS")
 const completedTasks = tasks.filter(task => task.status === "COMPLETED")
const filteredTasks = tasks.filter((task) => {
  const matchesSearch = task.titre
    .toLowerCase()
    .includes(search.toLowerCase())

  const matchesStatus =
    statusFilter === 'ALL' || task.status === statusFilter

  
  const matchesPriority =
  priorityFilter === 'ALL' || task.priority === priorityFilter

  const matchesDueDate =
  dueDateFilter === 'ALL' || task.dateLimite === dueDateFilter

  return matchesSearch && matchesStatus && matchesPriority && matchesDueDate
})

  return (
    
      <div className="app">
        <header className="header">
        <h1>Task Manager</h1>
       <input
  type="text"
  className="search-input"
  placeholder="Rechercher une tâche..."
  value={search}
onChange={(e) => setSearch(e.target.value)}
/>

       <button onClick={() => {
  setEditingTask(null)
   setTitle('')
  setDescription('')
   setPriority('MEDIUM')
  setDueDate('')
   setShowForm(true)
}}>
  + Ajouter une tâche
</button>
        </header>

        <main className="main">

          {showForm && (
            <div className="modal-overlay">
  <section className="task-form">

    <div className="space">
      <h2>{editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}</h2>
    <button className="boutton-fermer"
          type="button"
          onClick={() => setShowForm(false)}
        >
          ×
        </button>
        </div>
    <form onSubmit={handleSubmit}>
      <div>
        <label>Titre de la tâche</label>
        <input className="task-title"
          type="text"
          placeholder="Ex : Apprendre React"
          value={title}
          onChange={(e) => setTitle(e.target.value)} required
        />
      </div>

      <div>
        <label>Description</label>
        <textarea 
          placeholder="Décris ta tâche..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Priorité</label>
        <select  
        required

        value={priority}
        onChange={(e) => setPriority(e.target.value)}>
          
          <option value="LOW">Basse</option>
          <option value="MEDIUM">Moyenne</option>
          <option value="HIGH">Haute</option>
          
        </select>
        
      </div>

      <div>
        <label>Date limite</label>
        <input type="date" 
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        required
        />
      </div>

      <div className="form-actions" >
        <button className="enregistrer" type="submit">Enregistrer</button>

        <button className="annuler"
          type="button"
          onClick={() => setShowForm(false)}
        >
          Annuler
        </button>
      </div>

    </form>
  </section>
</div>
)}


          <section className="stats">

            <div className="stat-card">
             <div className="model1"> <h2>Total des taches</h2>
              <p>{totalTasks}</p></div>
            </div>
            <div className="stat-card"> 
             <div className="model2"> <h2>En cours</h2>
              <p>{inProgressTasks.length}</p></div>

          </div>
          <div className="stat-card">
           <div className="model3"> <h2>Terminées</h2>
            <p>{completedTasks.length}</p></div>
          </div>

          <div className="stat-card">

           <div className="model4"> <h2>A faire</h2>
            <p>{todoTasks.length}</p></div>
          </div>

          </section>

          
<section className="mes-taches">
  <h2>Mes tâches</h2>

  <div className="filters">
    <span>Filtrer par :</span>

    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
    >
      <option value="ALL">Tous les statuts</option>
      <option value="TODO">À faire</option>
      <option value="IN_PROGRESS">En cours</option>
      <option value="COMPLETED">Terminées</option>
    </select>

    <select
      value={priorityFilter}
      onChange={(e) => setPriorityFilter(e.target.value)}
    >
      <option value="ALL">Toutes les priorités</option>
      <option value="LOW">Basse</option>
      <option value="MEDIUM">Moyenne</option>
      <option value="HIGH">Haute</option>
    </select>

    <input
      type="date"
      value={dueDateFilter === 'ALL' ? '' : dueDateFilter}
      onChange={(e) => setDueDateFilter(e.target.value || 'ALL')}
    />

    <button
      type="button"
      onClick={resetFilters}
      className="reset-button"
    >
      Réinitialiser
    </button>
  </div>

  <div className="task-list">
    {tasks.length === 0 ? (
      <p>Aucune tâche pour le moment</p>
    ) : filteredTasks.length === 0 ? (
      <p>Aucune tâche ne correspond aux filtres.</p>
    ) : (
      filteredTasks.map((task) => (
        <div className="task-card" key={task.id}>
          <div className="task-info">
              <h3>{task.titre}</h3>
            <p>{task.description}</p>
             <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
  {task.priority === 'HIGH' ? 'Haute' :
   task.priority === 'MEDIUM' ? 'Moyenne' : 'Basse'}
</span>
             <span className="due-date-badge">
  Échéance : {task.dateLimite}
</span>
          </div>

    <div className="task-actions">
            <span className={`status-badge status-${task.status.toLowerCase()}`}>
  {task.status === 'TODO' ? 'À faire' :
   task.status === 'IN_PROGRESS' ? 'En cours' : 'Terminée'}
</span>
            
            <select
              value={task.status}
              onChange={(e) =>
                updateTaskStatus(task.id, e.target.value)
              }      
            >
              <option value="TODO">À faire</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="COMPLETED">Terminée</option>
            </select>

     <button className="edit-button" onClick={() => editTask(task)}>
              Modifier
            </button>       

            <button className="delete-button" onClick={() => deleteTask(task.id)}>
              Supprimer
            </button>
          </div>
        </div>
      ))
    )}
  </div>
</section>

        </main>
        
      
        </div>
  )
}

export default App
