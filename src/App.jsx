import { B } from "./tokens-data.js";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", background: B.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 30, fontWeight: 700, color: B.gold, textAlign: "center" }}>
        {B.gold ? "✅ tokens-data OK" : "❌ tokens-data MAL"}
      </div>
    </div>
  );
}
