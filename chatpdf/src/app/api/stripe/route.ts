import { db } from "@/lib/db"; 
import { userSubscriptions } from "@/lib/db/schema"; 
import { stripe } from "@/lib/stripe"; 
import { auth, currentUser } from "@clerk/nextjs/server"; 
import { eq } from "drizzle-orm"; // ORM helper for equality checks
import { NextResponse } from "next/server"; 

// Base URL for redirection after Stripe session
const return_url = process.env.NEXT_BASE_URL + "/";

// GET handler to manage subscription logic
export async function GET() {
  try {
    // Authenticate the user
    const { userId } = await auth(); // Get authenticated user's ID
    const user = await currentUser(); // Get current user's details

    // Check if the user is authenticated
    if (!userId) {
      return new NextResponse("unauthorized", { status: 401 }); // Return 401 if not authenticated
    }

    // Check if the user already has a subscription
    const _userSubscriptions = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId)); // Query user subscription based on userId

    if (_userSubscriptions[0] && _userSubscriptions[0].stripeCustomerId) {
      // User has an existing subscription, create a billing portal session to manage it
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: _userSubscriptions[0].stripeCustomerId, // Existing Stripe customer ID
        return_url, // Redirect URL after managing subscription
      });
      return NextResponse.json({ url: stripeSession.url }); // Return billing portal URL
    }

    // If the user doesn't have a subscription, create a new checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: return_url, // Redirect after successful payment
      cancel_url: return_url, // Redirect if payment is canceled
      payment_method_types: ["card"], // Accept card payments
      mode: "subscription", // Set mode to subscription
      billing_address_collection: "auto", // Automatically collect billing address
      customer_email: user?.emailAddresses[0].emailAddress, // Prefill user's email
      line_items: [
        {
          price_data: {
            currency: "USD", // Currency
            product_data: {
              name: "Doxly Pro", // Subscription product name
              description: "Unlimited PDF sessions!", // Product description
            },
            unit_amount: 2000, // Subscription cost in cents ($20)
            recurring: {
              interval: "month", // Monthly recurring billing
            },
          },
          quantity: 1, // Quantity of the subscription
        },
      ],
      metadata: {
        userId, // Attach userId to the session for reference
      },
    });
    return NextResponse.json({ url: stripeSession.url }); 
  } catch (error) {
    console.log("stripe error", error); 
    return new NextResponse("internal server error", { status: 500 }); // Return 500 for server errors
  }
}
