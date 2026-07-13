import type { Metadata } from "next";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { getTicketLink } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

// Auth is enforced by middleware.ts (redirects to the login path if no valid
// session cookie). Kept dynamic so the saved link is always current.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const ticketLink = await getTicketLink();
  return (
    <main className="bg-ink">
      <AdminDashboard initialLink={ticketLink} />
    </main>
  );
}
