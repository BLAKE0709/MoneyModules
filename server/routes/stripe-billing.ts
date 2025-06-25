import type { Express } from "express";
import Stripe from "stripe";
import { isAuthenticated } from "../replitAuth";
import { storage } from "../storage";
import { STRIPE_PRICE_IDS, getPriceIdForPlan } from "../config/stripe-pricing";

// Initialize Stripe only if keys are available
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
}

export function registerStripeBillingRoutes(app: Express) {
  
  // Create payment intent for one-time payments
  app.post("/api/payments/create-intent", isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(503).json({ 
        message: "Payment processing not configured. Please add Stripe keys to environment." 
      });
    }

    try {
      const { amount, currency = "usd", description } = req.body;
      
      if (!amount || amount < 50) { // Minimum 50 cents
        return res.status(400).json({ message: "Invalid payment amount" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        description: description || "StudentOS Payment",
        metadata: {
          userId: req.user.claims.sub,
          email: req.user.claims.email
        }
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      });
    } catch (error: any) {
      console.error("Payment intent creation failed:", error);
      res.status(500).json({ 
        message: "Failed to create payment intent: " + error.message 
      });
    }
  });

  // Create subscription for schools or premium students
  app.post('/api/subscriptions/create', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(503).json({ 
        message: "Subscription billing not configured. Please add Stripe keys to environment." 
      });
    }

    try {
      const userId = req.user.claims.sub;
      const { plan, category, billing = "monthly" } = req.body;
      
      // Get price ID for the requested plan
      const priceId = getPriceIdForPlan(category, plan, billing);
      if (!priceId) {
        return res.status(400).json({ message: "Invalid subscription plan" });
      }

      // Check if user already has an active subscription
      const user = await storage.getUser(userId);
      if (user?.stripeSubscriptionId) {
        const existingSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        
        if (existingSubscription.status === 'active') {
          return res.json({
            subscription: existingSubscription,
            clientSecret: existingSubscription.latest_invoice?.payment_intent?.client_secret,
            message: "User already has active subscription"
          });
        }
      }

      // Create Stripe customer if needed
      let customerId = user?.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: req.user.claims.email,
          name: `${req.user.claims.first_name || ''} ${req.user.claims.last_name || ''}`.trim(),
          metadata: {
            userId: userId,
            plan: plan,
            category: category
          }
        });
        customerId = customer.id;
        
        // Update user with Stripe customer ID
        await storage.upsertUser({
          id: userId,
          email: req.user.claims.email,
          stripeCustomerId: customerId,
          firstName: req.user.claims.first_name,
          lastName: req.user.claims.last_name,
          profileImageUrl: req.user.claims.profile_image_url
        });
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId: userId,
          plan: plan,
          category: category,
          billing: billing
        }
      });

      // Update user with subscription ID
      await storage.upsertUser({
        id: userId,
        email: req.user.claims.email,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        firstName: req.user.claims.first_name,
        lastName: req.user.claims.last_name,
        profileImageUrl: req.user.claims.profile_image_url
      });

      res.json({
        subscription: {
          id: subscription.id,
          status: subscription.status,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end
        },
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        priceId: priceId,
        plan: plan,
        category: category
      });
    } catch (error: any) {
      console.error("Subscription creation failed:", error);
      res.status(500).json({ 
        message: "Failed to create subscription: " + error.message 
      });
    }
  });

  // Get current subscription status
  app.get('/api/subscriptions/status', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.json({ 
        hasSubscription: false,
        message: "Billing not configured" 
      });
    }

    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.stripeSubscriptionId) {
        return res.json({ 
          hasSubscription: false,
          plan: "free"
        });
      }

      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      const priceId = subscription.items.data[0]?.price.id;
      
      // Find which plan this price ID corresponds to
      let plan = "unknown";
      let category = "unknown";
      
      for (const [cat, plans] of Object.entries(STRIPE_PRICE_IDS)) {
        for (const [planName, priceIds] of Object.entries(plans)) {
          if (typeof priceIds === 'object' && (priceIds.monthly === priceId || priceIds.annual === priceId)) {
            category = cat;
            plan = planName;
            break;
          }
        }
      }

      res.json({
        hasSubscription: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
          plan: plan,
          category: category,
          priceId: priceId
        }
      });
    } catch (error: any) {
      console.error("Failed to get subscription status:", error);
      res.status(500).json({ 
        message: "Failed to get subscription status: " + error.message 
      });
    }
  });

  // Cancel subscription
  app.post('/api/subscriptions/cancel', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(503).json({ 
        message: "Subscription management not configured" 
      });
    }

    try {
      const userId = req.user.claims.sub;
      const { cancelImmediately = false } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user?.stripeSubscriptionId) {
        return res.status(404).json({ message: "No active subscription found" });
      }

      const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: !cancelImmediately,
        ...(cancelImmediately && { cancel_at: Math.floor(Date.now() / 1000) })
      });

      res.json({
        subscription: {
          id: subscription.id,
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          canceled_at: subscription.canceled_at
        },
        message: cancelImmediately 
          ? "Subscription canceled immediately" 
          : "Subscription will cancel at period end"
      });
    } catch (error: any) {
      console.error("Failed to cancel subscription:", error);
      res.status(500).json({ 
        message: "Failed to cancel subscription: " + error.message 
      });
    }
  });

  // Webhook endpoint for Stripe events
  app.post('/api/webhooks/stripe', async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Stripe not configured" });
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Stripe webhook secret not configured");
      return res.status(400).json({ message: "Webhook secret not configured" });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed:`, err.message);
      return res.status(400).json({ message: `Webhook Error: ${err.message}` });
    }

    try {
      switch (event.type) {
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          const userId = subscription.metadata.userId;
          
          if (userId) {
            // Update user subscription status
            const updateData: any = {
              id: userId,
            };
            
            if (event.type === 'customer.subscription.deleted') {
              updateData.stripeSubscriptionId = null;
            }
            
            await storage.upsertUser(updateData);
          }
          break;

        case 'invoice.payment_succeeded':
          const invoice = event.data.object as Stripe.Invoice;
          console.log(`Payment succeeded for invoice: ${invoice.id}`);
          break;

        case 'invoice.payment_failed':
          const failedInvoice = event.data.object as Stripe.Invoice;
          console.log(`Payment failed for invoice: ${failedInvoice.id}`);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ message: 'Webhook processing failed' });
    }
  });
}