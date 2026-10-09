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

The Vercel function at `/api/paystack-webhook` validates Paystack webhook signatures using the raw request body. In the Vercel project settings, set `PAYSTACK_SECRET_KEY` to the Paystack secret key (never expose it with a `VITE_` prefix), deploy, then set the Paystack webhook URL to `https://<your-domain>/api/paystack-webhook`.

Successful `charge.success` webhook events are signature-verified and acknowledged. The `/thank-you` page separately verifies the returned Paystack transaction reference using `/api/verify-payment`; only a successful transaction in GHS matching one of the valid course/add-on totals displays the Telegram button. This server-side verification uses the same `PAYSTACK_SECRET_KEY` and does not depend on webhook delivery timing.

Configure the Paystack callback URL to `https://<your-domain>/thank-you`. The Telegram invite itself is not protected by this site and may be shared; use a private/revocable invite or an account-based course system for stronger access control.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
