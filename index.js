const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = 5000 || process.env.PORT;
const app = express();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7le8ogp.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const postsCollection = client.db('friendsbook').collection('posts');

        app.get('/', (req,res) => {
            res.send('Friendsbook is running');
        });

        /* Adding Posts */
        app.post('/posts', async (req, res) => {
            const body = req.body;
            const result = await postsCollection.insertOne(body);
            res.send(result);
        });

        /* Getting Post */
        app.get('/posts', async (req,res) => {
            let query = {};

            if(req.query.id){
                query = {
                    _id: ObjectId(req.query.id)
                }
            };

            const posts = await postsCollection.find(query).sort({_id:-1}).toArray();
            res.send(posts);
        })
        app.get('/postsinhome', async (req,res) => {
            const query = {};
            const posts = await postsCollection.find(query).sort({reactCount:-1}).limit(3).toArray();
            res.send(posts);
        })

        /* Like Update */
        app.put('/like', async(req, res)=> {
            const body = req.body;
            const options = {upsert: true};
            const id = body.id;
            const filter = {_id: ObjectId(id)};
            const updateDoc ={
                $set:{
                    reactor: body.reactor,
                    reactCount: body.reactCount
                }
            }
            const result = await postsCollection.updateOne(filter, updateDoc, options);
            res.send(result);

        })
    }
    finally{

    }

}
run().catch(console.log);


app.listen(port, () => {
    console.log(`App is running on port: ${port}`);
})