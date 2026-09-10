# XYZ Wear functionality review

Reviewed 10 September 2026 against HANDOVER.md, repository source, and public production responses. Live configuration and billing dashboards were not available. The local display change below is not deployed.

## Where the features are

| Request | Current implementation | Where to manage it / remaining work |
| --- | --- | --- |
| Coming Soon | Physical category labels and Digital product flags exist. | Medusa Admin → Categories → category → Storefront settings → Coming soon. Sanity Studio → Digital Form Page → digitalProducts → product → coming-soon field. |
| Product waitlist | No product subscription form, persistence, or launch notification sender found. | Requires implementation. The OOO private-list form is a separate feature. |
| Pre-order after production | No production-completion transition found. Physical listing cards display “Pre-Order” when a price is missing. This is not a pre-order workflow. | Define an explicit release state, payment timing, delivery expectations, and stock handling before implementation. Do not remove a price to enable pre-orders. |
| “50 left in stock” | Inventory is managed by Medusa, but this stock-count display is absent. | Admin → Inventory / product variants. A displayed count should reflect the selected size/colour and available sellable stock. |
| Sold out | Product actions show “Out of stock” and disable purchasing for an inventory-managed, non-backorder variant with no stock. | Exact “Sold out” branding and listing-card state still need work. |
| Notify me / restock alerts | No product/variant restock subscription or stock-triggered email sender found. | Requires persisted subscriptions, consent/unsubscribe handling, and reliable notification delivery on restock. |
| Restock label | Updating stock can make an eligible variant purchasable again. No “Restock” badge or historical restock state found. | Requires an explicit merchandising rule for when the badge appears and expires. |

Relevant source: `backend/src/admin/widgets/category-storefront-settings.tsx`, `storefront/src/modules/store/components/physical-product-card.tsx`, and `storefront/src/modules/products/components/product-actions/`.

## Digital Form display and purchase

Products are edited in **Sanity Studio → Digital Form Page → digitalProducts**, not the physical Medusa product list. A `medusaHandle` can enrich pricing but does not add digital purchases to the physical cart.

Existing path: `/gb/digital` → select a product → Choose photo → wait for the saved try-on result → Buy & download → Stripe → download. The `/gb` prefix is an example market; other configured countries work similarly. There is no digital basket in the existing implementation.

Public checks:

- `/gb/digital` returned HTTP 200.
- `/api/try-on/enabled` returned `{"enabled":true}`. This only confirms configuration detection, not successful generation, storage, or payment.
- The listing marked Shell Jacket B, Kinetics Sneaker, Kinetics Cap, and Kinetics hoodie as Coming Soon.
- `/gb/digital/kinetics-cap` rendered “Try-on coming soon for this piece.” The source disables try-on and purchase for this flag. Publish it as available only when its assets, price, and fulfilment are ready.
- `/gb/digital/cap-v1` rendered “No preview images in CMS” and “Add product images in CMS to enable try-on.” Upload the actual garment images in Sanity and publish before testing this product's try-on and purchase.
- Listing links with external marketplace URLs take priority over the internal digital product page. This can also route a customer away from the on-site flow.

Local correction: digital listing photographs now fill a responsive 3:4 portrait area, using the Physical Form card padding, minimum height, and gap scale instead of fixed 160 × 160 photographs. Digital styling and purchase behavior are preserved. Source: `storefront/src/modules/digital/components/digital-form-client.tsx`.

Validation: Tailwind CSS compilation and `git diff --check` passed. Whole-project TypeScript checking reports 18 diagnostics in existing checkout, data, and other modules; comparing the current source against the original component through the TypeScript compiler produced identical diagnostics with none added. No connected browser was available for visual verification. The local backend was not running; local Stripe, FASHN, and MinIO configuration is absent, so end-to-end payment testing was not performed. Existing E2E tests recreate a test database and assume starter products; they were not run against production.

## Physical checkout testing

Stripe must be configured on both the Medusa backend and storefront, using keys from the same account and mode. Enable its payment provider for the customer's region in Medusa Admin → Settings → Regions. The seeded manual provider is not a Stripe card form.

