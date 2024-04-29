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
    const Users = BuisnessListingDB.collection("users");

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

    app.get("/tool/:slug", async (req, res) => {
      const slug = req.params.slug;
      const result = await listing.findOne({
        slug,
      });
      res.send(result);
    });

    /* add a listing start */
    app.post("/addListing", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      body.pending = true;
      body.published = false;
      body.featured = false;
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

    /* create a new user start */
    app.post("/api/auth/register", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      // console.log(body);
      const result = await Users.insertOne(body);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again leter",
          status: false,
        });
      }
    });
    /* create a new user end */

    // get all users start
    app.get("/allUsers", async (req, res) => {
      const cursor = Users.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // get all users end

    /*//? show myListing page start -- this api is tested working properly */
    app.get("/myListing/:email", async (req, res) => {
      // console.log('email',req.params.email);

      const myListing = await listing
        .find({
          submitedBy: req.params.email,
        })
        .toArray();
      res.send(myListing);
    });
    /* show my listing page  end */

    /*//? show my pending Listing page start -- this api is tested working properly do not touch it*/
    app.get("/myPending/:email", async (req, res) => {
      // console.log('email',req.params.email);
      const myListing = await listing
        .find({
          listedBy: req.params.email,
          pending: true,
        })
        .toArray();
      res.send(myListing);
    });
    /* show my listing page  end */

    /*//? show my Published Listing page start -- this api is tested working properly do not touch it*/
    app.get("/myPublished/:email", async (req, res) => {
      // console.log('email',req.params.email);
      const myListing = await listing
        .find({
          listedBy: req.params.email,
          pending: false,
        })
        .toArray();
      res.send(myListing);
    });
    /* show my listing page  end */

    /*//? show My Featured Listing page start -- this api is tested working properly do not touch it*/
    app.get("/myFeatured/:email", async (req, res) => {
      // console.log('email',req.params.email);
      const myListing = await listing
        .find({
          listedBy: req.params.email,
          featured: true,
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

    // ! Below All Api Will be Related to Admin | Please To not Change anything Here.

    // Find All listing Data start
    app.get("/all-listing", async (req, res) => {
      const cursor = listing.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // Find All listing Data end

    /*//? show All website pending Data - start -- this api is tested working properly do not touch it*/
    app.get("/all-pending", async (req, res) => {
      // console.log('email',req.params.email);
      const allPending = await listing
        .find({
          pending: true,
        })
        .toArray();
      res.send(allPending);
    });
    /* show All website pending Data end */

    /*//? show All Published Listing api start -- this api is tested working properly do not touch it*/
    app.get("/all-published", async (req, res) => {
      // console.log('email',req.params.email);
      const allPublished = await listing
        .find({
          pending: false,
        })
        .toArray();
      res.send(allPublished);
    });
    /* show All Published Listing api end */

    /*//? show All Featured Listing api start -- this api is tested working properly do not touch it*/
    app.get("/all-featured", async (req, res) => {
      // console.log('email',req.params.email);
      const allFeatured = await listing
        .find({
          featured: true,
        })
        .toArray();
      res.send(allFeatured);
    });
    /* show All Featured Listing api end */

    /* //?update a pending listing to published listing start -- this api is tested & working properly don't touch it. */
    app.put("/pendingListing/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          pending: false,
          published: true,
        },
      };
      const result = await listing.updateOne(filter, updateDoc);
      console.log(result);
      res.send(result);
    });
    /* update a pending listing to published listing end */

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
