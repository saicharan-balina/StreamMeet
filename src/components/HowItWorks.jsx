import { FiLink2, FiPlusCircle, FiUsers } from "react-icons/fi";

const steps = [
  {
    title: "Create a meeting room",
    description: "Start a new room in seconds and get a unique room ID.",
    icon: FiPlusCircle,
  },
  {
    title: "Share the room link or room ID",
    description: "Send the invite to your classmates, teammates, or friends.",
    icon: FiLink2,
  },
  {
    title: "Participants join and communicate",
    description: "Talk, share screens, and chat together in real time.",
    icon: FiUsers,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-slate-900 py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-sky-300">How It Works</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Start a meeting in three simple steps
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article
                key={step.title}
                className="rounded-2xl border border-slate-700 bg-slate-800/70 p-6"
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-sky-200">
                  <span>Step {index + 1}</span>
                </div>
                <span className="mt-4 inline-flex rounded-xl bg-sky-500/20 p-3 text-sky-300">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{step.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
