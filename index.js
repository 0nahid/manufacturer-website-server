const express = require('express')
const app = express()
require('dotenv').config()

const port = 5500 || process.env.PORT

// cors && middleware
app.use(express.json())
const cors = require('cors')
app.use(cors())


// mongo client
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zo2yn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// connect mongodb 
async function connect() {
    await client.connect() ? console.log('connected') : console.log('not connected');

    // collections
    const servicesCollection = client.db('manufacturer').collection('services');
    const newsletterCollection = client.db('manufacturer').collection('subscribers');

    //  post api 
    app.post('/api/services', async (req, res) => {
        const service = req.body;
        await servicesCollection.insertOne(service);
        res.send(service);
    });

    // get api
    app.get('/api/services', async (req, res) => {
        const services = await servicesCollection.find({}).sort({ $natural: -1 }).toArray();
        res.send(services);
    })

    // newsletter post api
    app.post('/api/newsletter/:email', async (req, res) => {
        const email = req.params.email;
        const filter = { email: email };
        const options = { upsert: true };
        const result = await newsletterCollection.findOneAndUpdate(filter, { $set: { email: email } }, options);
        res.send(result);
    })



}
connect().catch(console.dir);

app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))