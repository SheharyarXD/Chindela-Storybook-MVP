import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import {
  findSubscriptionsByParent,
  findActiveSubscription,
  createSubscription,
  findSubscriptionById,
  updateSubscription,
  cancelSubscription,
  createPayment,
  findPaymentsByParent,
} from "./queries/subscriptions";
import { createNotification } from "./queries/notifications";

export const subscriptionRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    return findSubscriptionsByParent(ctx.user.id);
  }),

  active: authedQuery
    .input(z.object({ childId: z.number(), ageGroupId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify child belongs to parent
      const { findChildById } = await import("./queries/children");
      const child = await findChildById(input.childId);
      if (!child || child.parentId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      return findActiveSubscription(input.childId, input.ageGroupId);
    }),

  create: authedQuery
    .input(
      z.object({
        childId: z.number(),
        ageGroupId: z.number(),
        duration: z.number().min(1).max(12),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { findChildById } = await import("./queries/children");
      const child = await findChildById(input.childId);
      if (!child || child.parentId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      const pricePerMonth = 1.0; // £1 per month
      const totalPrice = pricePerMonth * input.duration;

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + input.duration);

      const subscription = await createSubscription({
        parentId: ctx.user.id,
        childId: input.childId,
        ageGroupId: input.ageGroupId,
        duration: input.duration,
        pricePerMonth: pricePerMonth.toString(),
        totalPrice: totalPrice.toString(),
        currency: "GBP",
        status: "pending",
        startDate,
        endDate,
      });

      // Create payment record
      const paymentId = await createPayment({
        subscriptionId: subscription!.id,
        parentId: ctx.user.id,
        amount: totalPrice.toString(),
        currency: "GBP",
        status: "pending",
      });

      return { subscription, paymentId };
    }),

  // Simulate payment completion (in production, this would be Stripe webhook)
  completePayment: authedQuery
    .input(z.object({ subscriptionId: z.number(), paymentId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { updatePaymentStatus } = await import("./queries/subscriptions");
      
      await updatePaymentStatus(input.paymentId, "completed", {
        paidAt: new Date(),
      });

      const subscription = await updateSubscription(input.subscriptionId, {
        status: "active",
      });

      // Create notification
      await createNotification({
        userId: ctx.user.id,
        childId: subscription?.childId,
        type: "system",
        title: "Subscription Activated!",
        message: `Your subscription has been successfully activated for ${subscription?.duration} months.`,
        relatedId: subscription?.id,
      });

      return subscription;
    }),

  cancel: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const sub = await findSubscriptionById(input.id);
      if (!sub || sub.parentId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      return cancelSubscription(input.id);
    }),

  payments: authedQuery.query(async ({ ctx }) => {
    return findPaymentsByParent(ctx.user.id);
  }),
});
