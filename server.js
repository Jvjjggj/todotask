const express = require("express")
const sqlite3 = require("sqlite3")
const { open } = require("sqlite")
const path = require("path")
const app = express()

app.use(express.json())

const dbPath = path.join(__dirname, "tasks.db")

let db = null;

const connectToServer = async () => {
    try {
        db = await open(
            {
                filename: dbPath,
                driver: sqlite3.Database
            }
        )

        await db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        priority TEXT,
        dueDate TEXT,
        createdAt TEXT
      );
    `);
        const port=process.env.PORT || 4000
        app.listen(port, () => {
            console.log("App running success")
        })



    } catch (error) {
        console.log(error)
    }
}


app.get("/task/sort", async (req, res) => {
    const query = `select * from tasks`
    const response = await db.all(query)

    response.sort((a, b) => {
        const order = { "High": 1, "Medium": 2, "Low": 3 }

        if (order[a.priority] !== order[b.priority]) {
            return order[a.priority] - order[b.priority]
        }
    })

    res.json(response)
})

app.get("/tasks", async (req, res) => {
    const query = `
    select * from tasks
    `
    const response = await db.all(query)

    res.json(response)
})

app.post("/task", async (req, res) => {
    const { title, priority, dueDate } = req.body
    const createdAt = new Date().toISOString()
    const query = `insert into tasks(title,priority,dueDate,createdAt)
    values("${title}","${priority}","${dueDate}","${createdAt}")`

    await db.run(query)

    res.json("Task")
})

app.put("/task/:id", async (req, res) => {
    let { id } = req.params
    const { title, priority, dueDate } = req.body
    const query = `
    select * from tasks
    `
    id = parseInt(id)
    const response = await db.all(query)
    const taskwithId = response.filter(i => i.id === id)
    if (!taskwithId) {
        res.status(400).json("Task id not found")
    }
    const createdAt = new Date().toISOString();
    const query1 =
        `
    update tasks
    set 
    title="${title}",
    priority="${priority}",
    dueDate="${dueDate}",
    createdAt="${createdAt}"

    where id=${id}
    `
    db.run(query1);
    res.json("Task updated successfully")

})

app.get("/task/:id", async (req, res) => {
    let { id } = req.params
    id = parseInt(id)

    const query = `select * from tasks`
    const response = await db.all(query)
    const taskById = response.filter(i => i.id === id)
    if (taskById.length === 0) {
        res.status(400).json("Task not found")
    }
    console.log(taskById)
    res.json(taskById)
})

app.delete("/task/:id", async (req, res) => {
    let { id } = req.params
    id = parseInt(id)
    const query =
        `
      delete from tasks where id=${id}
    `

    await db.run(query)
    res.json("Task deleted")
})



connectToServer()
