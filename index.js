const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

/* sir ans start */
const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));
/* sir ans end */

app.use(express.json());

/* code from mongobd start */

const uri = `mongodb+srv://practiceGround:QkUtOWPRpckM4FF5@cluster0.pwifs1n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const BuisnessListingDB = client.db("BLW");
    // const collectionDemo = BuisnessListingDB.collection("collection_name");
    const listing = BuisnessListingDB.collection("listing");

    /* find all listing */
    app.get("/all-listing", async (req, res) => {
      const cursor = listing.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    /* find listing By category */
    app.get("/listing/resturent/", async (req, res) => {
      const query = { category: "resturent" };
      const cursor = listing.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    /* find data for single listing page / listing detail page  */

    app.get("/listing/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const cursor = listing.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    /* add a listing start */
    app.post("/addListing", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      // console.log(body);
      const result = await listing.insertOne(body);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again leter",
          status: false,
        });
      }
    });
    /* add a listing end */

    /*//? show myListing page start   this api is tested working properly */
    app.get("/myListing/:email", async (req, res) => {
      // console.log('email',req.params.email);
      
      const myListing = await listing
        .find({
            listedBy: req.params.email,
          })
          .toArray();
        res.send(myListing);
      });
    /* show my listing page  end */

    /* update a listing start */
    app.put("/listing/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      // console.log(body);
      const filter = { _id: new ObjectId(id) };
      // console.log('id',id);
      // console.log('body',body);
      // console.log('filter',filter);
      const updateDoc = {
        $set: {
          name: body.name,
          category: body.category,
          price: body.price,
        },
      };
      const result = await listing.updateOne(filter, updateDoc);
      res.send(result);
    });
    /* update a listing end */

    /* delete a listing code start */

    app.delete("/listing/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await listing.deleteOne(query);
      res.send(result);
    });

    /* delete a listing end */

    // Send a ping to confirm a successful connection
    await client.db("BLW").command({ ping: 1 });
    console.log("You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

/* code from mongobd end */

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
