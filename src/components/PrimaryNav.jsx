import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

export default function PrimaryNav() {
  const navigate = useNavigate();
  const base = import.meta.env.BASE_URL || "/";
  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand
          href={base}
          onClick={(e) => {
            e.preventDefault();
            navigate(base);
          }}
        >
          LocalBite
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto">
            <Nav.Link
              href={base}
              onClick={(e) => {
                e.preventDefault();
                navigate(base);
              }}
            >
              Home
            </Nav.Link>
            <Nav.Link
              href={`${base}services`}
              onClick={(e) => {
                e.preventDefault();
                navigate("/services");
              }}
            >
              Services
            </Nav.Link>
            <Nav.Link
              href={`${base}about`}
              onClick={(e) => {
                e.preventDefault();
                navigate("/about");
              }}
            >
              About
            </Nav.Link>
            <Nav.Link
              href={`${base}contact`}
              onClick={(e) => {
                e.preventDefault();
                navigate("/contact");
              }}
            >
              Contact
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
