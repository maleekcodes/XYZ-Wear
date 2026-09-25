# XYZ digital fashion build checklist

Each item is one build slice. Work in order; keep the current still-image purchase path functional between slices.

## Gate 0: Inputs

- [x] Identify CyberX as the Digital Form jacket, inspect its current source image, view the four reference clips, and inventory all 31 available Physical Form images across 13 variants. **Result:** `docs/physical-form-3d-inventory.json`; the site's raster XYZ logo is available, while vector artwork, patterns, dimensions, and editable 3D sources are not present in the repository.
- [ ] Record target output examples: animated jacket display and a personalised still photo with a chosen effect frame. **Accept:** visible XYZ, colour treatment, light paths, glow limits, and final image format are unambiguous. **Verify:** compare with the CEO references. **Depends:** input audit.

## Gate 1: Jacket effect package and motion proof

- [ ] Create a versioned, source-controlled jacket effect package with clean image, silhouette mask, logo, normalized anchors, seam paths, and palette/timing settings. **Accept:** clean FASHN input and effect artwork remain separate. **Verify:** render a fixed-time still at product and download resolutions. **Depends:** Gate 0.
- [x] Build the product-only browser animation for floating XYZ, iridescence, light trails, and subtle glow on the identified CyberX image. **Result:** listing and product page render; product page has a pause control and CSS reduced-motion mode. Desktop browser inspected; mobile and reduced-motion browser checks remain.
- [ ] Check the CyberX animation in a mobile browser and with reduced motion enabled. **Progress:** mobile viewport rendered; reduced-motion behavior and controls still need an interaction check.

## Gate 2: Personalisation feasibility

- [ ] Test the clean jacket in the existing FASHN try-on path. **Progress:** one public demo photo produced a recognisable CyberX try-on with full head and jacket text. **Accept:** inspect 10–20 varied photos; record failures and latency.
- [x] Build a first local still compositor with colour-based jacket location, exact vector XYZ marks, subtle edge traces, and a rejection path. **Result:** one public demo output inspected. **Next:** compare on the same 10–20 photos, including hands/hair crossing the jacket.
- [ ] Decide the mask implementation from measured quality and compute cost. **Accept:** documented pass rate, rejection behavior, deployment needs, and whether self-hosted segmentation is sufficient. **Verify:** repeat representative difficult cases. **Depends:** masking prototype.

## Gate 3: Digital Form media

- [ ] Extend Sanity schema, queries, and product types for poster/motion media and a separate clean try-on image. **Accept:** published product resolves both assets without confusing the FASHN input. **Verify:** CMS publish and product API check. **Depends:** motion proof.
- [x] Render the CyberX animation in the Digital Form listing and PDP with the original image as poster and a PDP pause control. **Result:** local desktop browser check passed. Mobile and reduced-motion checks remain before release.

## Gate 4: Final still and commerce

- [x] Compose the CyberX still after FASHN completion and reject a result when jacket location is unreliable. **Result:** bounded CPU composition in the status route, with `cyberx-v1` object metadata. A separate job is only needed if future segmentation requires slower compute.
- [ ] Verify signed preview and paid download on a configured MinIO and Stripe environment. **Code:** both use the same enhanced object key and checkout requires `cyberx-v1`; local credentials/storage were unavailable. **Accept:** test preview watermark, payment gate, and purchased PNG.

## Gate 5: Physical garment 3D conversion queue

- [x] Inventory all repository Physical Form images. **Result:** 31 photos, 13 variants, 7 products, missing views and conversion status recorded in `docs/physical-form-3d-inventory.json`. Regenerate with `node scripts/build-physical-3d-inventory.mjs`.
- [ ] Reconstruct every listed variant in CLO from patterns or measurements and photos. **Accept:** editable CLO project, GLB, clean front/back renders, and documented comparison with the physical item for each. **Verify:** inspect silhouette, seams, logo, fabric, and fit. **Depends:** physical patterns or measurements and garment authoring software.
- [ ] If patterns are missing, compare Style3D image-to-garment on each item. **Accept:** trial access and output quality measured against physical garments. **Verify:** manual geometry, seam, logo, and editability review. **Depends:** activated software access and source items.
- [ ] Add the approved 2D render to Digital Form try-on and, only if useful, scope a separate GLB viewer. **Accept:** current photo flow uses a clean render and passes fidelity checks. **Verify:** product page and try-on sample. **Depends:** approved 3D asset.

## Later decisions

- [ ] Decide whether customers need an animated MP4 with a static person or actual person motion. **Accept:** approved example and target generation time/cost; separate storage/payment scope. **Depends:** approved still output.
- [ ] Decide whether live AR try-on is a business requirement. **Accept:** body-tracking/3D asset pilot and device-performance target. **Depends:** 3D pilot.
