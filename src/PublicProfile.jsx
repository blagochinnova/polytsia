import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const STATUS_LABELS = {
  want: "✧ Бажанка",
  library: "📚 Бібліотека",
  done: "✓ Прочитано",
};
const STATUS_COLORS = { want: "#c8a96a", library: "#8eac8b", done: "#9b8fb4" };
const COVERS = [
  { bg: "linear-gradient(160deg,#1c1408,#2b1f10)", emoji: "🕯️" },
  { bg: "linear-gradient(160deg,#0e1710,#162415)", emoji: "🌿" },
  { bg: "linear-gradient(160deg,#130d18,#1e1228)", emoji: "🔮" },
  { bg: "linear-gradient(160deg,#180f0a,#271508)", emoji: "🏜️" },
  { bg: "linear-gradient(160deg,#0c1018,#111828)", emoji: "⚔️" },
  { bg: "linear-gradient(160deg,#181008,#261808)", emoji: "🧠" },
  { bg: "linear-gradient(160deg,#100f18,#181626)", emoji: "🌄" },
  { bg: "linear-gradient(160deg,#0d1510,#14211a)", emoji: "⚗️" },
];
const getCover = (id) => COVERS[(id?.charCodeAt(0) || 0) % COVERS.length];

const fetchCover = async (title, author) => {
  const q = encodeURIComponent(`${title} ${author || ""}`.trim());
  try {
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${q}&limit=1&fields=cover_i`
    );
    const data = await res.json();
    const coverId = data.docs?.[0]?.cover_i;
    return coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
      : null;
  } catch {
    return null;
  }
};

function BookCard({ book }) {
  const [coverUrl, setCoverUrl] = useState(null);
  const fallback = getCover(book.id);
  useEffect(() => {
    fetchCover(book.title, book.author).then(setCoverUrl);
  }, [book.title, book.author]);
  return (
    <div style={{ background: "#1d1812" }}>
      <div
        style={{
          height: 230,
          background: coverUrl ? "#1a1410" : fallback.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 44,
          position: "relative",
          borderBottom: "1px solid #2e271c",
          overflow: "hidden",
        }}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={book.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span>{fallback.emoji}</span>
        )}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            fontSize: 9,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "4px 10px",
            border: `1px solid ${STATUS_COLORS[book.status]}60`,
            color: STATUS_COLORS[book.status],
            background: `${STATUS_COLORS[book.status]}20`,
            fontFamily: "Georgia, serif",
          }}
        >
          {STATUS_LABELS[book.status]}
        </div>
      </div>
      <div style={{ padding: "14px 16px 18px" }}>
        <div
          style={{
            fontSize: 15,
            color: "#e8dfc8",
            lineHeight: 1.3,
            marginBottom: 5,
            fontFamily: "Georgia, serif",
          }}
        >
          {book.title}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#7a6f60",
            fontStyle: "italic",
            fontFamily: "Georgia, serif",
          }}
        >
          {book.author || "—"}
        </div>
      </div>
    </div>
  );
}

export default function PublicProfile({ username, session, navigate }) {
  const [profile, setProfile] = useState(null);
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();
      if (!p) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setProfile(p);
      const { data: b } = await supabase
        .from("books")
        .select("*")
        .eq("user_id", p.id)
        .order("created_at", { ascending: false });
      if (b) setBooks(b);
      setLoading(false);
    };
    load();
  }, [username]);

  const counts = { want: 0, library: 0, done: 0 };
  books.forEach((b) => {
    if (counts[b.status] !== undefined) counts[b.status]++;
  });
  const filtered =
    filter === "all" ? books : books.filter((b) => b.status === filter);
  const isOwn = session?.user?.id === profile?.id;

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0e0c09",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#554d40",
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          fontSize: 18,
        }}
      >
        Завантаження...
      </div>
    );

  if (notFound)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0e0c09",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
          color: "#554d40",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
        <div style={{ fontSize: 20, fontStyle: "italic", marginBottom: 24 }}>
          Читача не знайдено
        </div>
        <span
          style={{ color: "#c8a96a", cursor: "pointer", fontSize: 14 }}
          onClick={() => navigate("")}
        >
          ← На головну
        </span>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0e0c09",
        fontFamily: "Georgia, serif",
        color: "#e8dfc8",
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .pub-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important; }
          .pub-hero { padding: 32px 20px !important; }
          .pub-main { padding: 24px 20px !important; }
          .pub-stats { grid-template-columns: repeat(3,1fr) !important; }
        }
      `}</style>

      {/* HEADER */}
      <header
        style={{
          borderBottom: "1px solid #2e271c",
          padding: "0 56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
          background: "#120f0a",
        }}
      >
        <span
          style={{
            color: "#c8a96a",
            fontSize: 20,
            fontStyle: "italic",
            cursor: "pointer",
          }}
          onClick={() => navigate("")}
        >
          ❧ Полиця
        </span>
        <div style={{ display: "flex", gap: 12 }}>
          {isOwn && (
            <button
              onClick={() => navigate("#/library")}
              style={{
                background: "rgba(200,169,106,0.1)",
                border: "1px solid #3d3426",
                color: "#c8a96a",
                fontFamily: "Georgia, serif",
                fontSize: 13,
                padding: "8px 18px",
                cursor: "pointer",
              }}
            >
              Редагувати
            </button>
          )}
          {!session && (
            <button
              onClick={() => navigate("#/auth")}
              style={{
                background: "transparent",
                border: "1px solid #2e271c",
                color: "#7a6f60",
                fontFamily: "Georgia, serif",
                fontSize: 13,
                padding: "8px 18px",
                cursor: "pointer",
              }}
            >
              Увійти
            </button>
          )}
        </div>
      </header>

      {/* HERO */}
      <div
        className="pub-hero"
        style={{
          padding: "48px 56px 36px",
          borderBottom: "1px solid #2e271c",
          background:
            "radial-gradient(ellipse 60% 80% at 20% 50%, rgba(200,169,106,0.05) 0%, transparent 70%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#3a2e1e,#5a4728)",
              border: "1px solid #3d3426",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              color: "#c8a96a",
              flexShrink: 0,
            }}
          >
            {profile.name[0].toUpperCase()}
          </div>
          <div>
            <div
              style={{
                color: "#554d40",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              @{profile.username}
            </div>
            <h1 style={{ fontSize: 40, fontWeight: "normal", marginBottom: 4 }}>
              {profile.name}
            </h1>
            <p style={{ color: "#7a6f60", fontStyle: "italic", fontSize: 14 }}>
              {books.length} книг у колекції
            </p>
          </div>
        </div>
      </div>

      <div className="pub-main" style={{ padding: "36px 56px" }}>
        {/* STATS */}
        <div
          className="pub-stats"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 1,
            background: "#2e271c",
            border: "1px solid #2e271c",
            marginBottom: 28,
          }}
        >
          {[
            { label: "бажанки", count: counts.want, color: "#c8a96a" },
            { label: "в бібліотеці", count: counts.library, color: "#8eac8b" },
            { label: "прочитано", count: counts.done, color: "#9b8fb4" },
          ].map((st) => (
            <div
              key={st.label}
              style={{ background: "#1d1812", padding: "20px 24px" }}
            >
              <div
                style={{
                  fontSize: 36,
                  color: st.color,
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {st.count}
              </div>
              <div
                style={{ fontSize: 13, color: "#7a6f60", fontStyle: "italic" }}
              >
                {st.label}
              </div>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          {[
            ["all", "Omnia"],
            ["want", "Бажанки"],
            ["library", "Бібліотека"],
            ["done", "Прочитано"],
          ].map(([key, label]) => (
            <div
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: "8px 18px",
                border: `1px solid ${filter === key ? "#c8a96a" : "#2e271c"}`,
                color: filter === key ? "#c8a96a" : "#7a6f60",
                background:
                  filter === key ? "rgba(200,169,106,0.08)" : "#1d1812",
                cursor: "pointer",
                fontSize: 13,
                letterSpacing: "0.08em",
                transition: "all 0.15s",
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* GRID */}
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "#554d40",
              fontStyle: "italic",
              fontSize: 18,
            }}
          >
            Тут поки порожньо
          </div>
        ) : (
          <div
            className="pub-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 1,
              background: "#2e271c",
              border: "1px solid #2e271c",
            }}
          >
            {filtered.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
