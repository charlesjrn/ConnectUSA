/**
 * Stripe products and prices configuration for Chosen Connect.
 * Single source of truth for the Founding Circle membership.
 */

export const FOUNDING_CIRCLE = {
  name: "Founding Circle Membership",
  description:
    "Join the first 200 founding members of Chosen Connect. Access the private Founding Circle discussion space, monthly live group prayer and fellowship calls, and help shape the future of the community.",
  membershipType: "founder" as const,
  maxMembers: 200,
  plans: {
    monthly: {
      id: "founding_monthly",
      interval: "month" as const,
      priceInCents: 1500, // $15/month
      label: "$15 / month",
    },
    yearly: {
      id: "founding_yearly",
      interval: "year" as const,
      priceInCents: 12000, // $120/year ($10/month effective)
      label: "$120 / year",
      savings: "Save $60/year",
    },
  },
  benefits: [
    {
      title: "Private Discussion Space",
      description:
        "Access the Founding Circle discussion area — a dedicated space for deeper conversations, prayer, and fellowship with fellow founding members.",
    },
    {
      title: "Monthly Live Fellowship Call",
      description:
        "Join a monthly live group prayer and fellowship call where founding members connect, share testimonies, and pray together.",
    },
    {
      title: "Founding Member Badge",
      description:
        "Receive a permanent Founding Member badge on your profile, recognizing your early support and commitment to the community.",
    },
    {
      title: "Shape the Community",
      description:
        "Have a direct voice in the direction of Chosen Connect. Founding members get early access to new features and the ability to influence what we build next.",
    },
  ],
} as const;

/**
 * Format amount in cents to dollar string
 */
export function formatAmount(amountInCents: number): string {
  return `$${(amountInCents / 100).toFixed(2)}`;
}
