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
    <main className="min-h-screen bg-[#f0f4f8] font-sans text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[62px] max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link to="/checkout" className="text-lg font-extrabold tracking-tight text-slate-950 sm:text-xl">
            <span className="text-blue-700">Import</span>withBusyDev
          </Link>
          <span className="hidden text-sm font-medium text-slate-500 sm:inline">
            Secure course enrollment
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_350px] lg:items-start">
        <section className="min-w-0">
          <div className="mb-7 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link to="/checkout" className="hover:text-blue-700">Course</Link>
            <span aria-hidden="true">›</span>
            <span className="font-medium text-slate-800">Complete enrollment</span>
          </div>

          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
              Your course order
            </p>
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Complete your enrollment
            </h1>
            {/* <p className="max-w-2xl text-base leading-7 text-slate-600">
              Your masterclass is included. Choose any optional guides you want
              and review your total before continuing to Paystack.
            </p> */}
          </div>

          <form id="upsell-checkout" onSubmit={handlePayment}>
            <div className="mb-8 overflow-hidden rounded-md border border-slate-200 bg-white">
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
                <h2 className="font-bold text-slate-900">Included in your enrollment</h2>
              </div>
              <div className="flex items-start justify-between gap-4 px-5 py-5 sm:px-6">
                <div>
                  <h3 className="font-bold text-slate-900">
                    The Complete Importation Masterclass
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Learn product sourcing, supplier communication, shipping, and selling.
                  </p>
                </div>
                <span className="shrink-0 font-bold text-slate-900">
                  {formatGhs(COURSE_PRICE_GHS)}
                </span>
              </div>
            </div>

            <fieldset className="mb-8">
              <legend className="mb-1 text-xl font-bold text-slate-950">
                Add more to your course
              </legend>
              <p className="mb-4 text-sm leading-6 text-slate-600">
                Optional resources. Select a box to include it in your order.
              </p>
              <div className="space-y-3">
                {COURSE_ADD_ONS.map((addOn) => {
                  const selected = selectedAddOns.includes(addOn.id);
                  return (
                    <label
                      key={addOn.id}
                      className={`flex cursor-pointer items-start justify-between gap-4 rounded-md border bg-white p-4 transition sm:p-5 ${
                        selected
                          ? "border-blue-600 ring-1 ring-blue-600"
                          : "border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <span className="flex gap-3">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleAddOn(addOn.id)}
                          className="mt-1 h-5 w-5 shrink-0 accent-blue-700 focus:ring-blue-600"
                        />
                        <span>
                          <span className="block font-bold text-slate-900">{addOn.name}</span>
                          <span className="mt-1 block text-sm leading-6 text-slate-600">
                            {addOn.id === "importers-blueprint"
                              ? "A practical reference book to guide your importation journey."
                              : "A practical guide to communicating clearly and confidently with suppliers."}
                          </span>
                        </span>
                      </span>
                      <span className="shrink-0 font-bold text-slate-900">
                        +{formatGhs(addOn.priceGhs)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="mb-6 rounded-md border border-slate-200 bg-white p-5 sm:p-6">
              <label htmlFor="buyer-email" className="mb-2 block font-bold text-slate-900">
                Email for your Paystack receipt
              </label>
              <p className="mb-3 text-sm text-slate-600">
                Enter the email address where you want your payment receipt sent.
              </p>
              <input
                id="buyer-email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {error && (
              <p className="mb-5 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                to="/checkout"
              >
                Back to course
              </Link>
              <button
                type="submit"
                form="upsell-checkout"
                disabled={isStartingPayment}
                className="inline-flex min-h-12 items-center justify-center rounded bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
              >
                {isStartingPayment ? "Connecting to Paystack..." : `Continue to Paystack · ${formatGhs(total)}`}
              </button>
            </div>
          </form>
        </section>

        <aside className="overflow-hidden rounded-md border border-slate-200 bg-white lg:sticky lg:top-6">
          <div className="bg-slate-100 p-6 sm:p-7">
            <h2 className="mb-5 text-lg font-bold text-slate-900">Order summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-slate-600">Complete Importation Masterclass</span>
                <span className="font-semibold text-slate-900">{formatGhs(COURSE_PRICE_GHS)}</span>
              </div>
              {COURSE_ADD_ONS.filter((addOn) => selectedAddOns.includes(addOn.id)).map((addOn) => (
                <div key={addOn.id} className="flex justify-between gap-3">
                  <span className="text-slate-600">{addOn.name}</span>
                  <span className="font-semibold text-slate-900">{formatGhs(addOn.priceGhs)}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-slate-300 pt-5">
              <span className="text-base font-bold text-slate-900">Total</span>
              <span className="text-2xl font-extrabold text-slate-950">{formatGhs(total)}</span>
            </div>
            <button
              type="submit"
              form="upsell-checkout"
              disabled={isStartingPayment}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
            >
              {isStartingPayment ? "Connecting to Paystack..." : "Continue to checkout"}
            </button>
          </div>
          <div className="space-y-3 p-6 text-sm text-slate-600 sm:p-7">
            <p className="flex gap-3">
              <span className="font-bold text-blue-700" aria-hidden="true">✓</span>
              Secure payment processed by Paystack
            </p>
            <p className="flex gap-3">
              <span className="font-bold text-blue-700" aria-hidden="true">✓</span>
              Your total updates when you select an add-on
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
