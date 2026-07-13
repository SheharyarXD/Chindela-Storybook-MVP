import { describe, it, expect } from "vitest";
import { SubscriptionDurations, SubscriptionPricingGBPPence, SUBSCRIPTION_PRICE_PER_MONTH_GBP_PENCE, ContributionLimits } from "@contracts/constants";

describe("subscription pricing", () => {
  it("matches the client-agreed price schedule exactly (1/2/3/6/12mo = £2/£4/£6/£12/£24)", () => {
    expect(SubscriptionPricingGBPPence).toEqual({ 1: 200, 2: 400, 3: 600, 6: 1200, 12: 2400 });
  });

  it("is flat £2/month for every duration, regardless of age group", () => {
    for (const duration of SubscriptionDurations) {
      expect(SubscriptionPricingGBPPence[duration]).toBe(duration * SUBSCRIPTION_PRICE_PER_MONTH_GBP_PENCE);
    }
  });

  it("supports exactly the five durations the client agreed to", () => {
    expect([...SubscriptionDurations].sort((a, b) => a - b)).toEqual([1, 2, 3, 6, 12]);
  });
});

describe("contribution limits", () => {
  it("has a sane, non-zero minimum and a maximum above the minimum", () => {
    expect(ContributionLimits.minGBPPence).toBeGreaterThan(0);
    expect(ContributionLimits.maxGBPPence).toBeGreaterThan(ContributionLimits.minGBPPence);
  });
});
