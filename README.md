# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Paystack webhook

The `/upsell` page offers the GHS 360 masterclass, the Importer's Blueprint Book for GHS 40, and the Supplier Communication Guide for GHS 20. It collects the buyer's email and posts selected add-on IDs to `/api/initialize-payment`. The server calculates the total in pesewas, initializes a Paystack transaction, and redirects the customer to Paystack. Use a test secret key in Vercel Preview/development and a live secret key in Production; do not put either key in the frontend. The old static links are kept in `src/data/paystack-links.json` for reference, but dynamic checkout uses the secret key's test/live mode.

After course payment, the thank-you page also offers optional one-on-one coaching for GHS 950 with weekly assistance calls. The coaching transaction is initialized through Paystack using the configured `PAYSTACK_SECRET_KEY`. After successful payment, the page offers a WhatsApp booking button; replace the dummy URL in `src/data/coaching-contact.json` with the correct WhatsApp link.

The Vercel function at `/api/paystack-webhook` validates Paystack webhook signatures using the raw request body. In the Vercel project settings, set `PAYSTACK_SECRET_KEY` to the Paystack secret key (never expose it with a `VITE_` prefix), deploy, then set the Paystack webhook URL to `https://<your-domain>/api/paystack-webhook`.

Successful `charge.success` webhook events are signature-verified and acknowledged. The `/thank-you` page separately verifies the returned Paystack transaction reference using `/api/verify-payment`; a successful course payment is recorded in Redis and displays instructions and a link to the LMS before the coaching offer. This server-side verification uses the same `PAYSTACK_SECRET_KEY` and does not depend on webhook delivery timing.

Configure the Paystack callback URL to `https://<your-domain>/thank-you`.

## Meta checkout funnel

Configure `PIXEL_ID` for the browser Pixel.

The browser Pixel tracks `PageView` and `ViewContent` on the course checkout page, `AddToCart` on its enrollment buttons, `InitiateCheckout` when the order checkout opens, and `Lead` after Paystack successfully initializes a transaction. After Paystack confirms payment, the thank-you page tracks `AddPaymentInfo` and `Purchase`. Since Paystack hosts the payment-method screen, `AddPaymentInfo` is tracked after successful payment confirmation when the browser can verify the completed payment. No Conversions API access token or server-side Meta events are used.

## LMS purchaser access

The LMS login checks the checkout email against course purchases recorded by the verified Paystack webhook and `/api/verify-payment`. Purchases are stored server-side in Upstash Redis, keyed by a SHA-256 hash of the normalized email; each record includes the purchased package, add-on IDs, included items, amount, currency, and Paystack reference. The LMS displays the buyer's package and included items after sign-in. Webhook and payment-verification writes are idempotent by payment reference.

Create an Upstash Redis database and configure these Vercel environment variables for Preview and Production:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `LMS_SHARED_PASSWORD` — the shared password used by purchasers to sign in. The verified thank-you page retrieves it from the server and displays it only after a successful course payment. Access is additionally restricted by the purchaser email check.
- `LMS_SESSION_SECRET` — a unique random secret of at least 32 characters, used to sign sessions.

The login API allows up to 10 attempts per IP address in a 15-minute window. After login, the server issues a signed, `HttpOnly`, `Secure`, `SameSite=Lax` cookie for seven days and checks the purchaser record on session validation. The browser does not store the password or authentication token in local storage. Deploy the Vercel functions after configuring the variables.

Optional add-on download URLs are stored in the Upstash Redis hash `lms:course:addon-downloads`. Set the `importers-blueprint` field to the HTTPS download URL for the Importer's Blueprint Book, and the `supplier-communication` field to the HTTPS download URL for the Supplier Communication Guide. The authenticated LMS shows a download action only for add-ons included in the purchaser's package. Add-ons they did not buy are crossed out and link to the upsell page with that item selected. If a purchased add-on has no URL configured yet, the LMS displays “Download unavailable.”

Purchases made before purchaser recording was enabled are not automatically imported into Redis. Those buyers will need their payment verified and recorded or be added through a controlled server-side backfill before LMS login will accept them. The LMS login gates the application UI, but frontend lesson data is still delivered as part of the public JavaScript bundle and Wistia media must be separately restricted if it should not be publicly accessible.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
