import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { readApiResponse } from "../utils/readApiResponse.js";
import telegramCourseLinks from "../data/telegram-course-links.json";
import coachingContact from "../data/coaching-contact.json";
import { COACHING_PRICE_GHS } from "../data/course-offers.js";

const formatGhs = (amount) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount);

export default function ThankYouPage() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const [verification, setVerification] = useState({
    reference: null,
    retry: -1,
    state: "checking",
    reason: null,
    packageId: null,
  });
  const [retry, setRetry] = useState(0);
  const verificationState =
    !reference
      ? "missing"
      : verification.reference === reference && verification.retry === retry
        ? verification.state
        : "checking";

  useEffect(() => {
    if (!reference) {
      return undefined;
    }

    const controller = new AbortController();

    fetch(`/api/verify-payment?reference=${encodeURIComponent(reference)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await readApiResponse(response, "Payment verification");
        if (!response.ok) {
          throw new Error(result.message || "Payment verification failed");
        }
        setVerification({
          reference,
          retry,
          state: result.verified ? "confirmed" : "unconfirmed",
          reason: result.reason,
          packageId: result.packageId,
        });
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Unable to verify payment", error);
          setVerification({
            reference,
            retry,
            state: "error",
            reason: null,
            packageId: null,
          });
        }
      });

    return () => controller.abort();
  }, [reference, retry]);
  const selectedCourseLink = telegramCourseLinks[verification.packageId];
  const isConfirmed = verificationState === "confirmed";
  const isCoachingPayment =
    isConfirmed && verification.packageId === "one-on-one-coaching";
  const isChecking = verificationState === "checking";
  const [coachingEmail, setCoachingEmail] = useState("");
  const [isStartingCoachingPayment, setIsStartingCoachingPayment] = useState(false);
  const [coachingError, setCoachingError] = useState("");
  const heading =
    isChecking
      ? "Verifying your payment"
      : isConfirmed
        ? "Congratulations!"
        : verificationState === "error"
          ? "We couldn’t verify your payment"
          : "Payment not confirmed";

  async function handleCoachingPayment(event) {
    event.preventDefault();
    setCoachingError("");
    setIsStartingCoachingPayment(true);

    try {
      const response = await fetch("/api/initialize-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: coachingEmail,
          productId: "one-on-one-coaching",
        }),
      });
      const result = await readApiResponse(response, "Coaching payment setup");

      if (!response.ok || typeof result.authorizationUrl !== "string") {
        throw new Error(result.message || "Could not start coaching payment. Please try again.");
      }

      window.location.assign(result.authorizationUrl);
    } catch (error) {
      console.error("Unable to start coaching payment", error);
      setCoachingError(error.message || "Could not start coaching payment. Please try again.");
      setIsStartingCoachingPayment(false);
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

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-7 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link to="/checkout" className="hover:text-blue-700">Course</Link>
          <span aria-hidden="true">›</span>
          <span className="font-medium text-slate-800">Payment status</span>
        </div>

        <section
          aria-live="polite"
          className="mx-auto max-w-3xl overflow-hidden rounded-md border border-slate-200 bg-white"
        >
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-7 sm:px-10 sm:py-9">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
              Import with BusyDev
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {heading}
            </h1>
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            {isChecking && (
              <div className="flex items-start gap-4">
                <div
                  className="mt-1 h-6 w-6 shrink-0 animate-spin rounded-full border-2 border-slate-200 border-t-blue-700"
                  aria-hidden="true"
                />
                <p className="max-w-xl leading-7 text-slate-600">
                  Please wait while we confirm your payment securely with Paystack.
                </p>
              </div>
            )}

            {isConfirmed && (
              <>
                <div className="mb-6 flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-700 text-2xl font-bold text-white"
                    aria-hidden="true"
                  >
                    ✓
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Payment confirmed</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {selectedCourseLink?.name || "Your selected course package"}
                    </p>
                  </div>
                </div>
                <p className="mb-7 max-w-xl leading-7 text-slate-600">
                  {isCoachingPayment
                    ? "Thank you for investing in one-on-one coaching. Book your consultation session below."
                    : "Thank you for enrolling. Continue to Telegram for the next steps to access your course package."}
                </p>
                {!isCoachingPayment && selectedCourseLink?.url ? (
                  <a
                    href={selectedCourseLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 items-center justify-center rounded bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Access your package on Telegram
                  </a>
                ) : !isCoachingPayment ? (
                  <p className="rounded border border-amber-200 bg-amber-50 p-4 leading-6 text-amber-900">
                    Your payment is confirmed, but the Telegram link for this
                    package has not been configured yet. Please contact support.
                  </p>
                ) : null}

                {isCoachingPayment ? (
                  <div className="mt-8 border-t border-slate-200 pt-7">
                    <h2 className="mb-3 text-xl font-bold text-slate-950">
                      Your one-on-one coaching is confirmed
                    </h2>
                    <p className="mb-5 max-w-xl leading-7 text-slate-600">
                      Book your consultation session with me on WhatsApp. We’ll
                      arrange your weekly calls for assistance when you need it.
                    </p>
                    <a
                      href={coachingContact.whatsappBookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-12 items-center justify-center rounded bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Book your consultation session
                    </a>
                  </div>
                ) : selectedCourseLink?.url ? (
                  <div className="mt-8 border-t border-slate-200 pt-7">
                    <h2 className="mb-3 text-xl font-bold text-slate-950">
                      Get one-on-one support
                    </h2>
                    <p className="mb-5 max-w-xl leading-7 text-slate-600">
                      Get one-on-one coaching with me, including weekly calls
                      for assistance when you need it.
                    </p>
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-5 sm:p-6">
                      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-bold text-slate-900">One-on-one coaching</h3>
                        <span className="text-xl font-extrabold text-slate-950">
                          {formatGhs(COACHING_PRICE_GHS)}
                        </span>
                      </div>
                      <form onSubmit={handleCoachingPayment}>
                        <label
                          htmlFor="coaching-email"
                          className="mb-2 block font-bold text-slate-900"
                        >
                          Email for your coaching payment
                        </label>
                        <input
                          id="coaching-email"
                          type="email"
                          autoComplete="email"
                          required
                          maxLength={254}
                          value={coachingEmail}
                          onChange={(event) => setCoachingEmail(event.target.value)}
                          placeholder="you@example.com"
                          className="mb-4 w-full rounded border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                        {coachingError && (
                          <p
                            className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                            role="alert"
                          >
                            {coachingError}
                          </p>
                        )}
                        <button
                          type="submit"
                          disabled={isStartingCoachingPayment}
                          className="inline-flex min-h-12 w-full items-center justify-center rounded bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                        >
                          {isStartingCoachingPayment
                            ? "Connecting to Paystack..."
                            : `Add coaching · ${formatGhs(COACHING_PRICE_GHS)}`}
                        </button>
                      </form>
                    </div>
                  </div>
                ) : null}
              </>
            )}

            {(verificationState === "missing" || verificationState === "unconfirmed") && (
              <>
                <p className="max-w-2xl leading-7 text-slate-600">
                  {verificationState === "missing"
                    ? "We did not receive a Paystack payment reference. Please complete payment using the checkout page."
                    : verification.reason === "amount_mismatch"
                      ? "The payment amount does not match one of the available course order totals. Please contact us with your payment reference."
                      : verification.reason === "currency_mismatch"
                        ? "Paystack reports a different currency from the required GHS. Please contact us with your payment reference."
                        : verification.reason === "reference_mismatch"
                          ? "The payment reference did not match the transaction Paystack returned. Please try again or contact us with your payment reference."
                          : "Paystack has not confirmed a successful payment for this transaction. If you just paid, wait a moment and try again."}
                </p>
                {verificationState === "unconfirmed" && (
                  <button
                    type="button"
                    onClick={() => setRetry((count) => count + 1)}
                    className="mt-6 inline-flex min-h-12 items-center justify-center rounded border border-blue-700 px-6 py-3 font-bold text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Check payment again
                  </button>
                )}
              </>
            )}

            {verificationState === "error" && (
              <>
                <p className="max-w-2xl leading-7 text-slate-600">
                  The payment service could not be reached. Your course access
                  has not been shown. Please try again in a moment.
                </p>
                <button
                  type="button"
                  onClick={() => setRetry((count) => count + 1)}
                  className="mt-6 inline-flex min-h-12 items-center justify-center rounded border border-blue-700 px-6 py-3 font-bold text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Retry verification
                </button>
              </>
            )}
          </div>

          <footer className="border-t border-slate-200 bg-slate-50 px-6 py-5 text-sm text-slate-600 sm:px-10">
            Need help? Return to the{" "}
            <Link className="font-semibold text-blue-700 underline underline-offset-4 hover:text-blue-800" to="/checkout">
              course page
            </Link>
            .
          </footer>
        </section>
      </div>
    </main>
  );
}
