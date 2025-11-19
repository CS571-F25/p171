import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import ServiceCard from "./ServiceCard";

const sample = [
  {
    title: "Food Truck Finder",
    description: "Locate nearby food trucks and see schedules.",
  },
  {
    title: "Event Calendar",
    description: "Curated calendar of local food events.",
  },
  {
    title: "Market Guides",
    description: "Find farmers markets and vendor highlights.",
  },
];

export default function ServicesList() {
  return (
    <Container className="py-4">
      <Row xs={1} md={3} className="g-3">
        {sample.map((s) => (
          <Col key={s.title}>
            <ServiceCard title={s.title} description={s.description} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}
