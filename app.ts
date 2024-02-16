// server.ts
import express, { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

const app = express();
const port = process.env.PORT || 3000;
dotenv.config();

app.use(express.json());

app.post("/stripe-webhook", async (req: Request, res: Response) => {
	const eventType = req.body.type;
	const customer_email = req.body.data.object.customer_email;
	try {
		console.log(`Received event: ${eventType}`);
		if (eventType === "checkout.session.completed") {
			const formData = new FormData();
			formData.append("email", customer_email);
			formData.append("role", "PREMIUM");
			await axios
				.post(
					"https://60c6-38-6-227-3.ngrok-free.app/api/updateUserRole",
					formData,
					{
						headers: {
							"x-api-key": process.env.X_API_KEY,
						},
					}
				)
				.then((result) => {
					console.log(result);
					res.status(200);
				})
				.catch((err) => {
					console.error(err);
					res.status(500).json({ message: "Internal Server Error" });
				});
		} else if (
			eventType === "customer.subscription.created" ||
			eventType === "customer.subscription.resumed"
		) {
			const formData = new FormData();
			formData.append("email", customer_email);
			formData.append("role", "PREMIUM");
			await axios
				.post(
					"https://60c6-38-6-227-3.ngrok-free.app/api/updateUserRole",
					formData,
					{
						headers: {
							"x-api-key": process.env.X_API_KEY,
						},
					}
				)
				.then((result) => {
					console.log(result);
					res.status(200);
				})
				.catch((err) => {
					console.error(err);
					res.status(500).json({ message: "Internal Server Error" });
				});
		} else if (
			eventType === "customer.subscription.deleted" ||
			eventType === "customer.subscription.paused"
		) {
			const formData = new FormData();
			formData.append("email", customer_email);
			formData.append("role", "USER");
			await axios
				.post(
					"https://60c6-38-6-227-3.ngrok-free.app/api/updateUserRole",
					formData,
					{
						headers: {
							"x-api-key": process.env.X_API_KEY,
						},
					}
				)
				.then((result) => {
					console.log(result);
					res.status(200);
				})
				.catch((err) => {
					console.error(err);
					res.status(500).json({ message: "Internal Server Error" });
				});
		} else {
			console.log(`Received unsupported event type: ${eventType}`);
			return res.sendStatus(400);
		}
	} catch (error) {
		console.error("Error handling webhook event:", error);
		res.sendStatus(500);
	}
});

app.listen(port, () => {
	console.log(`Server is listening on port ${port}`);
});
