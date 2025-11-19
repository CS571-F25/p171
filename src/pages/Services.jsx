import React from "react";
import { Container } from "react-bootstrap";
import ServicesList from "../components/ServicesList";

export default function Services() {
  return (
    <Container className="py-4">
      <h2>Our Services</h2>
      <p>
        Explore some of the features we offer to help you find great local food.
      </p>
      <ServicesList />
    </Container>
  );
}
