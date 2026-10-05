import { redirect } from "next/navigation";

/** Legacy sample dashboard — send users to the real owner app */
export default function LegacyDashboardRedirect() {
  redirect("/app");
}
