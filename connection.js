import mongoose from "mongoose";


const connection = (url, dbname) => {
    mongoose.connect(url, {
        dbName: dbname
    })

    const connection = mongoose.connection
    connection.on('error', console.error.bind(console, 'Connection error: '))
    connection.once('open', () => {
        console.log('Database connected')
    })
}

export default connection

