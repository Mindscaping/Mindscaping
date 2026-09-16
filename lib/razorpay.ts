import Razorpay from "razorpay";

// ponytail: singleton — swap to env-driven config when deploying
let razorpay: Razorpay | null = null;

export function getRazorpay() {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    });
  }
  return razorpay;
}

// Amount in paise (₹500 = 50000)
export function createOrder(amountInPaise: number, receipt: string) {
  return getRazorpay().orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt,
  });
}
