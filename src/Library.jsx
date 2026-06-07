import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const GENRES = [
  "Фантастика",
  "Фентезі",
  "Нон-фікшн",
  "Детектив",
  "Роман",
  "Класика",
  "Філософія",
  "Поезія",
  "Містика",
  "Даркроман",
  "Даркакадемія",
  "Інше",
];
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

const inputStyle = {
  width: "100%",
  background: "#120f0a",
  border: "1px solid #2e271c",
  padding: "13px 16px",
  color: "#e8dfc8",
  fontFamily: "Georgia, serif",
  fontStyle: "italic",
  fontSize: 16,
  outline: "none",
  boxSizing: "border-box",
};
const labelStyle = {
  display: "block",
  fontSize: 11,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "#554d40",
  marginBottom: 8,
  fontFamily: "Georgia, serif",
};

function BookCard({ book, onEdit, onDelete }) {
  const [coverUrl, setCoverUrl] = useState(book.cover_url || null);
  const fallback = getCover(book.id);

  useEffect(() => {
    if (!book.cover_url) {
      fetchCover(book.title, book.author).then((url) => {
        if (url) setCoverUrl(url);
      });
    }
  }, [book.title, book.author, book.cover_url]);

  return (
    <div
      style={{
        background: "#1d1812",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: 240,
          background: coverUrl ? "#1a1410" : fallback.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48,
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
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
            top: 10,
            left: 10,
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "4px 10px",
            border: `1px solid ${STATUS_COLORS[book.status]}60`,
            color: STATUS_COLORS[book.status],
            background: `${STATUS_COLORS[book.status]}25`,
            fontFamily: "Georgia, serif",
          }}
        >
          {STATUS_LABELS[book.status]}
        </div>
      </div>
      <div style={{ padding: "14px 16px 12px", flex: 1 }}>
        <div
          style={{
            fontSize: 16,
            color: "#e8dfc8",
            lineHeight: 1.3,
            marginBottom: 6,
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
            marginBottom: 4,
            fontFamily: "Georgia, serif",
          }}
        >
          {book.author || "—"}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#554d40",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontFamily: "Georgia, serif",
          }}
        >
          {book.genre || ""}
        </div>
      </div>
      <div style={{ display: "flex", borderTop: "1px solid #2e271c" }}>
        <button
          onClick={() => onEdit(book)}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            borderRight: "1px solid #2e271c",
            color: "#c8a96a",
            fontFamily: "Georgia, serif",
            fontSize: 12,
            padding: "11px 6px",
            cursor: "pointer",
            letterSpacing: "0.06em",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(200,169,106,0.08)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          ✎ Редагувати
        </button>
        <button
          onClick={() => onDelete(book)}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            color: "#c46060",
            fontFamily: "Georgia, serif",
            fontSize: 12,
            padding: "11px 6px",
            cursor: "pointer",
            letterSpacing: "0.06em",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(196,96,96,0.08)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          ✕ Видалити
        </button>
      </div>
    </div>
  );
}

