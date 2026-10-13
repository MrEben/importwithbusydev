import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { COURSE_ADD_ONS, COURSE_PRICE_GHS } from "../data/course-offers.js";
import { initiateCheckout, lead } from "../utils/metaPixel.js";
import { readApiResponse } from "../utils/readApiResponse.js";
import MetaPixel from "../components/MetaPixel.jsx";

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

  useEffect(() => {
    initiateCheckout({
      id: "complete-importation-masterclass",
      name: "The Complete Importation Masterclass",
      price: COURSE_PRICE_GHS,
    });
  }, []);

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

      lead({
        name: "The Complete Importation Masterclass",
        price: total,
      });
      window.location.assign(result.authorizationUrl);
    } catch (paymentError) {
      console.error("Unable to start payment", paymentError);
      setError(paymentError.message || "Could not start payment. Please try again.");
      setIsStartingPayment(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--page-bg)] px-4 py-8 font-sans text-[var(--text)] sm:px-6 sm:py-12">
      <MetaPixel />
      <section className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold uppercase leading-tight tracking-tight text-[var(--text)] sm:text-4xl">
           There's a lot more. You might be <span className="text-[#6926E8]">interested😀.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[var(--text-muted)] sm:text-base">
            Your course is ready. Choose any extras to add to your order.
          </p>
        </header>

        <form id="upsell-checkout" onSubmit={handlePayment} className="space-y-5">
          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-5 py-4 sm:px-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Your Main Order Is
            </p>
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-semibold text-[var(--text)]">Complete Importation Masterclass</h2>
              <span className="shrink-0 font-bold text-[#6926E8]">
                {formatGhs(COURSE_PRICE_GHS)}
              </span>
            </div>
          </section>

          <fieldset>
            <legend className="mb-3 text-xs font-bold tracking-[0.01em] text-[var(--text-muted)]">
              There's more. You might be interested
            </legend>
            <div className="space-y-3">
              {COURSE_ADD_ONS.map((addOn) => {
                const selected = selectedAddOns.includes(addOn.id);
                return (
                  <label
                    key={addOn.id}
                    className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg border px-4 py-4 transition sm:px-5 ${
                      selected
                        ? "border-[#6926E8] bg-[rgba(105,38,232,0.08)]"
                          : "border-[var(--border)] bg-[var(--surface-strong)] hover:border-[#6926E8]"
                    }`}
                  >
                    <span className="flex min-w-0 items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleAddOn(addOn.id)}
                        className="mt-0.5 h-5 w-5 shrink-0 accent-purple-700 focus:ring-purple-600"
                      />
                      <span>
                        <span className="block font-semibold text-[var(--text)]">{addOn.name}</span>
                        <span className="mt-1 block text-sm leading-5 text-[var(--text-muted)]">
                          {addOn.description}
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 font-bold text-[#6926E8]">
                      +{formatGhs(addOn.priceGhs)}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor="buyer-email" className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Enter Email for your receipt
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
              className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface-field)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-soft)] focus:border-[#6926E8] focus:outline-none focus:ring-2 focus:ring-purple-700/20"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-400/30 bg-red-950/40 p-4 text-sm text-red-200" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between border-t border-[var(--border)] pt-5">
            <span className="font-semibold text-[var(--text)]">Total</span>
            <span className="text-2xl font-extrabold text-[var(--text)]">{formatGhs(total)}</span>
          </div>

          <button
            type="submit"
            form="upsell-checkout"
            disabled={isStartingPayment}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-purple-700 px-6 py-3 font-bold text-white transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[var(--page-bg)] disabled:cursor-wait disabled:opacity-60"
          >
            {isStartingPayment ? "Connecting to Paystack..." : "Make Payment"}
          </button>
          <p className="text-center text-xs text-[var(--text-muted)]">Secure payment via Paystack</p>
        </form>

        <div className="mt-6 text-center">
          <Link to="/checkout" className="text-sm font-medium text-[var(--text-muted)] transition hover:text-[var(--text)]">
            Back to course
          </Link>
        </div>
      </section>
    </main>
  );
}
