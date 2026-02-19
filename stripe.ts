import { Request, Response } from 'express';
import { getStripe } from '../_core/stripe';
import { ENV } from '../_core/env';
import * as db from '../db';
import { sendDonationThankYou, sendEventConfirmation } from '../_core/email';

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    console.error('[Webhook] No signature found');
    return res.status(400).send('No signature');
  }

  let event;

  try {
    const stripeClient = getStripe();
    event = stripeClient.webhooks.constructEvent(
      req.body,
      sig,
      ENV.stripeWebhookSecret
    );
  } catch (err: any) {
    console.error('[Webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('[Webhook] Received event:', event.type, event.id);

  // Handle test events
  if (event.id.startsWith('evt_test_')) {
    console.log('[Webhook] Test event detected, returning verification response');
    return res.json({ verified: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        console.log('[Webhook] Checkout completed:', session.id);

        const metadata = session.metadata || {};
        const userId = metadata.user_id ? parseInt(metadata.user_id) : null;
        const eventId = metadata.event_id ? parseInt(metadata.event_id) : null;

        if (metadata.type === 'inner_circle') {
          // Inner Circle subscription payment
          console.log('[Webhook] Processing Inner Circle subscription');
          if (userId) {
            const pending = await db.getMembershipByUserId(userId);
            if (pending) {
              await db.updateMembershipStatus(pending.id, 'active');
              // Store the subscription ID for future management
              if (session.subscription) {
                await db.updateMembershipByStripeSubscriptionId(
                  session.subscription,
                  { startDate: new Date() }
                );
                // Also set the subscription ID on the membership
                const activeMembership = await db.getActiveMembershipByUserId(userId);
                if (activeMembership && !activeMembership.stripeSubscriptionId) {
                  await db.updateMembershipStatus(activeMembership.id, 'active');
                }
              }
            }
          }
          console.log('[Webhook] Inner Circle activated for user:', userId);
        } else if (metadata.type === 'founders_membership') {
          // Founders Membership payment
          console.log('[Webhook] Processing Founders Membership payment');
          await db.updateMembershipByStripePaymentIntent(
            session.payment_intent || session.id,
            {
              status: 'active',
              startDate: new Date(),
            }
          );
          console.log('[Webhook] Founders Membership activated for user:', userId);
        } else if (eventId) {
          // Event registration payment
          console.log('[Webhook] Processing event registration payment');
          await db.updateEventRegistrationBySessionId(session.id, {
            status: 'confirmed',
            stripePaymentIntentId: session.payment_intent,
          });

          // Send event confirmation email
          if (metadata.event_title && metadata.customer_email && metadata.customer_name) {
            const eventDate = metadata.event_date ? new Date(metadata.event_date) : new Date();
            await sendEventConfirmation({
              email: metadata.customer_email,
              name: metadata.customer_name,
              eventTitle: metadata.event_title,
              eventDate,
              eventType: metadata.event_type || 'event',
              meetingLink: metadata.meeting_link,
              price: session.amount_total ? session.amount_total / 100 : 0,
            });
          }
          console.log('[Webhook] Event registration completed for user:', userId);
        } else {
          // Donation payment
          console.log('[Webhook] Processing donation payment');
          
          const amount = session.amount_total;
          const isRecurring = session.mode === 'subscription';

          await db.updateDonationBySessionId(session.id, {
            amount: amount ? (amount / 100).toString() : '0',
            status: 'completed',
            stripePaymentIntentId: session.payment_intent,
            stripeSubscriptionId: session.subscription || undefined,
          });

          // Send thank you email
          if (metadata.customer_email && metadata.customer_name && amount) {
            await sendDonationThankYou({
              email: metadata.customer_email,
              name: metadata.customer_name,
              amount: amount / 100,
              isRecurring,
            });
          }
          console.log('[Webhook] Donation completed for user:', userId, 'Amount:', amount);
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        console.log('[Webhook] Subscription cancelled:', subscription.id);
        
        // Check if this is an Inner Circle subscription
        const membership = await db.getMembershipByStripeSubscriptionId(subscription.id);
        if (membership) {
          await db.updateMembershipStatus(membership.id, 'cancelled');
          console.log('[Webhook] Inner Circle membership cancelled for membership:', membership.id);
        }
        
        // Also try recurring donation cancellation
        try {
          await db.cancelRecurringDonation(subscription.id);
        } catch {
          // Not a donation subscription, that's fine
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        console.log('[Webhook] Invoice payment failed:', invoice.id);
        
        // Check if this is an Inner Circle subscription
        if (invoice.subscription) {
          const membership = await db.getMembershipByStripeSubscriptionId(invoice.subscription as string);
          if (membership) {
            console.log('[Webhook] Inner Circle payment failed for membership:', membership.id);
            // Don't cancel immediately - Stripe will retry
          }
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as any;
        console.log('[Webhook] Invoice paid:', invoice.id);
        
        // Handle recurring donation invoice
        if (invoice.subscription) {
          try {
            await db.recordRecurringDonationPayment(invoice.subscription as string, invoice.amount_paid / 100);
          } catch {
            // Not a donation subscription
          }
        }
        break;
      }

      default:
        console.log('[Webhook] Unhandled event type:', event.type);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('[Webhook] Error processing event:', error);
    res.status(500).json({ error: error.message });
  }
}
