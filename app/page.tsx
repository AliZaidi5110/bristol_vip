import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import EventSpotlight from "@/components/EventSpotlight";
import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";
import { getSiteEvent } from "@/lib/settings";

// Always render fresh so an admin's ticket-link change goes live immediately.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const event = await getSiteEvent();

  return (
    <>
      <Navbar ticketLink={event.ticketLink} />
      <main>
        <Hero ticketLink={event.ticketLink} />
        <About />
        <EventSpotlight event={event} />
        <Gallery />
      </main>
      <Footer />
    </>
  );
}
