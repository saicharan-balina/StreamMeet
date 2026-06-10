import {
  FiCast,
  FiMessageCircle,
  FiMic,
  FiMonitor,
  FiSmartphone,
  FiUsers,
} from "react-icons/fi";

const featureList = [
  {
    title: "HD Video Calls",
    description: "Conduct face-to-face meetings through WebRTC.",
    icon: FiCast,
  },
  {
    title: "Audio Communication",
    description: "Talk with participants in real time.",
    icon: FiMic,
  },
  {
    title: "Screen Sharing",
    description: "Share presentations, code, or documents.",
    icon: FiMonitor,
  },
  {
    title: "Real-Time Chat",
    description: "Exchange messages during meetings.",
    icon: FiMessageCircle,
  },
  {
    title: "Meeting Rooms",
    description: "Create and join rooms using a unique room ID.",
    icon: FiUsers,
  },
  {
    title: "Responsive Design",
    description: "Works across desktop and mobile devices.",
    icon: FiSmartphone,
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-sky-700">Features</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Tools for clear and simple communication
          </h2>
          <p className="mt-4 text-slate-600">
            Everything in StreamMeet is designed for easy collaboration during classes, team work,
            and project discussions.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featureList.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-6 transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-white hover:shadow-lg"
              >
                <span className="inline-flex rounded-xl bg-sky-100 p-3 text-sky-700 transition group-hover:bg-sky-600 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
