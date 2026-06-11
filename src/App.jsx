import { useEffect, useState } from "react";
import Home from "./pages/Home";
import JoinMeeting from "./pages/JoinMeeting";

function getPageFromHash() {
  return window.location.hash === "#join" ? "join" : "home";
}

export default function App() {
  const [page, setPage] = useState(getPageFromHash);

  useEffect(() => {
    const handleHashChange = () => setPage(getPageFromHash());

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (page === "join") {
    return <JoinMeeting />;
  }

  return <Home />;
}