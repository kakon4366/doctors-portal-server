const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ztfxg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});

async function run() {
	try {
		await client.connect();
		const serviceCollection = client
			.db("doctors_portal")
			.collection("services");

		const bookingCollection = client
			.db("doctors_portal")
			.collection("bookings");

		const userCollection = client.db("doctors_portal").collection("users");

		app.get("/services", async (req, res) => {
			const query = {};
			const cursor = serviceCollection.find(query);
			const result = await cursor.toArray();
			res.send(result);
		});

		app.get("/booking", async (req, res) => {
			const patient = req.query.patient;
			const query = { patient: patient };
			const bookings = await bookingCollection.find(query).toArray();
			res.send(bookings);
		});

		//put
		app.put("/user/:email", async (req, res) => {
			const email = req.params.email;
			const user = req.body;
			const filter = { email: email };
			const options = { upsert: true };
			const updateDoc = {
				$set: user,
			};
			const result = await userCollection.updateOne(
				filter,
				updateDoc,
				options
			);
			res.send(result);
		});

		// get
		app.get("/available", async (req, res) => {
			const date = req.query.date; // || "May 14, 2022";
			console.log(date);

			const services = await serviceCollection.find().toArray();

			const query = { date: date };
			const booking = await bookingCollection.find(query).toArray();

			services.forEach((service) => {
				const serviceBooking = booking.filter(
					(book) => book.treatment === service.name
				);
				const bookedSlots = serviceBooking.map((book) => book.slot);

				const available = service.slots.filter(
					(slot) => !bookedSlots.includes(slot)
				);

				service.slots = available;
			});

			res.send(services);
		});

		//add booking data
		app.post("/booking", async (req, res) => {
			const booking = req.body;
			const query = {
				treatment: booking.treatment,
				date: booking.date,
				patient: booking.patient,
			};
			const exists = await bookingCollection.findOne(query);
			if (exists) {
				return res.send({ success: false, booking: exists });
			}
			const result = await bookingCollection.insertOne(booking);
			return res.send({ success: true, result: result });
		});
	} finally {
	}
}
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("Doctors portal server is running");
});

app.listen(port, () => {
	console.log(`This server is running port: ${port}`);
});
