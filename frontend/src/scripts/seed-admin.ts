/**
 * Super Admin + packages + trial seed.
 * Run: npm run seed:admin -w frontend
 */
import bcrypt from "bcrypt";
import mongoose from "mongoose";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set (use --env-file=.env.local)");
  }
  if (/127\.0\.0\.1|localhost/i.test(uri)) {
    throw new Error("MONGODB_URI must point to MongoDB Atlas");
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const { UserModel } = await import("../lib/models/user");
  const { PackageModel } = await import("../lib/models/package");
  const { TrialSettingsModel } = await import("../lib/models/trial-settings");
  const { PlatformSettingsModel } = await import("../lib/models/platform-settings");
  const { AuditLogModel } = await import("../lib/models/audit-log");

  const adminEmail = (process.env.SEED_SUPER_ADMIN_EMAIL || "admin@upsale.com").toLowerCase();
  const adminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD || "SuperAdmin123!";

  let admin = await UserModel.findOne({ email: adminEmail });
  if (!admin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    admin = await UserModel.create({
      name: "UPSale Super Admin",
      email: adminEmail,
      passwordHash,
      role: "super_admin",
      isActive: true,
    });
    console.log(`Created Super Admin: ${adminEmail}`);
  } else if (admin.role !== "super_admin") {
    admin.role = "super_admin";
    admin.isActive = true;
    await admin.save();
    console.log(`Upgraded existing user to Super Admin: ${adminEmail}`);
  } else {
    console.log(`Super Admin already exists: ${adminEmail}`);
  }

  const packages = [
    {
      name: "Starter",
      slug: "starter",
      shortDescription: "For a single counter that wants a simple QR loop.",
      featureBullets: [
        "500 customer profiles",
        "1 live QR offer",
        "Basic WhatsApp drafts",
        "Email support",
      ],
      limits: { offers: 1, customers: 500, campaignsPerMonth: 10, aiGenerations: 30 },
      sortOrder: 1,
      isMostPopular: false,
      isEnterprise: false,
      isActive: true,
      countryPricing: [
        { countryCode: "PK", currency: "PKR", amount: 4990, interval: "month" },
        { countryCode: "IN", currency: "INR", amount: 1499, interval: "month" },
        { countryCode: "AE", currency: "AED", amount: 79, interval: "month" },
        { countryCode: "US", currency: "USD", amount: 29, interval: "month" },
        { countryCode: "GB", currency: "GBP", amount: 19, interval: "month" },
      ],
    },
    {
      name: "Growth",
      slug: "growth",
      shortDescription: "For busy shops that message groups every week.",
      featureBullets: [
        "5,000 customer profiles",
        "Unlimited QR offers",
        "Customer groups & AI drafts",
        "Priority support",
      ],
      limits: { offers: 0, customers: 5000, campaignsPerMonth: 60, aiGenerations: 200 },
      sortOrder: 2,
      isMostPopular: true,
      isEnterprise: false,
      isActive: true,
      countryPricing: [
        { countryCode: "PK", currency: "PKR", amount: 9990, interval: "month" },
        { countryCode: "IN", currency: "INR", amount: 3499, interval: "month" },
        { countryCode: "AE", currency: "AED", amount: 179, interval: "month" },
        { countryCode: "US", currency: "USD", amount: 59, interval: "month" },
        { countryCode: "GB", currency: "GBP", amount: 39, interval: "month" },
      ],
    },
    {
      name: "Pro",
      slug: "pro",
      shortDescription: "For multi-location brands that need deeper control.",
      featureBullets: [
        "Unlimited customers",
        "Multi-location QR",
        "Advanced analytics",
        "Dedicated success manager",
      ],
      limits: { offers: 0, customers: 0, campaignsPerMonth: 0, aiGenerations: 0 },
      sortOrder: 3,
      isMostPopular: false,
      isEnterprise: false,
      isActive: true,
      countryPricing: [
        { countryCode: "PK", currency: "PKR", amount: 19990, interval: "month" },
        { countryCode: "IN", currency: "INR", amount: 7999, interval: "month" },
        { countryCode: "AE", currency: "AED", amount: 349, interval: "month" },
        { countryCode: "US", currency: "USD", amount: 119, interval: "month" },
        { countryCode: "GB", currency: "GBP", amount: 79, interval: "month" },
      ],
    },
    {
      name: "Enterprise",
      slug: "enterprise",
      shortDescription: "Custom limits, SSO, and white-glove onboarding.",
      featureBullets: [
        "Custom customer & campaign caps",
        "SSO & audit exports",
        "SLA & dedicated support",
        "Custom WhatsApp / AI integrations",
      ],
      limits: { offers: 0, customers: 0, campaignsPerMonth: 0, aiGenerations: 0 },
      sortOrder: 4,
      isMostPopular: false,
      isEnterprise: true,
      isActive: true,
      countryPricing: [],
    },
  ] as const;

  for (const pkg of packages) {
    await PackageModel.findOneAndUpdate(
      { slug: pkg.slug },
      { $set: pkg },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    console.log(`Upserted package: ${pkg.name}`);
  }

  const starter = await PackageModel.findOne({ slug: "starter" });
  await TrialSettingsModel.findOneAndUpdate(
    { key: "default" },
    {
      $set: {
        enabled: true,
        trialDays: 14,
        unlockedPackageId: starter?._id ?? null,
        fairUsageCaps: {
          offers: 1,
          customers: 100,
          campaignsPerMonth: 5,
          aiGenerations: 20,
        },
        paywallMessage:
          "Your free trial has ended. Choose a plan to keep growing with UPSale.",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  console.log("Trial settings ready (14 days → Starter)");

  await PlatformSettingsModel.findOneAndUpdate(
    { key: "default" },
    { $setOnInsert: { key: "default" } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  console.log("Platform settings singleton ready");

  await AuditLogModel.create({
    userId: admin._id,
    action: "SEED_ADMIN",
    entity: "system",
    previousValue: null,
    newValue: {
      packages: packages.map((p) => p.slug),
      trialDays: 14,
      adminEmail,
    },
    timestamp: new Date(),
  });

  console.log("Seed complete.");
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
