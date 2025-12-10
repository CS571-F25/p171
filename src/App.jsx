import { useMemo, useState, useEffect } from "react";
import {
  Routes,
  Route,
  NavLink,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Container,
  Navbar,
  Nav,
  Button,
  Form,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import "./App.css";
import { events } from "./data/events";

const sortByDate = (list) =>
  [...list].sort(
    (a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime() ||
      a.name.localeCompare(b.name)
  );

function App() {
  const sortedEvents = useMemo(() => sortByDate(events), []);
  const [category, setCategory] = useState("All");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("All dates");
  const [selectedEventId, setSelectedEventId] = useState(
    sortedEvents[0]?.id || events[0].id
  );
  const [savedIds, setSavedIds] = useState([]);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const STORAGE_USER = "localbite:user";
  const STORAGE_SAVED = "localbite:saved";
  const handleAuth = (payload) => {
    setUser(payload);
    setShowAuth(false);
  };
  const handleSignOut = () => {
    setUser(null);
    setSavedIds([]);
    setShowAuth(false);
  };

  const filteredEvents = useMemo(() => {
    return sortedEvents.filter((event) => {
      const matchesCategory =
        category === "All" || event.category === category;
      const matchesLocation =
        !locationQuery ||
        `${event.location} ${event.city}`
          .toLowerCase()
          .includes(locationQuery.toLowerCase());
      const matchesDate =
        selectedDate === "All dates" || event.date === selectedDate;
      return matchesCategory && matchesLocation && matchesDate;
    });
  }, [category, locationQuery, selectedDate, sortedEvents]);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_USER);
    const storedSaved = localStorage.getItem(STORAGE_SAVED);
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedSaved) setSavedIds(JSON.parse(storedSaved));
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_USER);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_SAVED, JSON.stringify(savedIds));
  }, [savedIds]);

  useEffect(() => {
    if (!filteredEvents.find((e) => e.id === selectedEventId)) {
      setSelectedEventId(filteredEvents[0]?.id || sortedEvents[0]?.id || events[0].id);
    }
  }, [filteredEvents, selectedEventId, sortedEvents]);

  const selectedEvent =
    filteredEvents.find((event) => event.id === selectedEventId) ||
    sortedEvents.find((event) => event.id === selectedEventId) ||
    sortedEvents[0];

  const handleSave = (eventId) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setSavedIds((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  };

  const savedEvents = sortedEvents.filter((event) =>
    savedIds.includes(event.id)
  );

  return (
    <div className="page-bg">
      <PrimaryNav
        user={user}
        savedCount={savedIds.length}
        onAuthToggle={() => setShowAuth(true)}
        onSignOut={handleSignOut}
      />
      <Container fluid="lg" className="page-shell">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onCta={() => setShowAuth(true)}
                savedCount={savedIds.length}
                events={sortedEvents}
              />
            }
          />
          <Route
            path="/events"
            element={
              <EventsPage
                category={category}
                onCategoryChange={setCategory}
                locationQuery={locationQuery}
                onLocationChange={setLocationQuery}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                filteredEvents={filteredEvents}
                selectedEventId={selectedEventId}
                onSelectEvent={setSelectedEventId}
                onSave={handleSave}
                savedIds={savedIds}
                selectedEvent={selectedEvent}
                allDates={sortedEvents.map((e) => e.date)}
              />
            }
          />
          <Route
            path="/events/:eventId"
            element={
              <EventDetailPage
                onSave={handleSave}
                savedIds={savedIds}
                user={user}
                events={sortedEvents}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <DashboardPage
                user={user}
                events={savedEvents}
                onSave={handleSave}
                onAuth={() => setShowAuth(true)}
                onSignOut={handleSignOut}
              />
            }
          />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </Container>
      <Footer />

      <AuthPanel
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onAuth={handleAuth}
        onSignOut={handleSignOut}
        currentUser={user}
      />
    </div>
  );
}

