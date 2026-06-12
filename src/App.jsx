import { useEffect, useState } from "react";
import Home from "./pages/Home";
import JoinMeeting from "./pages/JoinMeeting";
import Meeting from "./pages/Meeting";
import { NotificationProvider } from "./components/NotificationProvider";

function getPageFromHash() {
  const hash = window.location.hash.substring(1).split("?")[0];
  if (hash === "join") return "join";
  if (hash.startsWith("meeting")) return "meeting";
  return "home";
}

export default function App() {
  const [page, setPage] = useState(getPageFromHash);

  useEffect(() => {
    const handleHashChange = () => setPage(getPageFromHash());

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (page === "join") {
    return (
      <NotificationProvider>
        <JoinMeeting />
      </NotificationProvider>
    );
  }

  if (page === "meeting") {
    return (
      <NotificationProvider>
        <Meeting />
      </NotificationProvider>
    );
  }

  return (
    <NotificationProvider>
      <Home />
    </NotificationProvider>
  );
}