function BookModal({ book, onClose, onSave, userId }) {
  const [form, setForm] = useState(
    book
      ? {
          title: book.title,
          author: book.author || "",
          genre: book.genre || "",
          status: book.status,
          cover_url: book.cover_url || null,
        }
      : { title: "", author: "", genre: "", status: "want", cover_url: null }
  );
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverMode, setCoverMode] = useState(
    book?.cover_url ? "upload" : "auto"
  );
  const [preview, setPreview] = useState(book?.cover_url || null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setPreview(URL.createObjectURL(file));
    const ext = file.name.split(".").pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("covers")
      .upload(path, file, { upsert: true });
    if (!error) {
      const { data: urlData } = supabase.storage
        .from("covers")
        .getPublicUrl(path);
      setForm((f) => ({ ...f, cover_url: urlData.publicUrl }));
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setLoading(true);
    const saveForm = coverMode === "auto" ? { ...form, cover_url: null } : form;
    await onSave(saveForm);
    setLoading(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(4px)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#1d1812",
          border: "1px solid #3d3426",
          padding: "clamp(24px, 4vw, 48px)",
          width: "100%",
          maxWidth: 540,
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 14,
            left: 18,
            color: "#3d3426",
            fontSize: 12,
          }}
        >
          ✦
        </span>
        <span
          style={{
            position: "absolute",
            bottom: 14,
            right: 18,
            color: "#3d3426",
            fontSize: 12,
          }}
        >
          ✦
        </span>

        <div
          style={{
            color: "#554d40",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          {book?.id ? "Редагування" : "Nova Inscriptio"}
        </div>
        <h2
          style={{
            fontSize: "clamp(22px, 4vw, 30px)",
            fontWeight: "normal",
            color: "#e8dfc8",
            marginBottom: 24,
          }}
        >
          {book?.id ? "Редагувати " : "Додати до "}
          <em style={{ color: "#c8a96a" }}>колекції</em>
        </h2>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Назва книги</label>
          <input
            style={inputStyle}
            placeholder="Введіть назву..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Автор</label>
          <input
            style={inputStyle}
            placeholder="Ім'я автора..."
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Жанр</label>
          <select
            style={inputStyle}
            value={form.genre}
            onChange={(e) => setForm({ ...form, genre: e.target.value })}
          >
            <option value="">Оберіть жанр</option>
            {GENRES.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Обкладинка</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {[
              ["auto", "🔍 Автоматично"],
              ["upload", "📁 Своя картинка"],
            ].map(([mode, label]) => (
              <div
                key={mode}
                onClick={() => setCoverMode(mode)}
                style={{
                  flex: 1,
                  padding: "10px 6px",
                  border: `1px solid ${
                    coverMode === mode ? "#c8a96a" : "#2e271c"
                  }`,
                  color: coverMode === mode ? "#c8a96a" : "#7a6f60",
                  background:
                    coverMode === mode ? "rgba(200,169,106,0.08)" : "#120f0a",
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "Georgia, serif",
                  textAlign: "center",
                  transition: "all 0.15s",
                }}
              >
                {label}
              </div>
            ))}
          </div>
          {coverMode === "auto" && (
            <div
              style={{
                background: "#120f0a",
                border: "1px solid #2e271c",
                padding: "12px 14px",
                color: "#554d40",
                fontStyle: "italic",
                fontSize: 13,
                fontFamily: "Georgia, serif",
              }}
            >
              Обкладинка підтягнеться автоматично за назвою і автором
            </div>
          )}
          {coverMode === "upload" && (
            <div>
              {preview && (
                <div
                  style={{
                    marginBottom: 10,
                    height: 140,
                    background: "#120f0a",
                    border: "1px solid #2e271c",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={preview}
                    alt="preview"
                    style={{
                      maxHeight: "100%",
                      maxWidth: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}
              <label
                style={{
                  display: "block",
                  background: "#120f0a",
                  border: "1px dashed #3d3426",
                  padding: "14px",
                  textAlign: "center",
                  cursor: "pointer",
                  color: uploading ? "#554d40" : "#c8a96a",
                  fontFamily: "Georgia, serif",
                  fontSize: 13,
                  letterSpacing: "0.08em",
                }}
              >
                {uploading
                  ? "Завантажуємо..."
                  : preview
                  ? "↺ Змінити фото"
                  : "+ Обрати фото"}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Статус</label>
          <div style={{ display: "flex", gap: 8 }}>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <div
                key={key}
                onClick={() => setForm({ ...form, status: key })}
                style={{
                  flex: 1,
                  padding: "10px 4px",
                  border: `1px solid ${
                    form.status === key ? STATUS_COLORS[key] : "#2e271c"
                  }`,
                  color: form.status === key ? STATUS_COLORS[key] : "#7a6f60",
                  background:
                    form.status === key ? `${STATUS_COLORS[key]}15` : "#120f0a",
                  cursor: "pointer",
                  fontSize: 12,
                  fontFamily: "Georgia, serif",
                  textAlign: "center",
                  transition: "all 0.15s",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: "transparent",
              border: "1px solid #2e271c",
              color: "#7a6f60",
              fontFamily: "Georgia, serif",
              fontSize: 14,
              padding: "12px",
              cursor: "pointer",
            }}
          >
            Скасувати
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || uploading}
            style={{
              flex: 2,
              background: "rgba(200,169,106,0.1)",
              border: "1px solid #3d3426",
              color: "#c8a96a",
              fontFamily: "Georgia, serif",
              fontSize: 14,
              letterSpacing: "0.1em",
              padding: "12px",
              cursor: "pointer",
            }}
          >
            {loading
              ? "Зберігаємо..."
              : book?.id
              ? "Зберегти зміни"
              : "Додати до полиці"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ book, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(4px)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#1d1812",
          border: "1px solid #3d3426",
          padding: "clamp(24px, 4vw, 44px)",
          width: "100%",
          maxWidth: 420,
          textAlign: "center",
          position: "relative",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 12,
            left: 16,
            color: "#3d3426",
            fontSize: 12,
          }}
        >
          ✦
        </span>
        <span
          style={{
            position: "absolute",
            bottom: 12,
            right: 16,
            color: "#3d3426",
            fontSize: 12,
          }}
        >
          ✦
        </span>
        <div style={{ fontSize: 32, color: "#c46060", marginBottom: 16 }}>
          ✕
        </div>
        <h2
          style={{
            fontSize: "clamp(18px, 4vw, 24px)",
            fontWeight: "normal",
            color: "#e8dfc8",
            marginBottom: 10,
          }}
        >
          Видалити книгу?
        </h2>
        <p
          style={{
            color: "#7a6f60",
            fontStyle: "italic",
            fontSize: 15,
            marginBottom: 28,
          }}
        >
          «{book.title}» буде видалено назавжди
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: "transparent",
              border: "1px solid #2e271c",
              color: "#7a6f60",
              fontFamily: "Georgia, serif",
              fontSize: 14,
              padding: "12px",
              cursor: "pointer",
            }}
          >
            Скасувати
          </button>
          <button
            onClick={async () => {
              setLoading(true);
              await onConfirm();
              setLoading(false);
            }}
            disabled={loading}
            style={{
              flex: 1,
              background: "rgba(196,96,96,0.1)",
              border: "1px solid #c46060",
              color: "#c46060",
              fontFamily: "Georgia, serif",
              fontSize: 14,
              padding: "12px",
              cursor: "pointer",
            }}
          >
            {loading ? "Видаляємо..." : "Так, видалити"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Library({ session, onLogout, navigate }) {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const { data } = await supabase
      .from("books")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    if (data) setBooks(data);
  };

  const handleSave = async (form) => {
    if (modal?.book?.id) {
      await supabase
        .from("books")
        .update({
          title: form.title,
          author: form.author,
          genre: form.genre,
          status: form.status,
          cover_url: form.cover_url || null,
        })
        .eq("id", modal.book.id);
    } else {
      await supabase.from("books").insert({
        title: form.title,
        author: form.author,
        genre: form.genre,
        status: form.status,
        cover_url: form.cover_url || null,
        user_id: session.user.id,
      });
    }
    setModal(null);
    fetchBooks();
  };

  const handleDelete = async () => {
    await supabase.from("books").delete().eq("id", modal.book.id);
    setModal(null);
    fetchBooks();
  };

  const filtered = books.filter((b) => {
    const matchFilter = filter === "all" || b.status === filter;
    const matchSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.author || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = { want: 0, library: 0, done: 0 };
  books.forEach((b) => {
    if (counts[b.status] !== undefined) counts[b.status]++;
  });

  const navItems = [
    { key: "all", label: "Всі книги", count: books.length },
    { key: "want", label: "✧ Бажанки", count: counts.want },
    { key: "library", label: "📚 Бібліотека", count: counts.library },
    { key: "done", label: "✓ Прочитано", count: counts.done },
  ];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; background: #0e0c09; overflow-x: hidden; }
        #root { width: 100%; }
        .layout { display: flex; min-height: 100vh; width: 100%; }
        .sidebar { width: 280px; flex-shrink: 0; background: #120f0a; border-right: 1px solid #2e271c; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
        .lib-main { flex: 1; padding: 48px 56px; min-width: 0; overflow-x: hidden; }
        .books-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1px; background: #2e271c; border: 1px solid #2e271c; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #2e271c; border: 1px solid #2e271c; margin-bottom: 32px; }
        .filters-row { display: flex; gap: 10px; margin-bottom: 28px; flex-wrap: wrap; align-items: center; }
        .desktop-add-btn { display: inline-block; }
        .mobile-header { display: none; }

        @media (max-width: 900px) {
          .sidebar { display: none !important; }
          .sidebar.open { display: flex !important; position: fixed; top: 0; left: 0; bottom: 0; width: 280px; height: 100vh; z-index: 500; }
          .layout { display: block !important; }
          .lib-main { padding: 20px 16px; width: 100%; }
          .books-grid { grid-template-columns: repeat(2, 1fr); }
          .desktop-add-btn { display: none !important; }
          .mobile-header { display: flex !important; align-items: center; justify-content: space-between; padding: 14px 16px; background: #120f0a; border-bottom: 1px solid #2e271c; position: sticky; top: 0; z-index: 100; width: 100%; }
        }

        @media (max-width: 380px) {
          .books-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div
        className="layout"
        style={{
          fontFamily: "Georgia, serif",
          background: "#0e0c09",
          color: "#e8dfc8",
        }}
      >
        {/* MOBILE HEADER */}
        <div className="mobile-header">
          <div style={{ color: "#c8a96a", fontSize: 20, fontStyle: "italic" }}>
            ❧ Полиця
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setModal({ type: "add" })}
              style={{
                background: "rgba(200,169,106,0.1)",
                border: "1px solid #3d3426",
                color: "#c8a96a",
                fontFamily: "Georgia, serif",
                fontSize: 13,
                padding: "8px 14px",
                cursor: "pointer",
              }}
            >
              + Додати
            </button>
            <button
              onClick={() => setShowMobileMenu(true)}
              style={{
                background: "transparent",
                border: "1px solid #2e271c",
                color: "#7a6f60",
                fontFamily: "Georgia, serif",
                fontSize: 18,
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              ☰
            </button>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className={`sidebar${showMobileMenu ? " open" : ""}`}>
          {showMobileMenu && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.7)",
                zIndex: -1,
              }}
              onClick={() => setShowMobileMenu(false)}
            />
          )}
          <div
            style={{
              padding: "32px 24px 22px",
              borderBottom: "1px solid #2e271c",
              textAlign: "center",
              position: "relative",
            }}
          >
            {showMobileMenu && (
              <button
                onClick={() => setShowMobileMenu(false)}
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  background: "transparent",
                  border: "none",
                  color: "#554d40",
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            )}
            <div
              style={{
                color: "#554d40",
                fontSize: 10,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Bibliotheca Privata
            </div>
            <div
              style={{ color: "#c8a96a", fontSize: 26, fontWeight: "normal" }}
            >
              <em>Полиця</em>
            </div>
            <div
              style={{
                color: "#3d3426",
                marginTop: 10,
                letterSpacing: 5,
                fontSize: 16,
              }}
            >
              ❧ ✦ ❧
            </div>
          </div>

          <nav style={{ padding: "20px 0", flex: 1 }}>
            <div
              style={{
                color: "#554d40",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                padding: "12px 24px 6px",
              }}
            >
              Collectio
            </div>
            {navItems.map((item) => (
              <div
                key={item.key}
                onClick={() => {
                  setFilter(item.key);
                  setShowMobileMenu(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 24px",
                  cursor: "pointer",
                  fontSize: 15,
                  color: filter === item.key ? "#c8a96a" : "#7a6f60",
                  borderLeft:
                    filter === item.key
                      ? "3px solid #c8a96a"
                      : "3px solid transparent",
                  background:
                    filter === item.key
                      ? "rgba(200,169,106,0.07)"
                      : "transparent",
                  transition: "all 0.15s",
                }}
              >
                <span>{item.label}</span>
                <span
                  style={{
                    fontSize: 13,
                    fontStyle: "italic",
                    color: filter === item.key ? "#c8a96a" : "#554d40",
                  }}
                >
                  {item.count}
                </span>
              </div>
            ))}
          </nav>

          <div style={{ padding: "20px 24px", borderTop: "1px solid #2e271c" }}>
            <div
              style={{
                fontSize: 13,
                color: "#c9b99a",
                marginBottom: 4,
                wordBreak: "break-all",
              }}
            >
              {session.user.email}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#554d40",
                fontStyle: "italic",
                marginBottom: 16,
              }}
            >
              {books.length} томів у колекції
            </div>
            <button
              onClick={() => navigate("")}
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid #2e271c",
                color: "#554d40",
                fontFamily: "Georgia, serif",
                fontSize: 12,
                padding: "9px",
                cursor: "pointer",
                letterSpacing: "0.08em",
                marginBottom: 8,
              }}
            >
              ← На головну
            </button>
            <button
              onClick={onLogout}
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid #2e271c",
                color: "#554d40",
                fontFamily: "Georgia, serif",
                fontSize: 12,
                padding: "9px",
                cursor: "pointer",
                letterSpacing: "0.08em",
              }}
            >
              Вийти
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="lib-main">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 8,
            }}
          >
            <div>
              <div
                style={{
                  color: "#554d40",
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                ✦ Mea Bibliotheca ✦
              </div>
              <h1
                style={{
                  fontSize: "clamp(28px, 5vw, 48px)",
                  fontWeight: "normal",
                  color: "#e8dfc8",
                  marginBottom: 6,
                  lineHeight: 1.1,
                }}
              >
                Моя <em style={{ color: "#c8a96a" }}>Полиця</em>
              </h1>
              <p
                style={{
                  color: "#7a6f60",
                  fontStyle: "italic",
                  fontSize: 15,
                  marginBottom: 28,
                }}
              >
                {books.length} томів · anno MMXXVI
              </p>
            </div>
            <button
              className="desktop-add-btn"
              onClick={() => setModal({ type: "add" })}
              style={{
                background: "rgba(200,169,106,0.1)",
                border: "1px solid #3d3426",
                color: "#c8a96a",
                fontFamily: "Georgia, serif",
                fontSize: 14,
                letterSpacing: "0.1em",
                padding: "12px 24px",
                cursor: "pointer",
                flexShrink: 0,
                marginTop: 28,
              }}
            >
              + Додати книгу
            </button>
          </div>

          <div
            style={{
              height: 1,
              background:
                "linear-gradient(90deg,transparent,#3d3426,transparent)",
              margin: "0 0 28px",
            }}
          />

          {/* STATS */}
          <div className="stats-grid">
            {[
              { label: "бажанки", count: counts.want, color: "#c8a96a" },
              {
                label: "в бібліотеці",
                count: counts.library,
                color: "#8eac8b",
              },
              { label: "прочитано", count: counts.done, color: "#9b8fb4" },
            ].map((st) => (
              <div
                key={st.label}
                style={{ background: "#1d1812", padding: "20px 16px" }}
              >
                <div
                  style={{
                    fontSize: "clamp(28px, 4vw, 40px)",
                    color: st.color,
                    lineHeight: 1,
                    marginBottom: 6,
                  }}
                >
                  {st.count}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#7a6f60",
                    fontStyle: "italic",
                  }}
                >
                  {st.label}
                </div>
              </div>
            ))}
          </div>

          {/* FILTERS */}
          <div className="filters-row">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#1d1812",
                border: "1px solid #2e271c",
                padding: "10px 14px",
                flex: 1,
                maxWidth: 280,
              }}
            >
              <span style={{ color: "#554d40", fontSize: 16 }}>⌕</span>
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
                placeholder="Пошук..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
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
                  padding: "10px 14px",
                  border: `1px solid ${filter === key ? "#c8a96a" : "#2e271c"}`,
                  color: filter === key ? "#c8a96a" : "#7a6f60",
                  background:
                    filter === key ? "rgba(200,169,106,0.08)" : "#1d1812",
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "Georgia, serif",
                  letterSpacing: "0.06em",
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
                padding: "80px 0",
                color: "#554d40",
                fontStyle: "italic",
                fontSize: 18,
              }}
            >
              {books.length === 0
                ? "Полиця порожня — додай першу книгу ✦"
                : "Нічого не знайдено"}
            </div>
          ) : (
            <div className="books-grid">
              {filtered.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onEdit={(b) => setModal({ type: "edit", book: b })}
                  onDelete={(b) => setModal({ type: "delete", book: b })}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {(modal?.type === "add" || modal?.type === "edit") && (
        <BookModal
          book={modal.type === "edit" ? modal.book : null}
          onClose={() => setModal(null)}
          onSave={handleSave}
          userId={session.user.id}
        />
      )}
      {modal?.type === "delete" && (
        <DeleteModal
          book={modal.book}
          onClose={() => setModal(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
