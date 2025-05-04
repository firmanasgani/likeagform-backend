import express from 'express'
import apiRouter from './router/api.js'
import connection from './connection.js'
import dotenv from 'dotenv'

const app = express()
const env = dotenv.config().parsed
const port = env.APP_PORT
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// app.use((req, res) => {
//     res.status(404).json({
//         message: 'Not Found'
//     })
// })
app.use('/api', apiRouter)

connection(env.MONGO_URL, env.MONGODB_NAME)


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})