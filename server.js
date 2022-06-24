const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ObjectId } = require('mongodb')
require('dotenv').config()

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'sample_mflix',
    collection

MongoClient.connect(dbConnectionStr)
    .then(client => {
        console.log(`Connected to database`)
        db = client.db(dbName)
        collection = db.collection('movies')
    })

app.use(express.urlencoded({extended : true}))
app.use(express.json())
app.use(cors())
app.use(express.static('public'))

app.get('/search', async (req, res) => {
    try {
        let result = await collection.aggregate([
            {
                "$search": {                    
                    "autocomplete": {           
                        "query": `${req.query.query}`,
                        "path": "title",
                        "fuzzy": {              // User can make spelling mistakes in search
                            "maxEdits": 2,      // User can make up to two spelling mistakes
                            "prefixLength": 3   // User has to type in at least three letters before Mongo searches
                        }
                    }
                }
            }
        ]).toArray()
        result = result.slice(0, 10)
        res.send(result)
    } catch (err) {
        console.error(err)
        res.status(500).send({message: err.message})
    }
})

app.get('/get/:id', async (req, res) => {
    try {
        let result = await collection.findOne({
            "_id" : ObjectId(req.params.id)
        })
        res.send(result)
    } catch(err) {
        console.error(err)
        res.status(500).send({message: err.message})
    }
})

app.get('/rand', async (req, res) => {
    try {
        let result = await collection.aggregate([
            { 
                $sample: { size: 1 } // Get a random sample size of one
            }
        ]).toArray()
        res.send(result[0])
    }
    catch(e) {
        console.error(e)
        res.status(500).send({message: err.message})
    }
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
    console.log(`Server is running.`)
})