import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function Home({ session, navigate, onLogout }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*, books(count)");
      if (data) setProfiles(data);
      setLoading(false);
    };
    fetchProfiles();
  }, []);

  const filtered = profiles.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.username.toLowerCase().includes(search.toLowerCase())
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
        .profile-card:hover { background: #221d16 !important; transform: translateY(-2px); }
        .profile-card { transition: all 0.18s; }
        @media (max-width: 768px) {
          .home-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important; }
          .home-hero { padding: 40px 20px 28px !important; }
          .home-main { padding: 24px 20px !important; }
          .home-header { padding: 0 20px !important; }
          .home-hero h1 { font-size: 36px !important; }
          .home-hero p { font-size: 15px !important; }
          .nyxdi-label { display: none !important; }
          .header-btns button { font-size: 12px !important; padding: 7px 12px !important; }
        }
      `}</style>

      {/* HEADER */}
      <header
        className="home-header"
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
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ color: "#c8a96a", fontSize: 22, fontStyle: "italic" }}>
            ❧ Полиця
          </div>
          <div
            className="nyxdi-label"
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <div style={{ color: "#3d3426", fontSize: 13 }}>|</div>
            <div
              style={{
                color: "#554d40",
                fontSize: 12,
                letterSpacing: "0.18em",
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
              }}
            >
              curated by <span style={{ color: "#c8a96a" }}>NyxDi</span>
            </div>
          </div>
        </div>
        <div
          className="header-btns"
          style={{ display: "flex", gap: 10, alignItems: "center" }}
        >
          {session ? (
            <>
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
                Моя бібліотека
              </button>
              <button
                onClick={onLogout}
                style={{
                  background: "transparent",
                  border: "1px solid #2e271c",
                  color: "#554d40",
                  fontFamily: "Georgia, serif",
                  fontSize: 13,
                  padding: "8px 18px",
                  cursor: "pointer",
                }}
              >
                Вийти
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("#/auth")}
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
              Увійти
            </button>
          )}
        </div>
      </header>

      {/* HERO */}
      <div
        className="home-hero"
        style={{
          padding: "72px 56px 48px",
          textAlign: "center",
          borderBottom: "1px solid #2e271c",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200,169,106,0.06) 0%, transparent 70%)",
        }}
      >
        <div
          style={{
            color: "#554d40",
            fontSize: 11,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          ✦ Bibliotheca Communis ✦
        </div>
        <h1
          style={{
            fontSize: 56,
            fontWeight: "normal",
            lineHeight: 1.1,
            marginBottom: 16,
          }}
        >
          Спільна <em style={{ color: "#c8a96a" }}>Полиця</em>
        </h1>
        <p
          style={{
            color: "#7a6f60",
            fontStyle: "italic",
            fontSize: 17,
            maxWidth: 500,
            margin: "0 auto 40px",
          }}
        >
          Відкрий бібліотеки читачів, знайди нові книги і поділись своєю
          колекцією
        </p>
        {!session && (
          <button
            onClick={() => navigate("#/auth")}
            style={{
              background: "rgba(200,169,106,0.12)",
              border: "1px solid #c8a96a",
              color: "#c8a96a",
              fontFamily: "Georgia, serif",
              fontSize: 15,
              letterSpacing: "0.1em",
              padding: "14px 36px",
              cursor: "pointer",
            }}
          >
            Створити свою бібліотеку →
          </button>
        )}
      </div>

      {/* MAIN */}
      <div className="home-main" style={{ padding: "40px 56px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: "normal", color: "#c9b99a" }}>
            Читачі{" "}
            <span
              style={{ color: "#554d40", fontSize: 16, fontStyle: "italic" }}
            >
              · {profiles.length} бібліотек
            </span>
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#1d1812",
              border: "1px solid #2e271c",
              padding: "10px 16px",
              width: 260,
            }}
          >
            <span style={{ color: "#554d40" }}>⌕</span>
            <input
              style={{
                background: "none",
                border: "none",
                outline: "none",
                color: "#e8dfc8",
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                fontSize: 15,
                width: "100%",
              }}
              placeholder="Пошук читача..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "#554d40",
              fontStyle: "italic",
            }}
          >
            Завантаження...
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "#554d40",
              fontStyle: "italic",
              fontSize: 18,
            }}
          >
            Нікого не знайдено
          </div>
        ) : (
          <div
            className="home-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 1,
              background: "#2e271c",
              border: "1px solid #2e271c",
            }}
          >
            {filtered.map((profile) => (
              <div
                key={profile.id}
                className="profile-card"
                style={{
                  background: "#1d1812",
                  padding: "28px 24px",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`#/user/${profile.username}`)}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #3a2e1e, #5a4728)",
                    border: "1px solid #3d3426",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Georgia, serif",
                    fontSize: 22,
                    color: "#c8a96a",
                    marginBottom: 16,
                  }}
                >
                  {profile.name[0].toUpperCase()}
                </div>
                <div
                  style={{ fontSize: 18, color: "#e8dfc8", marginBottom: 4 }}
                >
                  {profile.name}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#554d40",
                    fontStyle: "italic",
                    marginBottom: 12,
                  }}
                >
                  @{profile.username}
                </div>
                <div style={{ fontSize: 13, color: "#7a6f60" }}>
                  {profile.books?.[0]?.count || 0} книг у колекції
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
