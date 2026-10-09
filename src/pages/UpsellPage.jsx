import { useState } from "react";
import { Link } from "react-router-dom";
import { COURSE_ADD_ONS, COURSE_PRICE_GHS } from "../data/course-offers.js";
import { readApiResponse } from "../utils/readApiResponse.js";

const formatGhs = (amount) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount);

export default function UpsellPage() {
  const [email, setEmail] = useState("");
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [isStartingPayment, setIsStartingPayment] = useState(false);
  const [error, setError] = useState("");

  const total =
    COURSE_PRICE_GHS +
    COURSE_ADD_ONS.reduce(
      (sum, addOn) => sum + (selectedAddOns.includes(addOn.id) ? addOn.priceGhs : 0),
      0,
    );

  function toggleAddOn(id) {
    setSelectedAddOns((selected) =>
      selected.includes(id)
        ? selected.filter((selectedId) => selectedId !== id)
        : [...selected, id],
    );
  }

  async function handlePayment(event) {
    event.preventDefault();
    setError("");
    setIsStartingPayment(true);

    try {
      const response = await fetch("/api/initialize-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, addOnIds: selectedAddOns }),
      });
      const result = await readApiResponse(response, "Payment setup");

      if (!response.ok || typeof result.authorizationUrl !== "string") {
        throw new Error(result.message || "Could not start payment. Please try again.");
      }

      window.location.assign(result.authorizationUrl);
    } catch (paymentError) {
      console.error("Unable to start payment", paymentError);
      setError(paymentError.message || "Could not start payment. Please try again.");
      setIsStartingPayment(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-12 text-slate-100">
      <section className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-purple-950/30 sm:p-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-purple-300">
          Your course order
        </p>
        <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
          Complete your enrollment
        </h1>
        <p className="mb-8 leading-7 text-slate-300">
          The masterclass is included. Add either optional guide to your order
          before continuing to secure Paystack checkout.
        </p>

        <form onSubmit={handlePayment}>
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4 rounded-xl border border-purple-400/40 bg-purple-400/10 p-4">
              <div>
                <h2 className="font-semibold text-white">Complete Importation Masterclass</h2>
                <p className="mt-1 text-sm text-slate-300">Main course offer</p>
              </div>
              <span className="shrink-0 font-semibold">{formatGhs(COURSE_PRICE_GHS)}</span>
            </div>

            {COURSE_ADD_ONS.map((addOn) => (
              <label
                key={addOn.id}
                className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-white/10 p-4 transition hover:border-purple-300/60"
              >
                <span className="flex gap-3">
                  <input
                    type="checkbox"
                    checked={selectedAddOns.includes(addOn.id)}
                    onChange={() => toggleAddOn(addOn.id)}
                    className="mt-1 h-4 w-4 accent-purple-500"
                  />
                  <span>
                    <span className="block font-semibold text-white">{addOn.name}</span>
                    <span className="mt-1 block text-sm text-slate-400">Optional add-on</span>
                  </span>
                </span>
                <span className="shrink-0 font-semibold">{formatGhs(addOn.priceGhs)}</span>
              </label>
            ))}
          </div>

          <div className="my-7 border-t border-white/10 pt-5">
            <label htmlFor="buyer-email" className="mb-2 block font-semibold text-white">
              Email for your Paystack receipt
            </label>
            <input
              id="buyer-email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-white/15 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
            />
          </div>

          <div className="mb-6 flex items-center justify-between border-t border-white/10 pt-5 text-lg">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-bold text-white">{formatGhs(total)}</span>
          </div>

          {error && (
            <p className="mb-4 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isStartingPayment}
            className="flex min-h-12 w-full items-center justify-center rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-wait disabled:opacity-60"
          >
            {isStartingPayment ? "Connecting to Paystack..." : `Continue to Paystack · ${formatGhs(total)}`}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          <Link className="text-purple-300 underline underline-offset-4 hover:text-purple-200" to="/checkout">
            Back to course details
          </Link>
        </p>
      </section>
    </main>
  );
}
