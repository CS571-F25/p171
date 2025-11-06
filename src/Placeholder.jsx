import React from "react";
import "./App.css";

export default function Placeholder() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.elements.email.value;
    if (!email) {
      alert("Please enter your email to be notified.");
      return;
    }
    // placeholder behavior — in future we'll POST to an API
    alert(`Thanks! We'll notify ${email} when LocalBite launches.`);
    e.target.reset();
  };

  return (
    <main className="placeholder-root">
      <section className="hero">
        <div className="brand">LocalBite</div>
        <h1>Discover Local Food & Events</h1>
        <p className="tagline">
          LocalBite is coming soon — a curated calendar for food trucks,
          markets, festivals, and more. Find tasty local experiences near you
          and save them for later.
        </p>

        <form
          className="notify-form"
          onSubmit={handleSubmit}
          aria-label="Notify me"
        >
          <input
            name="email"
            type="email"
            placeholder="Your email address"
            aria-label="Email address"
          />
          <button type="submit">Notify me</button>
        </form>

        <div className="links">
          <a href="#features">See features</a>
          <a href="mailto:othman@localbite.example">Contact</a>
        </div>
      </section>

      <footer className="placeholder-footer">
        <p>
          Built with care. While the site is under development you can follow
          the project or reach out at{" "}
          <a href="mailto:othman@localbite.example">othman@localbite.example</a>
          .
        </p>
        <small>© LocalBite — Coming soon</small>
      </footer>
    </main>
  );
}
