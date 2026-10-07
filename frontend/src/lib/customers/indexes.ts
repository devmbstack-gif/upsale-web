import "server-only";
import { CustomerModel } from "@/lib/models/customer";

let indexPromise: Promise<void> | null = null;

/** Removes legacy global phone uniqueness and enforces uniqueness per business. */
export function ensureCustomerTenantIndexes() {
  if (indexPromise) return indexPromise;
  indexPromise = (async () => {
    await CustomerModel.createCollection();
    const indexes = await CustomerModel.collection.indexes();
    for (const index of indexes) {
      const keys = Object.keys(index.key ?? {});
      const isLegacyGlobalPhoneIndex =
        index.unique === true &&
        keys.length === 1 &&
        (keys[0] === "phone" || keys[0] === "phoneNormalized");
      if (isLegacyGlobalPhoneIndex && index.name) {
        await CustomerModel.collection.dropIndex(index.name);
      }
    }
    await CustomerModel.collection.createIndex(
      { businessId: 1, phoneNormalized: 1 },
      {
        name: "businessId_1_phoneNormalized_1",
        unique: true,
        partialFilterExpression: { phoneNormalized: { $type: "string", $gt: "" } },
      },
    );
  })().catch((error) => {
    indexPromise = null;
    throw error;
  });
  return indexPromise;
}
