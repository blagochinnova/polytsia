import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Auth from "./Auth";
import Library from "./Library";
import Settings from "./Settings";
import Home from "./Home";
import PublicProfile from "./PublicProfile";

function App() {
  const [session, setSession] = useState(null);
  const [page, setPage] = useState("home"); // home | auth | library | profile
  const [profileUsername, setProfileUsername] = useState(null);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_e, session) => setSession(session));
  }, []);

  // простий роутинг через hash
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#/user/")) {
        setProfileUsername(hash.replace("#/user/", ""));
        setPage("profile");
      } else if (hash === "#/library") {
        setPage("library");
      } else if (hash === "#/auth") {
        setPage("auth");
      } else if (hash === "#/settings") {
        setPage("settings");
      } else {
        setPage("home");
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const navigate = (path) => {
    window.location.hash = path;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (page === "auth")
    return <Auth session={session} onSuccess={() => navigate("#/library")} />;
  if (page === "library") {
    if (!session) {
      navigate("#/auth");
      return null;
    }
    return (
      <Library session={session} onLogout={handleLogout} navigate={navigate} />
    );
  }
  if (page === "settings") {
    if (!session) {
      navigate("#/auth");
      return null;
    }
    return (
      <Settings session={session} navigate={navigate} onLogout={handleLogout} />
    );
  }
  if (page === "profile")
    return (
      <PublicProfile
        username={profileUsername}
        session={session}
        navigate={navigate}
      />
    );
  return <Home session={session} navigate={navigate} onLogout={handleLogout} />;
}

export default App;
