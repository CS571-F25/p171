import React from "react";
import { Container, Form, Button } from "react-bootstrap";

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thanks — we received your message (demo).");
    e.target.reset();
  };

  return (
    <Container className="py-5" style={{ maxWidth: 720 }}>
      <h2>Contact</h2>
      <p>Have questions or want to partner? Send us a message.</p>
      <Form onSubmit={handleSubmit} aria-label="Contact form">
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control name="name" placeholder="Your name" />
        </Form.Group>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            name="email"
            type="email"
            placeholder="you@example.com"
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="message">
          <Form.Label>Message</Form.Label>
          <Form.Control as="textarea" rows={4} name="message" />
        </Form.Group>
        <Button type="submit">Send</Button>
      </Form>
    </Container>
  );
}
