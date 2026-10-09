import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { readApiResponse } from "../utils/readApiResponse.js";

const TELEGRAM_COURSE_URL = "https://t.me/your_course_channel";

export default function ThankYouPage() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const [verification, setVerification] = useState({
    reference: null,
    retry: -1,
    state: "checking",
    reason: null,
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
        });
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Unable to verify payment", error);
          setVerification({ reference, retry, state: "error", reason: null });
        }
      });

    return () => controller.abort();
  }, [reference, retry]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-16 text-slate-100">
      <section className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-purple-950/30 sm:p-12">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-purple-300">
          Import with BusyDev
        </p>

        {verificationState === "checking" && (
          <>
            <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Verifying your payment</h1>
            <p className="mx-auto max-w-md leading-7 text-slate-300">
              Please wait while we confirm your payment securely with Paystack.
            </p>
          </>
        )}

        {verificationState === "confirmed" && (
          <>
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/15 text-3xl text-emerald-300"
              aria-hidden="true"
            >
              ✓
            </div>
            <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Congratulations!
            </h1>
            <p className="mx-auto mb-8 max-w-md leading-7 text-slate-300">
              Your payment is confirmed. Continue to Telegram for the next steps
              to access the Complete Importation Masterclass.
            </p>
            <a
              href={TELEGRAM_COURSE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-purple-600 px-7 py-3 font-semibold text-white transition hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Access the course on Telegram
            </a>
          </>
        )}

        {(verificationState === "missing" || verificationState === "unconfirmed") && (
          <>
            <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Payment not confirmed</h1>
            <p className="mx-auto max-w-md leading-7 text-slate-300">
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
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-lg border border-purple-400 px-7 py-3 font-semibold text-purple-200 transition hover:bg-purple-400/10 focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                Check payment again
              </button>
            )}
          </>
        )}

        {verificationState === "error" && (
          <>
            <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl">We couldn’t verify your payment</h1>
            <p className="mx-auto max-w-md leading-7 text-slate-300">
              The payment service could not be reached. Your course access has
              not been shown. Please try again in a moment.
            </p>
            <button
              type="button"
              onClick={() => setRetry((count) => count + 1)}
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-lg border border-purple-400 px-7 py-3 font-semibold text-purple-200 transition hover:bg-purple-400/10 focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              Retry verification
            </button>
          </>
        )}

        <p className="mt-6 text-sm text-slate-400">
          Need help? Return to the{" "}
          <Link className="text-purple-300 underline underline-offset-4 hover:text-purple-200" to="/checkout">
            course page
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
