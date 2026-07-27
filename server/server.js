import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

const PAYPAL_CLIENT = process.env.PAYPAL_CLIENT;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_API = "https://api-m.sandbox.paypal.com";

// LOG ENV VARIABLES (safe)
console.log("PAYPAL_CLIENT loaded:", !!PAYPAL_CLIENT);
console.log("PAYPAL_SECRET loaded:", !!PAYPAL_SECRET);

app.post("/create-order", async (req, res) => {
    console.log("Incoming order request:", req.body);

    const { price, car } = req.body;

    if (!price || !car) {
        console.log("❌ Missing price or car");
        return res.json({ error: "Missing price or car" });
    }

    const auth = Buffer.from(`${PAYPAL_CLIENT}:${PAYPAL_SECRET}`).toString("base64");

    try {
        const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${auth}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [{
                    amount: { value: price.toString() },
                    description: car
                }]
            })
        });

        const data = await response.json();
        console.log("PayPal create-order response:", data);

        res.json(data);
    } catch (err) {
        console.log("❌ Error creating order:", err);
        res.json({ error: "PayPal create-order failed", details: err });
    }
});

app.post("/capture-order", async (req, res) => {
    console.log("Incoming capture request:", req.body);

    const { orderID } = req.body;

    if (!orderID) {
        console.log("❌ Missing orderID");
        return res.json({ error: "Missing orderID" });
    }

    const auth = Buffer.from(`${PAYPAL_CLIENT}:${PAYPAL_SECRET}`).toString("base64");

    try {
        const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${auth}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        console.log("PayPal capture response:", data);

        res.json(data);
    } catch (err) {
        console.log("❌ Error capturing order:", err);
        res.json({ error: "PayPal capture failed", details: err });
    }
});

app.listen(10000, () => console.log("Server running on port 10000"));
