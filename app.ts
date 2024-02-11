// server.ts
import express, { Request, Response } from "express";
import axios from "axios";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/stripe-webhook", async (req: Request, res: Response) => {
	try {
		const eventType = req.body.type;
		const customer_email = req.body.data.object.customer_email;

		console.log(
			`🍀 \n | 🍄 app.post \n | 🍄 customer_email:`,
			customer_email
		);
		console.log(`🍀 \n | 🍄 app.post \n | 🍄 eventType:`, eventType);

		if (eventType !== "checkout.session.completed") {
			console.log(`Received unsupported event type: ${eventType}`);
			return res.sendStatus(400);
		}

		const formData = new FormData();
		formData.append("email", customer_email);
		formData.append("role", "PREMIUM");

		await axios
			.post(
				"https://60c6-38-6-227-3.ngrok-free.app/api/updateUserRole",
				formData
			)
			.then((result) => {
				res.status(200).json(result);
			})
			.catch((err) => {
				console.error(err);
				res.status(500).json({ message: "Internal Server Error" });
			});
	} catch (error) {
		console.error("Error handling webhook event:", error);
		res.sendStatus(500);
	}
});

app.listen(port, () => {
	console.log(`Server is listening on port ${port}`);
});