function PrimaryNav({ user, onAuthToggle, savedCount, onSignOut }) {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <Navbar expand="lg" className="site-header" bg="light">
      <Container fluid="lg">
        <Navbar.Brand
          as={NavLink}
          to="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          <span className="logo-mark">LB</span> LocalBite
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="nav" />
        <Navbar.Collapse id="nav">
          <Nav className="ms-auto align-items-lg-center">
            <Nav.Link
              as={NavLink}
              to="/"
              className={location.pathname === "/" ? "active" : ""}
            >
              Home
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/events"
              className={location.pathname.startsWith("/events") ? "active" : ""}
            >
              Events
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/dashboard"
              className={
                location.pathname.startsWith("/dashboard") ? "active" : ""
              }
            >
              My Events ({savedCount})
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/contact"
              className={location.pathname.startsWith("/contact") ? "active" : ""}
            >
              Contact
            </Nav.Link>
            <div className="d-flex align-items-center gap-2 ms-lg-3 mt-2 mt-lg-0">
              <Button variant="outline-dark" onClick={onAuthToggle}>
                {user ? "Account" : "Sign in"}
              </Button>
              {user && (
                <Button variant="light" onClick={onSignOut}>
                  Sign out
                </Button>
              )}
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

function HomePage({ onCta, savedCount, events }) {
  return (
    <>
      <Hero onCta={onCta} savedCount={savedCount} />
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Highlights</p>
            <h2>Editor picks this week</h2>
          </div>
          <div className="pill-hint">Curated by LocalBite</div>
        </div>
        <Row xs={1} md={3} className="g-3">
          {events.slice(0, 3).map((event) => (
            <Col key={event.id}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{event.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {event.datePretty} • {event.city}
                  </Card.Subtitle>
                  <Card.Text>{event.description}</Card.Text>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="pill soft">{event.category}</span>
                    <Button
                      variant="outline-dark"
                      size="sm"
                      as={NavLink}
                      to="/events"
                    >
                      View
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Why LocalBite</p>
            <h2>Built for food lovers and organizers</h2>
          </div>
        </div>
        <div className="hero-meta">
          <Stat number="Citywide" label="Coverage across markets" />
          <Stat number="Real-time" label="Schedules updated daily" />
          <Stat number="Accessible" label="Keyboard-friendly forms" />
        </div>
      </section>
    </>
  );
}

function EventsPage({
  category,
  onCategoryChange,
  locationQuery,
  onLocationChange,
  selectedDate,
  onDateChange,
  filteredEvents,
  selectedEventId,
  onSelectEvent,
  onSave,
  savedIds,
  selectedEvent,
  allDates,
}) {
  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Discover</p>
          <h1>Plan your next local food outing</h1>
        </div>
        <div className="pill-hint">Filters update live</div>
      </div>
      <FilterBar
        category={category}
        onCategoryChange={onCategoryChange}
        locationQuery={locationQuery}
        onLocationChange={onLocationChange}
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        dates={allDates}
      />
      <div className="layout-grid">
        <EventList
          events={filteredEvents}
          selectedId={selectedEventId}
          onSelect={onSelectEvent}
          onSave={onSave}
          savedIds={savedIds}
        />
        <EventDetail
          event={selectedEvent}
          onSave={onSave}
          isSaved={savedIds.includes(selectedEvent?.id)}
        />
      </div>
    </section>
  );
}

function EventDetailPage({ onSave, savedIds, events }) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const event = events.find((e) => e.id === eventId);

  if (!event) {
    return (
      <section className="section">
        <div className="empty">
          <p className="mini-title">Event not found.</p>
          <Button variant="outline-dark" onClick={() => navigate("/events")}>
            Back to events
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Event</p>
          <h1>{event.name}</h1>
        </div>
        <NavLink to="/events" className="text-link">
          Back to all events
        </NavLink>
      </div>
      <EventDetail
        event={event}
        onSave={onSave}
        isSaved={savedIds.includes(event.id)}
      />
    </section>
  );
}

function DashboardPage({ user, events, onSave, onAuth, onSignOut }) {
  return (
    <section className="section soft-surface">
      <div className="section-heading">
        <div>
          <p className="eyebrow">My Events</p>
          <h1>Your saved itinerary</h1>
        </div>
        {user ? (
          <div className="d-flex align-items-center gap-2">
            <div className="user-chip" aria-label="Logged in user">
              <span className="dot" />
              {user.name} — {user.email}
            </div>
            <Button variant="light" onClick={onSignOut}>
              Sign out
            </Button>
          </div>
        ) : (
          <Button variant="outline-dark" onClick={onAuth}>
            Sign in to start saving
          </Button>
        )}
      </div>
      <SavedDashboard events={events} onSave={onSave} hasAccount={Boolean(user)} />
    </section>
  );
}

function ContactPage() {
  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Contact</p>
          <h1>Questions, partnerships, or a new event tip?</h1>
        </div>
        <div className="pill">Community-first</div>
      </div>
      <ContactSection />
    </section>
  );
}

function Hero({ onCta, savedCount }) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">LocalBite — Discover Local Food & Events</p>
        <h1>Never miss the tastiest things happening near you.</h1>
        <p className="lede">
          Track food trucks, festivals, chef pop-ups, and markets in one place.
          Build a personal itinerary with save-for-later and share it with your crew.
        </p>
        <div className="hero-actions">
          <Button className="primary-btn" onClick={onCta} aria-label="Create account">
            {savedCount ? "View my saved events" : "Create my free account"}
          </Button>
          <NavLink className="text-link" to="/events">
            Browse events ↘
          </NavLink>
        </div>
        <div className="hero-meta">
          <Stat number="120+" label="Vetted local events" />
          <Stat number="24h" label="Fresh schedules daily" />
          <Stat number="Save" label="One-tap itinerary" />
        </div>
      </div>
      <div className="hero-pane" aria-label="Top picks preview">
        <div className="calendar-card">
          <div className="calendar-header">
            <div>
              <p className="eyebrow">This week</p>
              <h2>Top picks</h2>
            </div>
            <span className="pill">Curated</span>
          </div>
          <ul className="mini-list">
            {events.slice(0, 3).map((event) => (
              <li key={event.id}>
                <div>
                  <p className="mini-title">{event.name}</p>
                  <small>
                    {event.city} • {event.datePretty}
                  </small>
                </div>
                <span className="pill soft">{event.category}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="auth-preview">
          <p className="mini-title">Save for later</p>
          <p className="muted">
            Tap the bookmark on any listing to build your personal dashboard.
          </p>
          <div className="progress" aria-label="Saved progress">
            <div style={{ width: `${Math.min(savedCount * 20, 100)}%` }} />
          </div>
          <p className="muted">
            {savedCount ? `${savedCount} events saved` : "No saved events yet"}
          </p>
        </div>
      </div>
    </section>
  );
}

function Stat({ number, label }) {
  return (
    <div className="stat">
      <p className="stat-number">{number}</p>
      <p className="muted">{label}</p>
    </div>
  );
}

function FilterBar({
  category,
  onCategoryChange,
  locationQuery,
  onLocationChange,
  selectedDate,
  onDateChange,
  dates,
}) {
  const uniqueDates = useMemo(() => {
    const sortedUnique = Array.from(new Set(dates)).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
    return ["All dates", ...sortedUnique];
  }, [dates]);

  const categories = [
    "All",
    "Street Food",
    "Market",
    "Fine Dining",
    "Festival",
    "Pop-up",
    "Workshop",
    "Tasting",
  ];

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label htmlFor="category">Category</label>
        <div className="chip-row" role="listbox" aria-label="Filter by category">
          {categories.map((option) => (
            <button
              key={option}
              className={`chip ${category === option ? "active" : ""}`}
              onClick={() => onCategoryChange(option)}
              aria-pressed={category === option}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className="filter-inputs">
        <div className="input-wrap">
          <label htmlFor="date-select">Date</label>
          <Form.Select
            id="date-select"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            aria-label="Filter by date"
          >
            {uniqueDates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </Form.Select>
        </div>
        <div className="input-wrap">
          <label htmlFor="location">Location</label>
          <Form.Control
            id="location"
            type="search"
            placeholder="Search city, venue, or neighborhood"
            value={locationQuery}
            onChange={(e) => onLocationChange(e.target.value)}
          />
        </div>
      </div>
      <CalendarStrip
        dates={uniqueDates.slice(1)}
        selectedDate={selectedDate}
        onSelectDate={onDateChange}
      />
    </div>
  );
}

function CalendarStrip({ dates, selectedDate, onSelectDate }) {
  return (
    <div className="calendar-strip" aria-label="Event calendar">
      {dates.map((date) => {
        const asDate = new Date(date);
        const day = asDate.toLocaleDateString("en-US", { weekday: "short" });
        const dayNum = asDate.getDate();
        return (
          <button
            key={date}
            className={`calendar-tile ${selectedDate === date ? "active" : ""}`}
            onClick={() => onSelectDate(date)}
            aria-pressed={selectedDate === date}
            type="button"
          >
            <span className="muted">{day}</span>
            <span className="day-number">{dayNum}</span>
            <span className="muted">
              {asDate.toLocaleDateString("en-US", { month: "short" })}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function EventList({ events, selectedId, onSelect, onSave, savedIds }) {
  return (
    <div className="event-list" aria-label="Event listings">
      {events.length === 0 ? (
        <div className="empty">No events match those filters yet.</div>
      ) : (
        events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            selected={selectedId === event.id}
            onSelect={onSelect}
            onSave={onSave}
            saved={savedIds.includes(event.id)}
          />
        ))
      )}
    </div>
  );
}

function EventCard({ event, selected, onSelect, onSave, saved }) {
  return (
    <article
      className={`event-card ${selected ? "active" : ""}`}
      onClick={() => onSelect(event.id)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSelect(event.id);
      }}
      aria-pressed={selected}
    >
      <div>
        <p className="mini-title">{event.name}</p>
        <p className="muted">
          {event.datePretty} • {event.time}
        </p>
        <p className="muted">{event.city}</p>
      </div>
      <div className="card-footer">
        <span className="pill soft">{event.category}</span>
        <button
          className={`bookmark ${saved ? "saved" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onSave(event.id);
          }}
          aria-label={saved ? "Remove from saved events" : "Save for later"}
          type="button"
        >
          ★
        </button>
      </div>
      <div className="mt-2">
        <NavLink to={`/events/${event.id}`} className="text-link">
          View details →
        </NavLink>
      </div>
    </article>
  );
}

function EventDetail({ event, onSave, isSaved }) {
  if (!event) return null;
  return (
    <div className="event-detail" aria-live="polite">
      <div className="detail-header">
        <div>
          <p className="eyebrow">{event.category}</p>
          <h2>{event.name}</h2>
          <p className="muted">
            {event.datePretty} • {event.time}
          </p>
          <p className="muted">{event.location}</p>
        </div>
        <div className="price">
          <p className="muted">From</p>
          <p className="stat-number">{event.price}</p>
        </div>
      </div>

      <p className="detail-text">{event.description}</p>
      <ul className="tag-row">
        {event.tags.map((tag) => (
          <li key={tag} className="pill soft">
            {tag}
          </li>
        ))}
      </ul>

      <div className="detail-actions">
        <Button
          className="primary-btn"
          href={event.ticketUrl}
          target="_blank"
          rel="noreferrer"
        >
          Get tickets
        </Button>
        <Button variant="outline-dark" onClick={() => onSave(event.id)}>
          {isSaved ? "Saved" : "Save for later"}
        </Button>
        <Button as={NavLink} variant="light" to={`/events/${event.id}`}>
          View full details
        </Button>
      </div>

      <div className="map-embed" aria-label="Map">
        <iframe
          title={`Map for ${event.name}`}
          src={`https://www.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`}
          loading="lazy"
        />
      </div>
    </div>
  );
}

function SavedDashboard({ events, onSave, hasAccount }) {
  if (!hasAccount) {
    return (
      <div className="empty">
        Sign in to collect events, build your weekend plan, and get reminders.
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="empty">
        You have not saved anything yet. Tap a star on any listing to track it.
      </div>
    );
  }

  return (
    <Row xs={1} md={2} className="g-3">
      {events.map((event) => (
        <Col key={event.id}>
          <Card className="saved-card h-100">
            <Card.Body>
              <Card.Title>{event.name}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                {event.datePretty} • {event.time}
              </Card.Subtitle>
              <Card.Text>{event.location}</Card.Text>
              <div className="d-flex justify-content-between align-items-center mt-2">
                <span className="pill soft">{event.category}</span>
                <Button variant="outline-dark" size="sm" onClick={() => onSave(event.id)}>
                  Remove
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

function ContactSection() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thanks! We received your note and will be in touch.");
    e.target.reset();
  };

  return (
    <div className="contact">
      <div className="contact-grid">
        <div className="contact-copy">
          <p className="lede">
            Tell us about your event, request a feature, or ask about sponsorships.
          </p>
          <ul className="contact-list">
            <li>Event organizers: add your dates, ticket links, and perks.</li>
            <li>Food lovers: suggest hidden gems we should feature.</li>
            <li>Brands: partner on pop-ups or giveaways.</li>
          </ul>
        </div>
        <Form className="contact-form" onSubmit={handleSubmit} aria-label="Contact form">
          <Form.Group controlId="contactName" className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control name="name" placeholder="Your name" required />
          </Form.Group>
          <Form.Group controlId="contactEmail" className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </Form.Group>
          <Form.Group controlId="contactMessage" className="mb-3">
            <Form.Label>Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="message"
              placeholder="How can we help?"
              required
            />
          </Form.Group>
          <Button className="primary-btn" type="submit">
            Send message
          </Button>
        </Form>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <Container fluid="lg" className="d-flex justify-content-between align-items-center">
        <div>
          <p className="brand-name">LocalBite</p>
          <small>Curated local food & events</small>
        </div>
        <div className="footer-links">
          <NavLink to="/events">Discover</NavLink>
          <NavLink to="/dashboard">My Events</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </div>
      </Container>
    </footer>
  );
}

function AuthPanel({ open, onClose, onAuth, onSignOut, currentUser }) {
  const [mode, setMode] = useState("signup");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!open) return;
    setForm({ name: "", email: "", password: "" });
  }, [open]);

  if (!open) return null;

  if (currentUser) {
    return (
      <div className="auth-overlay" role="dialog" aria-modal="true">
        <div className="auth-card">
          <div className="auth-header">
            <div>
              <p className="eyebrow">LocalBite account</p>
              <h2>Signed in</h2>
            </div>
            <Button variant="outline-dark" onClick={onClose}>
              Close
            </Button>
          </div>
          <p className="lede">
            You are signed in as <strong>{currentUser.email}</strong>.
          </p>
          <div className="d-flex gap-2 flex-wrap">
            <Button className="primary-btn" onClick={onSignOut}>
              Sign out
            </Button>
            <Button variant="light" onClick={onClose}>
              Keep browsing
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-overlay" role="dialog" aria-modal="true">
      <div className="auth-card">
        <div className="auth-header">
          <div>
            <p className="eyebrow">LocalBite account</p>
            <h2>{mode === "signup" ? "Create your profile" : "Welcome back"}</h2>
          </div>
          <Button variant="outline-dark" onClick={onClose}>
            Close
          </Button>
        </div>
        <Form
          className="auth-form"
          onSubmit={(e) => {
            e.preventDefault();
            onAuth({ name: form.name || "LocalBiter", email: form.email });
          }}
        >
          {mode === "signup" && (
            <Form.Group controlId="authName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Form.Group>
          )}
          <Form.Group controlId="authEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group controlId="authPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </Form.Group>
          <Button className="primary-btn" type="submit">
            {mode === "signup" ? "Create account" : "Sign in"}
          </Button>
        </Form>
        <p className="muted auth-switch">
          {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
          <button
            className="text-button"
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          >
            {mode === "signup" ? "Sign in" : "Create one"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default App;
