import React from "react";
import { Card, Button } from "react-bootstrap";

export default function ServiceCard({ title, description }) {
  return (
    <Card className="h-100">
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text>{description}</Card.Text>
        <Button variant="primary">Learn more</Button>
      </Card.Body>
    </Card>
  );
}
