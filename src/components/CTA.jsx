import { FiArrowRight } from "react-icons/fi";

export default function CTA() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-sky-600 to-cyan-500 px-6 py-12 text-center text-white shadow-xl sm:px-10">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to Start a Meeting?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-sky-100 sm:text-base">
            Create a room and invite others instantly. StreamMeet helps your team stay connected
            for discussions, classes, and project collaboration.
          </p>
          <button
            type="button"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
          >
            Create Room
            <FiArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
