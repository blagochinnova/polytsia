import { useState } from "react";
import { supabase } from "./supabase";

const G = {
  page: {
    minHeight: "100vh",
    background: "#0e0c09",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Georgia, serif",
    padding: 20,
  },
  box: {
    background: "#1d1812",
    border: "1px solid #3d3426",
    padding: "48px",
    width: "100%",
    maxWidth: 440,
    position: "relative",
  },
  eyebrow: {
    color: "#554d40",
    fontSize: 10,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  title: {
    color: "#e8dfc8",
    fontSize: 32,
    fontWeight: "normal",
    marginBottom: 32,
    lineHeight: 1.1,
  },
  label: {
    display: "block",
    fontSize: 10,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "#554d40",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    background: "#120f0a",
    border: "1px solid #2e271c",
    padding: "11px 14px",
    color: "#e8dfc8",
    fontFamily: "Georgia, serif",
    fontStyle: "italic",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
    marginBottom: 16,
  },
  btn: {
    width: "100%",
    background: "rgba(200,169,106,0.1)",
    border: "1px solid #3d3426",
    color: "#c8a96a",
    fontFamily: "Georgia, serif",
    fontSize: 14,
    letterSpacing: "0.1em",
    padding: "12px",
    cursor: "pointer",
    marginBottom: 16,
  },
  msg: {
    fontStyle: "italic",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  switch: {
    color: "#554d40",
    fontSize: 13,
    textAlign: "center",
    fontStyle: "italic",
  },
  link: { color: "#c8a96a", cursor: "pointer", textDecoration: "underline" },
};

export default function Auth({ session, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", error: false });

  if (session) {
    onSuccess();
    return null;
  }

  const handleSubmit = async () => {
    setLoading(true);
    setMessage({ text: "", error: false });

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setMessage({ text: error.message, error: true });
      else onSuccess();
    } else {
      if (!name.trim()) {
        setMessage({ text: "Введи своє ім'я", error: true });
        setLoading(false);
        return;
      }
      if (!username.trim()) {
        setMessage({ text: "Введи username", error: true });
        setLoading(false);
        return;
      }
      if (username.includes(" ")) {
        setMessage({ text: "Username без пробілів", error: true });
        setLoading(false);
        return;
      }

      // перевірка чи username вільний
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username.toLowerCase())
        .single();
      if (existing) {
        setMessage({ text: "Цей username вже зайнятий", error: true });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage({ text: error.message, error: true });
        setLoading(false);
        return;
      }

      if (data.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          name: name.trim(),
          username: username.toLowerCase().trim(),
        });
        onSuccess();
      }
    }
    setLoading(false);
  };

  return (
    <div style={G.page}>
      <div style={G.box}>
        <span
          style={{
            position: "absolute",
            top: 12,
            left: 16,
            color: "#3d3426",
            fontSize: 11,
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
            fontSize: 11,
          }}
        >
          ✦
        </span>
        <div style={G.eyebrow}>Bibliotheca Privata</div>
        <h1 style={G.title}>
          {isLogin ? "Вхід до " : "Реєстрація в "}
          <em style={{ color: "#c8a96a" }}>Полицю</em>
        </h1>

        {!isLogin && (
          <>
            <label style={G.label}>Твоє ім'я</label>
            <input
              style={G.input}
              placeholder="Наприклад: Діана"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label style={G.label}>Username (для посилання)</label>
            <input
              style={G.input}
              placeholder="наприклад: diana"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))
              }
            />
          </>
        )}

        <label style={G.label}>Email</label>
        <input
          style={G.input}
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label style={G.label}>Пароль</label>
        <input
          style={G.input}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        {message.text && (
          <p style={{ ...G.msg, color: message.error ? "#c46060" : "#8eac8b" }}>
            {message.text}
          </p>
        )}

        <button style={G.btn} onClick={handleSubmit} disabled={loading}>
          {loading
            ? "Зачекай..."
            : isLogin
            ? "Увійти до бібліотеки"
            : "Створити акаунт"}
        </button>

        <p style={G.switch}>
          {isLogin ? "Ще немає акаунту? " : "Вже є акаунт? "}
          <span
            style={G.link}
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage({ text: "", error: false });
            }}
          >
            {isLogin ? "Зареєструватись" : "Увійти"}
          </span>
        </p>
        <p style={{ ...G.switch, marginTop: 12 }}>
          <span
            style={G.link}
            onClick={() => {
              window.location.hash = "";
            }}
          >
            ← На головну
          </span>
        </p>
      </div>
    </div>
  );
}
