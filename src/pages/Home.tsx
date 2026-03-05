import Header from "../components/common/Header.tsx";

export default function Home() {
  return (
    <div>
      <Header />

      <main style={{ padding: "2rem" }}>
        <h1>AI Presentation Agent</h1>
        <p>
          Welcome! This is the homepage for the AI voice slide presenter.
        </p>
      </main>
    </div>
  );
}