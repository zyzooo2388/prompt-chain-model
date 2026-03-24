import { redirect } from "next/navigation";
import { requireAdmin } from "@/src/lib/auth";

export default async function FlavorsPage() {
  await requireAdmin("/flavors");
  redirect("/admin/humor-flavors");
}
