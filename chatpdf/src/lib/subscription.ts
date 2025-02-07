import { auth } from "@clerk/nextjs/server";
import { db } from "./db/index";
import { userSubscriptions } from "./db/schema";
import { eq } from "drizzle-orm";

// Constant representing one day in milliseconds
const DAY_IN_MS = 1000 * 60 * 60 * 24;

// Function to check if the current user has an active subscription
export const checkSubscription = async () => {
  // Authenticate and retrieve the current user's ID
  const { userId } = await auth();
  if (!userId) {
    return false;
  }

  // Query the database for the user's subscription details
  const _userSubscriptions = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId));

  // If the user has no subscription record, return false
  if (!_userSubscriptions[0]) {
    return false;
  }

  // Get the first subscription record for the user
  const userSubscription = _userSubscriptions[0];

  // Check if the subscription is valid:
  // - It must have a Stripe price ID (indicating an active subscription)
  // - The subscription period end date (plus one day) must be in the future
  const isValid =
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS >
      Date.now();

  // Return true if the subscription is valid, otherwise false
  return !!isValid;
};
