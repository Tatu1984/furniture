import Razorpay from "razorpay";
import { env } from "@/lib/env";

let _instance: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!_instance) {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      throw new Error(
        "Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.",
      );
    }
    _instance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }
  return _instance;
}
