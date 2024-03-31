// server.ts
import express, { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import Stripe from "stripe";

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.STRIPE_SECRET_KEY) {
	console.warn(
		"WARNING: STRIPE_SECRET_KEY environment variable is required for Stripe integration."
	);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!!);

async function getCustomerEmail(customerId: any) {
	try {
		const customer = await stripe.customers.retrieve(customerId);
		if ("deleted" in customer && customer.deleted === true) {
			console.error("Customer has been deleted");
			return null;
		} else {
			console.log(
				`🍀 \n | 🍄 getCustomerEmail \n | 🍄 customer:`,
				customer.email
			);
			return customer.email;
		}
	} catch (error) {
		console.error("Error retrieving customer:", error);
	}
}

dotenv.config();

app.use(express.json());

app.post("/stripe-webhook", async (req: Request, res: Response) => {
	let email = req.body.data.object.customer_email;
	const customerId = req.body.data.object.customer;

	try {
		console.log(`Received event:`, req.body.type);
		if (req.body.type === "checkout.session.completed") {
			const formData = new FormData();
			formData.append("email", req.body.data.object.customer_email);
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
			req.body.type === "customer.subscription.created" ||
			req.body.type === "customer.subscription.resumed"
		) {
			const formData = new FormData();
			if (email) {
				console.log(`🍀 \n | 🍄 app.post \n | 🍄 email:`, email);
				formData.append("email", email);
			} else if (!email) {
				email = await getCustomerEmail(customerId);
				console.log(`🍀 \n | 🍄 app.post \n | 🍄 email:`, email);
				formData.append("email", email);
			}

			formData.append("role", "PREMIUM");
			// Change to PRODUCTION_BASE_URL when deploying to production
			await axios
				.post(
					`${process.env.LOCAL_DEVELOP_BASE_URL}/api/updateUserRole`,
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
			req.body.type === "customer.subscription.deleted" ||
			req.body.type === "customer.subscription.paused"
		) {
			const formData = new FormData();
			if (email) {
				console.log(`🍀 \n | 🍄 app.post \n | 🍄 email:`, email);
				formData.append("email", email);
			} else if (!email) {
				email = await getCustomerEmail(customerId);
				console.log(`🍀 \n | 🍄 app.post \n | 🍄 email:`, email);
				formData.append("email", email);
			}

			formData.append("role", "USER");

			// Change to PRODUCTION_BASE_URL when deploying to production
			await axios
				.post(
					`${process.env.LOCAL_DEVELOP_BASE_URL}/api/updateUserRole`,
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
			console.log(`Received unsupported event type: `, req.body.type);
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
