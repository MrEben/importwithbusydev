import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { readApiResponse } from "../utils/readApiResponse.js";
import { COACHING_PRICE_GHS, COURSE_PACKAGES } from "../data/course-offers.js";
import coachingContact from "../data/coaching-contact.json";
import { addPaymentInfo, purchase } from "../utils/metaPixel.js";
import MetaPixel from "../components/MetaPixel.jsx";

const LMS_URL = "https://importwithbusydev.vercel.app/lms";

const formatGhs = (amount) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount);

export default function ThankYouPage() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const trackedPurchaseReferences = useRef(new Set());
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [verification, setVerification] = useState({
    reference: null,
    retry: -1,
    state: "checking",
    reason: null,
    packageId: null,
    coursePassword: null,
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
          coursePassword: result.coursePassword,
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
            coursePassword: null,
          });
        }
      });

    return () => controller.abort();
  }, [reference, retry]);
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

  useEffect(() => {
    if (!isConfirmed || !reference || trackedPurchaseReferences.current.has(reference)) {
      return;
    }

    const coursePackage = COURSE_PACKAGES.find(
      (candidate) => candidate.id === verification.packageId,
    );
    const product = isCoachingPayment
      ? {
          id: "one-on-one-coaching",
          name: "One-on-one coaching",
          price: COACHING_PRICE_GHS,
        }
      : coursePackage
        ? {
            id: "complete-importation-masterclass",
            name: "The Complete Importation Masterclass",
            price: coursePackage.amountPesewas / 100,
          }
        : null;

    if (!product) {
      console.error("Could not determine the verified Meta Purchase product", {
        packageId: verification.packageId,
        reference,
      });
      return;
    }

    addPaymentInfo(product);
    purchase(product);
    trackedPurchaseReferences.current.add(reference);
  }, [isConfirmed, isCoachingPayment, reference, verification.packageId]);

  async function copyCoursePassword() {
    setCopyError("");
    if (typeof verification.coursePassword !== "string" || !verification.coursePassword) {
      setCopyError("The course password is not configured yet. Please contact support.");
      return;
    }

    try {
      await navigator.clipboard.writeText(verification.coursePassword);
      setPasswordCopied(true);
      window.setTimeout(() => setPasswordCopied(false), 2000);
    } catch (error) {
      console.error("Unable to copy the LMS password", error);
      setCopyError("Copy failed. Please select and copy the password above.");
    }
  }

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
      <MetaPixel />
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
          <div className="border-b border-slate-200 bg-slate-950 px-6 py-7 text-white sm:px-10 sm:py-9">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-400">
              Import with BusyDev
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {heading}
            </h1>
            {isConfirmed && !isCoachingPayment && (
              <p className="mt-4 text-xl font-extrabold leading-snug sm:text-2xl">
                But I have{" "}
                <span className="text-amber-400">something extra</span> for you.
              </p>
            )}
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
                      {isCoachingPayment
                        ? "One-on-one coaching"
                        : "Your course package"}
                    </p>
                  </div>
                </div>
                <p className="mb-7 max-w-xl leading-7 text-slate-600">
                  {isCoachingPayment
                    ? "Thank you for investing in one-on-one coaching. Book your consultation session below."
                    : "Congratulations, and thank you for enrolling! Your course login details are displayed right here on this page. Sign in to the Import with BusyDev Learning Management System (LMS) with the email you used at checkout and the password below. We will not send your login details by email."}
                </p>
                {!isCoachingPayment && (
                  <div className="max-w-xl rounded-md border border-blue-200 bg-blue-50 p-5 sm:p-6">
                    <h2 className="text-lg font-bold text-slate-950">
                      Access your course in the LMS
                    </h2>
                    <p className="mt-2 leading-7 text-slate-700">
                      Go to the LMS and sign in using your purchase email and
                      the course password below. Keep this password for future
                      sign-ins.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <code className="rounded border border-blue-200 bg-white px-3 py-2 font-mono font-bold text-slate-900">
                        {verification.coursePassword || "Contact support for your password"}
                      </code>
                      {verification.coursePassword && (
                        <button
                          type="button"
                          onClick={copyCoursePassword}
                          aria-label="Copy course password"
                          className="inline-flex min-h-10 items-center gap-2 rounded border border-blue-700 px-3 py-2 text-sm font-bold text-blue-800 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <svg
                            aria-hidden="true"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <rect
                              x="7"
                              y="6"
                              width="9"
                              height="11"
                              rx="1.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M13 6V4.5A1.5 1.5 0 0 0 11.5 3h-7A1.5 1.5 0 0 0 3 4.5v9A1.5 1.5 0 0 0 4.5 15H7"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                          </svg>
                          {passwordCopied ? "Copied" : "Copy password"}
                        </button>
                      )}
                    </div>
                    {copyError && (
                      <p className="mt-3 text-sm text-red-700" role="alert">
                        {copyError}
                      </p>
                    )}
                    <a
                      href={LMS_URL}
                      className="mt-5 inline-flex min-h-12 items-center justify-center rounded bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Go to the LMS
                    </a>
                  </div>
                )}

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
                ) : isConfirmed && !isCoachingPayment ? (
                  <div className="mt-8 border-t border-slate-200 pt-7">
                    <p className="mb-2 text-center text-sm font-bold italic text-amber-700">
                      Introducing...
                    </p>
                    <h2 className="mb-3 text-center text-2xl font-extrabold text-slate-950 sm:text-3xl">
                      One-on-one coaching
                    </h2>
                    <p className="mx-auto mb-5 max-w-xl text-center leading-7 text-slate-600">
                      Get direct one-on-one guidance from me, with weekly calls
                      and support when you need help putting the course into action.
                    </p>
                    <div className="rounded-md border border-amber-300 bg-amber-50 p-5 sm:p-6">
                      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-bold text-slate-900">One-on-one coaching</h3>
                        <span className="text-xl font-extrabold text-amber-800">
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
                          className="inline-flex min-h-12 w-full items-center justify-center rounded bg-slate-950 px-6 py-3 font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                        >
                          {isStartingCoachingPayment
                            ? "Connecting to Paystack..."
                            : `Get one-on-one coaching · ${formatGhs(COACHING_PRICE_GHS)}`}
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
