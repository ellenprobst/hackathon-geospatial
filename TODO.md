# TODO

Follow-ups after folding in the design refresh. None are blockers for the demo, but worth a pass before stage time.

## Worth eyeballing

- [ ] **Watermark / coords positioning.** The design CSS pins both elements relative to a fixed 340px right column (`right: 340px` baseline, `right: 20px` when `.no-right`). If panel widths change or we want the positioning to react to side-panel state more dynamically, this needs revisiting.
- [ ] **Address autocomplete in subscribe flow.** Depends on `photon.komoot.io` being reachable from the demo network. Falls back to a hash-derived Toronto pin if the user blurs the field without picking a result. Test on the demo wifi before the day of.
- [ ] **localStorage key.** Key changed from `beacon_locations` to `the6watch_locations`. Old data is orphaned. Clear DevTools > Application > Local Storage on demo machines if you want a clean slate.
