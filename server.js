const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ObjectId } = require('mongodb')
const { response } = require('express')
require('dotenv').config()

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'sample_mflix',
    collection

MongoClient.connect(dbConnectionStr)
    .then(client => {
        console.log(`Connected to database`)
        db = client.db(dbName)
        collection= db.collection('movies')
    })

app.use(express.urlencoded({extended : true}))
app.use(express.json())
app.use(cors())
app.use(express.static('public'))

app.get('/search', async (req, res) => {
    try {
        let result = await collection.aggregate([
            {
                "$Search": {                    
                    "autocomplete": {           
                        "query": `${`request.query.query`}`,
                        "path": "title",
                        "fuzzy": {              // User can make spelling mistakes in search
                            "maxEdits": 2,      // User can make up to two spelling mistakes
                            "prefixLength": 3   // User has to type in at least three letters before Mongo searches
                        }
                    }
                }
            }
        ]).toArray()
        response.send(result)
    } catch (err) {
        console.error(err)
        response.status(500).send({message: err.message})
    }
})

app.get('/get/:id', async (req, res) => {
    try {
        let result = await collection.findOne({
            "_id" : ObjectId(request.params.id)
        })
        response.send(result)
    } catch(err) {
        console.error(err)
        response.status(500).send({message: err.message})
    }
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
    console.log(`Server is running.`)
})