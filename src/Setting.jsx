import { useState, useEffect } from "react";
import { supabase } from "./supabase";

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

export default function Settings({ session, navigate, onLogout }) {
  const [profile, setProfile] = useState({ name: "", username: "" });
  const [password, setPassword] = useState({ new: "", confirm: "" });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [msgProfile, setMsgProfile] = useState({ text: "", error: false });
  const [msgPassword, setMsgPassword] = useState({ text: "", error: false });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (data) setProfile({ name: data.name, username: data.username });
    };
    fetchProfile();
  }, [session.user.id]);

  const saveProfile = async () => {
    if (!profile.name.trim() || !profile.username.trim()) {
      setMsgProfile({ text: "Заповни всі поля", error: true });
      return;
    }
    setLoadingProfile(true);
    setMsgProfile({ text: "", error: false });

    // перевірка чи username не зайнятий іншим
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", profile.username.toLowerCase())
      .neq("id", session.user.id)
      .single();
    if (existing) {
      setMsgProfile({ text: "Цей username вже зайнятий", error: true });
      setLoadingProfile(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        name: profile.name.trim(),
        username: profile.username.toLowerCase().trim(),
      })
      .eq("id", session.user.id);

    setMsgProfile(
      error
        ? { text: "Помилка збереження", error: true }
        : { text: "Профіль оновлено ✦", error: false }
    );
    setLoadingProfile(false);
  };

  const savePassword = async () => {
    if (!password.new) {
      setMsgPassword({ text: "Введи новий пароль", error: true });
      return;
    }
    if (password.new.length < 6) {
      setMsgPassword({ text: "Пароль мінімум 6 символів", error: true });
      return;
    }
    if (password.new !== password.confirm) {
      setMsgPassword({ text: "Паролі не збігаються", error: true });
      return;
    }

    setLoadingPassword(true);
    setMsgPassword({ text: "", error: false });

    const { error } = await supabase.auth.updateUser({
      password: password.new,
    });
    setMsgPassword(
      error
        ? { text: "Помилка зміни паролю", error: true }
        : { text: "Пароль змінено ✦", error: false }
    );
    setPassword({ new: "", confirm: "" });
    setLoadingPassword(false);
  };

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
          .settings-main { padding: 24px 20px !important; }
        }
      `}</style>

      {/* HEADER */}
      <header
        style={{
          borderBottom: "1px solid #2e271c",
          padding: "0 48px",
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
          onClick={() => navigate("#/library")}
        >
          ← Полиця
        </span>
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
      </header>

      <div
        className="settings-main"
        style={{ maxWidth: 560, margin: "0 auto", padding: "48px 24px" }}
      >
        <div
          style={{
            color: "#554d40",
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          ✦ Parametri ✦
        </div>
        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 40px)",
            fontWeight: "normal",
            marginBottom: 8,
          }}
        >
          Налаштування <em style={{ color: "#c8a96a" }}>профілю</em>
        </h1>
        <p
          style={{
            color: "#7a6f60",
            fontStyle: "italic",
            fontSize: 14,
            marginBottom: 40,
          }}
        >
          {session.user.email}
        </p>

        <div
          style={{
            height: 1,
            background:
              "linear-gradient(90deg,transparent,#3d3426,transparent)",
            marginBottom: 40,
          }}
        />

        {/* ПРОФІЛЬ */}
        <div
          style={{
            background: "#1d1812",
            border: "1px solid #2e271c",
            padding: "32px",
            marginBottom: 24,
            position: "relative",
          }}
        >
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
          <h2
            style={{
              fontSize: 20,
              fontWeight: "normal",
              color: "#c9b99a",
              marginBottom: 24,
            }}
          >
            Особисті дані
          </h2>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Ім'я</label>
            <input
              style={inputStyle}
              placeholder="Твоє ім'я..."
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Username</label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#554d40",
                  fontSize: 15,
                }}
              >
                @
              </span>
              <input
                style={{ ...inputStyle, paddingLeft: 30 }}
                placeholder="username..."
                value={profile.username}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    username: e.target.value.toLowerCase().replace(/\s/g, ""),
                  })
                }
              />
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#554d40",
                fontStyle: "italic",
                marginTop: 6,
              }}
            >
              Твоя сторінка: polytsia.vercel.app/#/user/
              {profile.username || "username"}
            </div>
          </div>

          {msgProfile.text && (
            <div
              style={{
                fontSize: 14,
                fontStyle: "italic",
                marginBottom: 16,
                color: msgProfile.error ? "#c46060" : "#8eac8b",
              }}
            >
              {msgProfile.text}
            </div>
          )}

          <button
            onClick={saveProfile}
            disabled={loadingProfile}
            style={{
              background: "rgba(200,169,106,0.1)",
              border: "1px solid #3d3426",
              color: "#c8a96a",
              fontFamily: "Georgia, serif",
              fontSize: 14,
              letterSpacing: "0.1em",
              padding: "12px 28px",
              cursor: "pointer",
            }}
          >
            {loadingProfile ? "Зберігаємо..." : "Зберегти зміни"}
          </button>
        </div>

        {/* ПАРОЛЬ */}
        <div
          style={{
            background: "#1d1812",
            border: "1px solid #2e271c",
            padding: "32px",
            position: "relative",
          }}
        >
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
          <h2
            style={{
              fontSize: 20,
              fontWeight: "normal",
              color: "#c9b99a",
              marginBottom: 24,
            }}
          >
            Зміна паролю
          </h2>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Новий пароль</label>
            <input
              style={inputStyle}
              type="password"
              placeholder="••••••••"
              value={password.new}
              onChange={(e) =>
                setPassword({ ...password, new: e.target.value })
              }
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Повторити пароль</label>
            <input
              style={inputStyle}
              type="password"
              placeholder="••••••••"
              value={password.confirm}
              onChange={(e) =>
                setPassword({ ...password, confirm: e.target.value })
              }
            />
          </div>

          {msgPassword.text && (
            <div
              style={{
                fontSize: 14,
                fontStyle: "italic",
                marginBottom: 16,
                color: msgPassword.error ? "#c46060" : "#8eac8b",
              }}
            >
              {msgPassword.text}
            </div>
          )}

          <button
            onClick={savePassword}
            disabled={loadingPassword}
            style={{
              background: "rgba(200,169,106,0.1)",
              border: "1px solid #3d3426",
              color: "#c8a96a",
              fontFamily: "Georgia, serif",
              fontSize: 14,
              letterSpacing: "0.1em",
              padding: "12px 28px",
              cursor: "pointer",
            }}
          >
            {loadingPassword ? "Змінюємо..." : "Змінити пароль"}
          </button>
        </div>
      </div>
    </div>
  );
}
