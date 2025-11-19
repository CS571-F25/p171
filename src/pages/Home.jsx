import React from "react";
import Hero from "../components/Hero";
import ServicesList from "../components/ServicesList";

export default function Home() {
  const handleNotify = () => {
    // simple placeholder behavior for demo
    alert("Thanks! We will notify you when LocalBite launches.");
  };

  return (
    <div>
      <Hero onNotify={handleNotify} />

      <section id="features">
        <h2 style={{ textAlign: "center", marginTop: "1.5rem" }}>
          Featured Services
        </h2>
        <ServicesList />
      </section>
    </div>
  );
}
