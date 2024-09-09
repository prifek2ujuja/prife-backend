import axios from "axios"
import config from "../config.js";

export const acceptPayment = async (amount: string | number, email: string) => {
  try {
    const paystackResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount,
        mobile_money: {
          phone: "0551234987",
          provider: "mpesa",
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.paystack_secret_key}`,
        },
      }
    );

    return paystackResponse.data;
  } catch (error) {
    console.log("unable to initialize paystack payment");
    console.log(error);
    return null;
  }
};

export const verifyTransaction = async () => {
  try {
    
  } catch (error) {
    
  }
}