const express = require('express')
const app = express()
require('dotenv').config()
const jwt = require('jsonwebtoken');

const port = 5500 || process.env.PORT

// cors && middleware
app.use(express.json())
const cors = require('cors')
app.use(cors())

// verify jwt token
function verifyToken(req, res, next) {
    const authorization = req.headers?.authorization;
    // console.log(authorization);
    if (!authorization) {
      return res.status(403).send({ success: false, message: 'Forbidden Access' });
    }
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ success: false, message: 'Unauthorized access' });
      }
      req.decoded = decoded;
      // console.log(decoded);
      next();
    });
  }
  

// mongo client
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zo2yn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// connect mongodb 
async function connect() {
    await client.connect() ? console.log('connected') : console.log('not connected');

    // collections
    const servicesCollection = client.db('manufacturer').collection('services');
    const newsletterCollection = client.db('manufacturer').collection('subscribers');
    const ordersCollection = client.db('manufacturer').collection('orders');
    const usersCollection = client.db('manufacturer').collection('orders');

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

    // get specific services
    app.get('/api/services/:id', async (req, res) => {
        const id = req.params.id;
        const service = await servicesCollection.findOne({ _id: ObjectId(id) });
        res.send(service);
    });
    // get all orders
    app.get('/api/orders', async (req, res) => {
        const orders = await ordersCollection.find({}).toArray();
        res.send(orders);
    });

    // orders get api with email
    app.get('/api/orders/:email', async (req, res) => {
        const email = req.params.email;
        const filter = { email: email };
        const orders = await ordersCollection.find(filter).toArray();
        res.send(orders);
    });

    // order post api
    app.post('/api/orders', async (req, res) => {
        const order = req.body;
        await ordersCollection.insertOne(order);
        res.send(order);
    });

    // users put api
  // user put api
  app.put('/api/user/:email', async (req, res) => {
    const email = req.params.email;
    const user = req.body;
    const filter = { email: email };
    const options = { upsert: true };
    const updateDoc = {
      $set: user,
    };
    const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
    const result = await usersCollection.updateOne(filter, updateDoc, options);
    res.send({ result, token });
    // res.send(result);
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