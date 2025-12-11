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
  Tabs,
  Tab,
} from "react-bootstrap";
import "./App.css";
import { events } from "./data/events";

const parseDate = (dateString) => {
  if (!dateString) return new Date();
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const sortByDate = (list) =>
  [...list].sort(
    (a, b) =>
      parseDate(a.date).getTime() - parseDate(b.date).getTime() ||
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
    if (filteredEvents.length === 0) {
      setSelectedEventId(null);
      return;
    }
    if (!filteredEvents.find((e) => e.id === selectedEventId)) {
      setSelectedEventId(filteredEvents[0]?.id || sortedEvents[0]?.id || events[0].id);
    }
  }, [filteredEvents, selectedEventId, sortedEvents]);

  const selectedEvent =
    filteredEvents.find((event) => event.id === selectedEventId) ||
    (filteredEvents.length ? filteredEvents[0] : null);

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
                user={user}
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

function HomePage({ onCta, savedCount, events, user }) {
  const navigate = useNavigate();
  const handlePrimaryClick = () => {
    if (user) {
      navigate("/dashboard");
      return;
    }
    onCta();
  };
  return (
    <>
      <Hero
        onCta={handlePrimaryClick}
        savedCount={savedCount}
        isLoggedIn={Boolean(user)}
      />
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
          <h1>Get in touch or submit your next event</h1>
        </div>
        <div className="pill">Community-first</div>
      </div>
      <div className="contact-tabs-shell">
        <Tabs defaultActiveKey="contact" className="mb-3" justify>
          <Tab eventKey="contact" title="Contact">
            <div className="contact-tab-panel">
              <ContactSection />
            </div>
          </Tab>
          <Tab eventKey="submit" title="Submit an event">
            <div className="contact-tab-panel">
              <SubmitEventSection />
            </div>
          </Tab>
        </Tabs>
      </div>
    </section>
  );
}

function SubmitEventSection() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thanks! We received your event request (demo).");
    e.target.reset();
  };

  return (
    <section className="section">
      <div className="contact">
        <div className="contact-grid">
          <div className="contact-copy">
            <p className="lede">
              Tell us about your food event, market, or pop-up. We review submissions daily
              and will follow up for artwork or ticket links.
            </p>
            <ul className="contact-list">
              <li>Include dates, times, address, and your ticket URL.</li>
              <li>Add category and a short description to help us feature it.</li>
              <li>We’ll email you once it’s live in the calendar.</li>
            </ul>
          </div>
          <Form className="contact-form" onSubmit={handleSubmit} aria-label="Submit event form">
            <Form.Group controlId="eventName" className="mb-3">
              <Form.Label>Event name</Form.Label>
              <Form.Control name="name" placeholder="Sunset Food Truck Rally" required />
            </Form.Group>
            <Row className="mb-3">
              <Col xs={12} md={6}>
                <Form.Group controlId="eventDate">
                  <Form.Label>Date</Form.Label>
                  <Form.Control type="date" name="date" required />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group controlId="eventTime">
                  <Form.Label>Time</Form.Label>
                  <Form.Control name="time" placeholder="5:00 PM – 10:00 PM" required />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col xs={12} md={6}>
                <Form.Group controlId="eventLocation">
                  <Form.Label>Location</Form.Label>
                  <Form.Control name="location" placeholder="Venue or address" required />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group controlId="eventCity">
                  <Form.Label>City</Form.Label>
                  <Form.Control name="city" placeholder="City, State" required />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group controlId="eventCategory" className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select name="category" required>
                <option value="">Select a category</option>
                <option>Street Food</option>
                <option>Market</option>
                <option>Festival</option>
                <option>Fine Dining</option>
                <option>Pop-up</option>
                <option>Workshop</option>
                <option>Tasting</option>
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="eventUrl" className="mb-3">
              <Form.Label>Ticket or website URL</Form.Label>
              <Form.Control
                type="url"
                name="url"
                placeholder="https://example.com/tickets"
                required
              />
            </Form.Group>
            <Form.Group controlId="eventDescription" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                placeholder="Tell us about the experience, food, and highlights."
                required
              />
            </Form.Group>
            <Form.Group controlId="eventContact" className="mb-3">
              <Form.Label>Contact email</Form.Label>
              <Form.Control
                type="email"
                name="contact"
                placeholder="you@example.com"
                required
              />
            </Form.Group>
            <Button className="primary-btn" type="submit">
              Submit event
            </Button>
          </Form>
        </div>
      </div>
    </section>
  );
}

function Hero({ onCta, savedCount, isLoggedIn }) {
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
            {isLoggedIn || savedCount ? "View my saved events" : "Create my free account"}
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
      (a, b) => parseDate(a).getTime() - parseDate(b).getTime()
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
        const asDate = parseDate(date);
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
  if (!event) {
    return (
      <div className="event-detail">
        <div className="empty">No event selected. Adjust filters to see details.</div>
      </div>
    );
  }
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
  const [sort, setSort] = useState("date");

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

  const sortedEvents = useMemo(() => {
    const list = [...events];
    if (sort === "name") {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list.sort(
      (a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime()
    );
  }, [events, sort]);

  const categories = Array.from(new Set(events.map((e) => e.category)));
  const nextEvent = sortedEvents[0];

  return (
    <div className="saved-dashboard">
      <div className="saved-summary">
        <div>
          <p className="mini-title">Saved events</p>
          <p className="muted">
            {events.length} saved • {categories.length} categories
          </p>
          {nextEvent && (
            <p className="muted">
              Next up: <strong>{nextEvent.name}</strong> — {nextEvent.datePretty} at{" "}
              {nextEvent.time}
            </p>
          )}
        </div>
        <div className="summary-actions">
          <div className="chip-row">
            <button
              className={`chip ${sort === "date" ? "active" : ""}`}
              onClick={() => setSort("date")}
              type="button"
            >
              Sort by date
            </button>
            <button
              className={`chip ${sort === "name" ? "active" : ""}`}
              onClick={() => setSort("name")}
              type="button"
            >
              Sort by name
            </button>
          </div>
          <div className="summary-tags">
            {categories.map((cat) => (
              <span key={cat} className="pill soft">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Row xs={1} md={2} className="g-3">
        {sortedEvents.map((event) => (
          <Col key={event.id}>
            <Card className="saved-card h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div>
                    <Card.Title>{event.name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      {event.datePretty} • {event.time}
                    </Card.Subtitle>
                    <Card.Text>{event.location}</Card.Text>
                  </div>
                  <span className="pill soft">{event.category}</span>
                </div>
                <ul className="tag-row">
                  {event.tags.slice(0, 3).map((tag) => (
                    <li key={tag} className="pill soft">
                      {tag}
                    </li>
                  ))}
                </ul>
                <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2">
                  <Button
                    variant="outline-dark"
                    size="sm"
                    as={NavLink}
                    to={`/events/${event.id}`}
                  >
                    View details
                  </Button>
                  <Button variant="light" size="sm" onClick={() => onSave(event.id)}>
                    Remove
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
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
          <NavLink to="/contact">Contact & Submit</NavLink>
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
