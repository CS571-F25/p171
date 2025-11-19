import React from "react";
import { Container, Button } from "react-bootstrap";

export default function Hero({ onNotify }) {
  return (
    <section className="py-5 bg-light">
      <Container fluid className="text-center">
        <h1 className="display-5">Discover Local Food & Events</h1>
        <p className="lead">
          Find food trucks, markets, festivals and more near you.
        </p>
        <div className="d-flex justify-content-center gap-2">
          <Button variant="primary" onClick={onNotify}>
            Notify me
          </Button>
          <Button variant="outline-primary" href="#features">
            See features
          </Button>
        </div>
      </Container>
    </section>
  );
}
