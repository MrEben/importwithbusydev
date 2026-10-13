# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Paystack webhook

The `/upsell` page offers the GHS 420 masterclass and optional add-ons for GHS 30 and GHS 20. It collects the buyer's email and posts selected add-on IDs to `/api/initialize-payment`. The server calculates the total in pesewas, initializes a Paystack transaction, and redirects the customer to Paystack. Use a test secret key in Vercel Preview/development and a live secret key in Production; do not put either key in the frontend. The old static links are kept in `src/data/paystack-links.json` for reference, but dynamic checkout uses the secret key's test/live mode.

The verified package ID selects the matching Telegram destination in `src/data/telegram-course-links.json`. Replace all four `t.me/replace_...` placeholder URLs with the correct private invite links before publishing.

After course payment, the thank-you page also offers optional one-on-one coaching for GHS 950 with weekly assistance calls. The coaching transaction is initialized through Paystack using the configured `PAYSTACK_SECRET_KEY`. After successful payment, the page offers a WhatsApp booking button; replace the dummy URL in `src/data/coaching-contact.json` with the correct WhatsApp link.

The Vercel function at `/api/paystack-webhook` validates Paystack webhook signatures using the raw request body. In the Vercel project settings, set `PAYSTACK_SECRET_KEY` to the Paystack secret key (never expose it with a `VITE_` prefix), deploy, then set the Paystack webhook URL to `https://<your-domain>/api/paystack-webhook`.

Successful `charge.success` webhook events are signature-verified and acknowledged. The `/thank-you` page separately verifies the returned Paystack transaction reference using `/api/verify-payment`; only a successful transaction in GHS matching one of the valid course/add-on totals displays the Telegram button. This server-side verification uses the same `PAYSTACK_SECRET_KEY` and does not depend on webhook delivery timing.

Configure the Paystack callback URL to `https://<your-domain>/thank-you`. The Telegram invite itself is not protected by this site and may be shared; use a private/revocable invite or an account-based course system for stronger access control.

## LMS purchaser access

The LMS login checks the checkout email against course purchases recorded by the verified Paystack webhook and `/api/verify-payment`. Purchases are stored server-side in Upstash Redis, keyed by a SHA-256 hash of the normalized email; each record includes the purchased package, included items, amount, currency, and Paystack reference. Webhook and payment-verification writes are idempotent by payment reference.

Create an Upstash Redis database and configure these Vercel environment variables for Preview and Production:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `LMS_SHARED_PASSWORD` — the shared course password; set it only as a server environment variable.
- `LMS_SESSION_SECRET` — a unique random secret of at least 32 characters, used to sign sessions.

The login API allows up to 10 attempts per IP address in a 15-minute window. After login, the server issues a signed, `HttpOnly`, `Secure`, `SameSite=Lax` cookie for seven days and checks the purchaser record on session validation. The browser does not store the password or authentication token in local storage. Deploy the Vercel functions after configuring the variables.

Purchases made before purchaser recording was enabled are not automatically imported into Redis. Those buyers will need their payment verified and recorded or be added through a controlled server-side backfill before LMS login will accept them. The LMS login gates the application UI, but frontend lesson data is still delivered as part of the public JavaScript bundle and Wistia media must be separately restricted if it should not be publicly accessible.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