In a configured Stripe **test environment**, use `4242 4242 4242 4242`, a future expiry date, and any three-digit CVC. These details are not for live mode. [Stripe testing documentation](https://docs.stripe.com/testing).

The reported stuck checkout step was not supplied, so its specific failure is unconfirmed. Local Stripe configuration is empty; this does not establish the production configuration. Also review the handover's physical Stripe webhook-secret configuration gap before launch.

## DNS incident

Observed public records:

| Check | Result |
| --- | --- |
| Nameservers | `dns1.registrar-servers.com`, `dns2.registrar-servers.com` |
| Apex CNAME, confirmed authoritatively | `xyzwear.co → wc5uw6i7.up.railway.app` |
| Cloudflare resolver and Google DNS-over-HTTPS | Both resolved the Railway target to `69.46.46.74` during the check. This is an observation, not an IP to hardcode. |
| `www.xyzwear.co` | NXDOMAIN |
| HTTPS apex | HTTP 307 to `/dk`; `/gb/digital` returned 200. |

A plain CNAME at the zone apex alongside SOA/NS records is a DNS configuration defect and a plausible contributor to resolver differences. The affected ISP was not available for testing, so its outage cannot yet be attributed conclusively to this defect. Missing `www` independently prevents that hostname from loading.

Proposed repair, requiring access to the DNS and Railway accounts:

1. Export the current DNS records and confirm Railway's current custom-domain target and verification requirements.
2. Replace the plain apex CNAME with the DNS provider's ALIAS/ANAME or supported CNAME flattening, preserving MX, TXT, and other service records.
3. Register `www.xyzwear.co` on the storefront service in Railway, then add the exact DNS records Railway supplies and verify its certificate.
4. Recheck both authoritative nameservers, multiple recursive resolvers, apex/www HTTPS, and the affected ISP after caches expire.

No production DNS records were changed. [Railway root-domain requirements](https://docs.railway.com/integrations/api/manage-domains), [Namecheap CNAME guidance](https://www.namecheap.com/support/knowledgebase/article.aspx/9646/2237/how-to-create-a-cname-record-for-your-domain/?page=1).

## Medusa access and monthly fees

Medusa Admin exists at the backend hostname plus `/app`. Locally this is `http://localhost:9000/app`. The handover does not establish a production admin URL or confirm that the client's user invitation was completed. An existing administrator can invite a user under Settings → Users.

This project is documented as a Railway-hosted Medusa installation. Do not assume a Medusa Cloud subscription. Medusa's open-source framework can be self-hosted; hosting and connected services still have their own bills. The actual monthly charge must be checked in the owner's Railway and service billing dashboards. Optional Medusa Cloud currently advertises plans starting at $29/month; this is not a quote for XYZ Wear. [Medusa installation](https://docs.medusajs.com/learn/installation), [Medusa pricing](https://medusajs.com/pricing).

## Instagram and TikTok

A website link in a profile sends shoppers to the website. A native social shop requires platform onboarding and a product catalog; sharing the URL alone does not create it.

- Instagram: use Meta Commerce Manager, connect the business Instagram account and relevant business assets, add a catalog, and complete the available shop/commerce eligibility flow. Availability depends on the business's country and account. [Meta training](https://www.facebookblueprint.com/student/path/251888-beyond-brick-and-mortar-open-your-shop-on-instagram).
- TikTok: register with the Seller Center for the business's eligible market, complete verification, list eligible physical products, configure fulfilment, and link the brand account. [TikTok UK seller setup](https://seller.tiktok.com/uk).

No Medusa-to-Meta/TikTok catalog or order integration was found. Manual listings need stock reconciliation; automatic product, inventory, and order synchronisation needs an integration. Confirm the registered business country before selecting a market-specific onboarding path.

## XYZ Look admin and Android coins

No XYZ Look admin application, Android application, coin wallet, or in-app billing fulfilment implementation was found in this repository. These requests need the relevant repository/deployment location and existing server access. The coin incident also needs the app/package name, affected account reference, transaction/order reference, and purchase time to trace payment verification and coin crediting. Do not infer a successful coin credit from a payment success screen, or ask the customer to purchase again as a diagnostic step.
