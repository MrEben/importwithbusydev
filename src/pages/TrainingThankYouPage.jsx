import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { readApiResponse } from "../utils/readApiResponse.js";

const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/Kfdh6Yy422y0eR5vaLji4k";

export default function TrainingThankYouPage() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const [retry, setRetry] = useState(0);
  const [verification, setVerification] = useState({
    reference: null,
    retry: -1,
    state: reference ? "checking" : "missing",
  });
  const verificationState =
    verification.reference === reference && verification.retry === retry
      ? verification.state
      : reference
        ? "checking"
        : "missing";

  useEffect(() => {
    if (!reference) return undefined;

    const controller = new AbortController();

    fetch(`/api/verify-training-payment?reference=${encodeURIComponent(reference)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await readApiResponse(response, "Training payment verification");
        if (!response.ok) {
          throw new Error(result.message || "Payment verification failed");
        }

        setVerification({
          reference,
          retry,
          state: result.verified ? "confirmed" : "unconfirmed",
        });
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Unable to verify training payment", error);
          setVerification({ reference, retry, state: "error" });
        }
      });

    return () => controller.abort();
  }, [reference, retry]);

  const isConfirmed = verificationState === "confirmed";
  const isChecking = verificationState === "checking";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-950">
      <section
        aria-live="polite"
        className="w-full max-w-lg rounded-lg bg-white p-8 text-center shadow-lg sm:p-10"
      >
        {isChecking ? (
          <>
            <div
              className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-orange-600"
              aria-hidden="true"
            />
            <h1 className="text-2xl font-bold">Confirming your payment</h1>
            <p className="mt-3 text-slate-600">Please wait while we verify your payment with Paystack.</p>
          </>
        ) : isConfirmed ? (
          <>
            <div
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-700"
              aria-hidden="true"
            >
              ✓
            </div>
            <h1 className="text-3xl font-bold">Thank you for registering!</h1>
            <p className="mt-3 text-slate-600">Your payment is confirmed. Join the WhatsApp community for your training.</p>
            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-md bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Join the WhatsApp Community
            </a>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">
              {verificationState === "missing" ? "Payment reference not found" : "Payment not confirmed"}
            </h1>
            <p className="mt-3 text-slate-600">
              {verificationState === "missing"
                ? "We couldn’t find a Paystack payment reference in the return link."
                : verificationState === "error"
                  ? "We couldn’t verify your payment right now. Please try again."
                  : "Paystack has not confirmed a successful GHS 20 training payment yet. If you have just paid, wait a moment and try again."}
            </p>
            {reference && (
              <button
                type="button"
                onClick={() => setRetry((currentRetry) => currentRetry + 1)}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-orange-600 px-5 py-2 font-semibold text-white transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                Check payment again
              </button>
            )}
            <Link to="/" className="mt-6 block text-sm font-semibold text-blue-700 underline">
              Return to the training page
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
