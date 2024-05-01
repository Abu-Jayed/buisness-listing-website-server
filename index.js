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
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
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
    const savedListing = BuisnessListingDB.collection("savedListing");

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
      res.status(200).send(result);
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

    /* //! update a listing saved */
    app.patch("/save-listing/:id", async (req, res) => {
      const id = req.params.id;

      try {
        const filter = { _id: new ObjectId(id) };
        console.log(filter);
        const updateDoc = {
          $inc: { saved: 1 }, // Increment the 'saved' property by 1
        };

        const result = await listing.updateOne(filter, updateDoc);
        console.log(result);

        if (result.modifiedCount === 1) {
          res.status(200).json({ message: "Object updated successfully." });
        } else {
          res.status(404).json({ message: "Object not found." });
        }
      } catch (error) {
        console.error("Error updating object:", error);
        res.status(500).json({ message: `Error updating object ${error}` });
      }
      // res.send("ok")
    });

    // POST route to create or update the "savedByUsers" property
    app.post("/update-savedTool/:id", async (req, res) => {
      const listingId = req.params.id;
      const { email } = req.body;
      console.log({ email, listingId });
      // res.status(200).send({ message: 'ok' })
      try {
        // Find the listing by ID
        const listingDoc = await listing.findOne({
          _id: new ObjectId(listingId),
        });
        const toolName = listingDoc.toolName;
        console.log({ listingDoc });
        if (!listingDoc) {
          res.status(404).send({ error: "Listing not found" });
          return;
        }

        // Update savedByUsers in the listing collection
        let savedByUsers = listingDoc.savedByUsers || [];
        const emailIndex = savedByUsers.indexOf(email);
        if (emailIndex !== -1) {
          savedByUsers.splice(emailIndex, 1); // Remove email if it exists
        } else {
          savedByUsers.push(email); // Add email if it doesn't exist
        }
        await listing.updateOne(
          { _id: new ObjectId(listingId) },
          { $set: { savedByUsers: savedByUsers } }
        );

        // Update thisUserLikedTool in the customer collection
        const userDoc = await savedListing.findOne({ email: email });

        if (userDoc) {
          let thisUserLikedTool = userDoc.thisUserLikedTool || [];
          const existingIndex = thisUserLikedTool.findIndex(
            (item) => item.id === listingId.toString()
          );

          if (existingIndex !== -1) {
            // If the listing ID already exists, remove it
            thisUserLikedTool.splice(existingIndex, 1);
          } else {
            // If the listing ID doesn't exist, add it to the array
            thisUserLikedTool.push({
              id: listingId.toString(),
              toolName: toolName,
            });
          }

          // Update the document in the collection
          await savedListing.updateOne(
            { email: email },
            { $set: { thisUserLikedTool: thisUserLikedTool } }
          );
        } else {
          // If the user document doesn't exist, create a new entry
          await savedListing.insertOne({
            email: email,
            thisUserLikedTool: [
              { id: listingId.toString(), toolName: toolName },
            ],
          });
        }

        res
          .status(200)
          .send({ message: "Customer and listing updated successfully" });
      } catch (error) {
        console.error("Error updating customer and listing:", error);
        res.status(500).send({ error: "Internal server error" });
      }
    });

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
