import { useState } from "react";
import {
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiLink,
  FiLock,
  FiRepeat,
  FiVideo,
} from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const modes = [
  {
    id: "quick",
    title: "Quick start",
    description: "Create a meeting with the simplest room settings.",
  },
  {
    id: "private",
    title: "Private room",
    description: "Keep the meeting locked to invited participants only.",
  },
  {
    id: "recurring",
    title: "Recurring",
    description: "Reuse the same room for regular weekly sessions.",
  },
];

export default function ScheduleMeeting() {
  const [meetingTitle, setMeetingTitle] = useState("");
  const [hostName, setHostName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mode, setMode] = useState("quick");

  const roomCode = "SM-204";

  const handleSchedule = () => {
    if (!meetingTitle.trim() || !hostName.trim() || !date || !time) {
      return;
    }

    window.location.hash = `#meeting?room=${encodeURIComponent(roomCode)}&name=${encodeURIComponent(hostName)}`;
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-emerald-50 py-20">
        <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center rounded-full border border-sky-200 bg-sky-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-700">
              Schedule a meeting
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Set up a simple meeting in a clean flow
            </h1>
            <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg">
              Pick a time, name the room, and create a shareable meeting that matches the same
              light StreamMeet theme used across the app.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {modes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    mode === item.id
                      ? "border-sky-300 bg-sky-50 shadow-sm"
                      : "border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur-sm sm:p-8">
              <label className="text-sm font-semibold text-slate-700" htmlFor="meetingTitle">
                Meeting title
              </label>
              <input
                id="meetingTitle"
                type="text"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="Weekly design sync"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />

              <label className="text-sm font-semibold text-slate-700" htmlFor="hostName">
                Host name
              </label>
              <input
                id="hostName"
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700" htmlFor="date">
                    Date
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700" htmlFor="time">
                    Time (24-hour)
                  </label>
                  <input
                    id="time"
                    type="time"
                    step="60"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    placeholder="14:30"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleSchedule}
                  disabled={!meetingTitle.trim() || !hostName.trim() || !date || !time}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Schedule Meeting
                  <FiArrowRight className="h-4 w-4" />
                </button>
                <a
                  href="#join"
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Join Instead
                </a>
              </div>
            </div>
          </div>

          <div className="self-center space-y-5 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-xl backdrop-blur-sm">
            <div className="rounded-2xl bg-slate-900 p-5 text-slate-100">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-300">
                <span>Schedule preview</span>
                <span>{roomCode}</span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-sky-500/80 p-4">
                  <FiVideo className="h-5 w-5" />
                  <p className="mt-6 text-sm font-semibold">Meeting ready</p>
                  <p className="mt-1 text-xs text-sky-50/80">Start with camera and mic controls</p>
                </div>
                <div className="rounded-xl bg-emerald-500/80 p-4">
                  <FiLink className="h-5 w-5" />
                  <p className="mt-6 text-sm font-semibold">Invite link</p>
                  <p className="mt-1 text-xs text-emerald-50/80">Share the room with participants</p>
                </div>
                <div className="rounded-xl bg-amber-500/80 p-4">
                  <FiClock className="h-5 w-5" />
                  <p className="mt-6 text-sm font-semibold">Set time</p>
                  <p className="mt-1 text-xs text-amber-50/80">Keep the start time clear</p>
                </div>
                <div className="rounded-xl bg-slate-700 p-4">
                  <FiLock className="h-5 w-5" />
                  <p className="mt-6 text-sm font-semibold">Private by default</p>
                  <p className="mt-1 text-xs text-slate-200">Only invited users can join</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <div className="mt-0.5 rounded-lg bg-sky-100 p-2 text-sky-700">
                  <FiCalendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Simple scheduling</p>
                  <p className="mt-1 text-sm text-slate-600">
                    The page stays lightweight and focused on the core fields only.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <div className="mt-0.5 rounded-lg bg-emerald-100 p-2 text-emerald-700">
                  <FiRepeat className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Recurring option</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Use the recurring mode when the same room will be reused each week.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}