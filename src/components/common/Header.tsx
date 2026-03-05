import { Link } from "@tanstack/react-router";

export default function Header() {
  return (
    <header
      style={{
        display: "flex",
        gap: "20px",
        padding: "16px",
        borderBottom: "1px solid #ddd",
      }}
    >
      <Link to="/">Home</Link>
    </header>
  );
}