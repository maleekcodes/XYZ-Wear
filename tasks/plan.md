# XYZ Digital Form: in-house jacket effects and physical-to-3D plan

Status: implementation in progress, 24 September 2026. CyberX has a local animated display and a server-side still compositor after try-on. All 31 repository Physical Form photos are inventoried in `docs/physical-form-3d-inventory.json`. Paid storage of the enhanced file and reconstructed 3D garments remain unverified or unbuilt.

## Outcome and scope

Digital Form will contain two distinct product types:

1. **Digital-native pieces:** the XYZ jacket can have floating XYZ marks, iridescent colour, seam-following light trails, and controlled glow. The product page shows motion. A customer can upload a photo and receive a personalised **still image** with the approved XYZ effects.
2. **Digital versions of Physical Form clothing:** reconstruct selected real garments as editable 3D assets, then render clean 2D product images for the existing photo try-on flow. A GLB is an additional display asset; the present FASHN integration cannot consume it directly.

The first jacket target is CyberX (`cyberx-jacket`). The Physical Form conversion queue contains all 13 image variants across 7 products in the repository. A moving customer result and live camera/AR try-on are later decisions, with separate acceptance criteria and infrastructure.

## Current architecture and exact boundary

- `sanity/schemas/digitalFormPage.ts` stores an image gallery; its first image is used for try-on.
- `storefront/src/modules/digital/components/cyberx-visual.tsx` now layers timed SVG effects over the original CyberX photo in the listing and product gallery. This is a front-view browser animation; the try-on API still receives the original product image.
- `storefront/src/app/api/try-on/start/route.ts` submits a product image and customer image to FASHN `tryon-max`. For CyberX, `status/route.ts` now locates the distinctive jacket shell in the returned still, draws exact vector XYZ marks and subtle colour/edge effects, then stores that final PNG in MinIO. The preview route renders a watermarked JPEG from the stored file; checkout requires the CyberX effect version in object metadata, and the download route still checks a paid Stripe Checkout session.
- FASHN documents `tryon-max` as image input and PNG/JPEG output. Its separate Image to Video endpoint is experimental, so an existing animated jacket video cannot simply become the customer result. [FASHN Try-On Max](https://docs.fashn.ai/api-reference/tryon-max) · [FASHN Image to Video](https://docs.fashn.ai/api-reference/image-to-video)

## Build architecture

### 1. Versioned jacket effect package

The first CyberX effect package uses the existing Sanity front image, the site's `xyz-london-logo.png` brand mask, an image-specific SVG motion layer, and a `cyberx-v1` still effect version. The original image remains the FASHN product input. A vector logo source and true 3D jacket do not yet exist in the repository.

Implement a reusable effect renderer for the product display:

- **Floating XYZ:** layered SVG marks with controlled position, depth, opacity, and slow motion.
- **Iridescence:** animated colour/light layer clipped to the jacket silhouette. This creates a front-view presentation; physically correct colour shifts during 3D rotation would require a 3D jacket material and shader.
- **Light traces:** SVG paths aligned to approved seams, animated with stroke progress and glow.
- **Subtle glow:** limited to selected highlights and kept behind readable garment details.

The renderer should have a stable poster frame and respect reduced-motion preference. Make the same effect parameters renderable at a fixed time into a high-resolution still. This gives the customer photo a deliberate snapshot of the animated look instead of implying motion in a PNG.

### 2. Product media on Digital Form

Extend the Sanity digital product schema and query/type mapping with a motion preview and poster, while retaining a separate clean try-on image. Use the effect renderer in the listing and PDP; fall back to the poster if animation is unavailable. Preserve the current image proportions and verify mobile, desktop, keyboard controls, and reduced-motion behavior. Do not send a video URL or GLB to the FASHN `product_image` field.

### 3. Personalised photo pipeline

The implemented CyberX sequence is: **clean jacket image → existing FASHN try-on → colour-based jacket location → deterministic still composition → private final PNG → signed preview → paid download**. The exact XYZ lettering is drawn locally; the animated product display is represented by a fixed still frame in the customer photo. The compositor rejects an image when its jacket location checks fail instead of offering an unenhanced CyberX file for purchase.

The current locator uses the unusually cyan/violet CyberX shell in the FASHN output. It passed one public demo model photo. It is narrower than general garment segmentation, and must be checked across varied real photos before release. MediaPipe pose landmarks and Meta SAM 2 remain fallback candidates if this colour locator fails on enough cases. [MediaPipe Pose Landmarker](https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js) · [SAM 2](https://github.com/facebookresearch/sam2/blob/main/README.md)

The current still layer follows detected jacket edges and places two floating XYZ marks near the shoulders. It does not infer hand or hair occlusion. Test occluded poses; if marks or trails cross a hand, hair, or face, improve masking or reject those results. Do not claim reliable personalised output from the one demo case alone.

The current `sharp` composition is a bounded CPU step in the status request; there is no GPU model or second provider call. The final PNG and effect version are stored under the existing try-on key, so preview and paid download use the same asset. This storage path still needs a configured MinIO and Stripe test transaction. If the locator requires a GPU model later, move that work to a separate job. Reject a result when the jacket location, logo, face, head framing, or garment fidelity fails validation.

### 4. Physical Form to 3D

Inventory and process **every available Physical Form image variant**. The repository has 31 photos grouped into 13 variants; `node scripts/build-physical-3d-inventory.mjs` regenerates the queue. Use **CLO 3D** for faithful garment reconstruction once the necessary patterns or measurements, front/back/side photographs, fabric and trim details, and logo artwork are available. Import DXF patterns when available; recreate missing patterns in CLO, simulate the garment, tune fabric and fit, then export the editable CLO project, a web GLB, and clean front/back renders. Compare the renders against the real item before adding it to Digital Form. CLO supports DXF pattern import and GLB export. [CLO DXF import](https://support.clo3d.com/hc/en-us/articles/115012380628-Import-DXF) · [CLO GLB export](https://support.clo3d.com/hc/en-us/articles/360051525034-glTF-2-0-GLTF-GLB-File)

If only photos exist, test Style3D Studio's image-to-garment feature on the *same* pilot garment. It can generate patterns and a 3D garment from a front-view image, but access requires activation and its output must be checked against the physical item. Choose the workflow using fidelity and editing effort, not just generation speed. [Style3D AI Garment](https://help.style3d.com/studio/en/c4905/c2c8/7cd2/b61b)

Building the 3D asset requires garment construction work and suitable software; code alone cannot infer accurate hidden seams, measurements, or fabric behaviour from one photo. The existing FASHN route will still use a clean 2D render from the 3D asset.

## Delivery order and acceptance gates

| Gate | Work | Pass condition |
| --- | --- | --- |
| 0. Input audit | Identify the exact jacket, logo source, physical pilot garment, available patterns, and rights; inspect the CEO's four original videos | Assets and visual references are identified; no invented jacket details |
| 1. Local motion proof | Build the jacket effect package and product-only motion prototype | All four effects are visible, XYZ remains legible, garment details remain clear, reduced-motion poster works |
| 2. Try-on feasibility | Run the clean image through FASHN and test masking/composition on 10–20 varied photos | Full head/identity, jacket construction, XYZ lettering, mask edges, and occlusion pass manual review; record failure rate and processing time |
| 3. Website media | Add Sanity fields and responsive listing/PDP presentation | Product motion works on target devices while try-on still sends the clean image |
| 4. Final image delivery | Add post-try-on job, final asset storage, preview, and checkout/download wiring | Preview and paid file show the same approved effect version; unpaid access remains blocked server-side |
| 5. Physical-to-3D queue | Reconstruct and compare all 13 available Physical Form variants | For each variant, an editable project, GLB, and renders match silhouette, seams, branding, and fabric closely enough for approval |

## Optional later phases and provider decisions

- **Personalised animated output:** first render our deterministic logo/light/colour effects over the approved *still* customer photo and export MP4. The person remains still; this can preserve XYZ artwork more reliably than generative video. It requires a video renderer, queue/worker, MP4 storage, preview, entitlement, and a separate performance budget. If the person must move, test FASHN Image to Video only after checking branding and consistency on several inputs; it is experimental and motion control is limited. [FASHN Image to Video](https://docs.fashn.ai/api-reference/image-to-video)
- **Live camera/AR try-on:** separate project requiring a fitted 3D garment, body tracking, occlusion, mobile performance, and camera permissions. Snap documents clothing try-on and Web Camera Kit, but this is not a drop-in replacement for our photo flow. [Snap clothing try-on](https://www.developers.snap.com/lens-studio/features/try-on/clothing-try-on) · [Camera Kit Web](https://developers.snap.com/camera-kit/integrate-sdk/web/guides/camera-kit-web-for-beginners)
- **Segmentation infrastructure:** a self-hosted SAM 2 worker likely needs separate compute and operational work. If its quality or cost fails Gate 2, assess a garment-specific service; do not select or buy one before the pilot establishes the gap.

## Verification boundary

The four supplied WhatsApp videos were viewed in the browser as visual references. The CyberX image, local desktop/mobile browser display, and one public demo try-on with the composed still were inspected. A trial generative edit pass misspelled a floating mark, so it was not wired into customer output. MinIO and Stripe were not configured locally, so a persisted preview, checkout, and paid download were not exercised. No 3D geometry has been generated; available photos alone do not establish hidden construction or fabric behaviour.
