# Timeglass — starter scaffold

A no-build, single-file web app: point your phone at a tagged spot, see the
historical photo cross-fade over the live camera feed, filtered by era.

## Run it right now

Camera, geolocation, and device orientation all require HTTPS on mobile
(localhost is fine for looks, but a phone browser will block them on plain
http:// over your LAN). Fastest path to a testable link:

```bash
# from inside history-ar/
npx serve .
```
then either open it on your laptop (permissions work over localhost), or for
testing on your actual phone, tunnel it:
```bash
npx ngrok http 3000
```
Open the ngrok https:// link on your phone. This is the fastest way to test
outdoors without deploying anywhere yet.

For the real submission, push this folder to GitHub and enable GitHub Pages,
or deploy to Vercel/Netlify (both give you https:// for free, no config).

## Tagging your own points (replace points.json)

Each entry needs:
- `lat` / `lon` — where you stand to see the match (not necessarily where the
  historical photo was taken from, though ideally the same spot).
- `heading` — compass direction (0 = north, 90 = east, etc.) you should be
  *facing* to see the match. If you don't know it precisely, stand at the
  spot, note roughly which way you're facing in the old photo, and refine
  after a field test.
- `year` — used to group points into era buttons. Reuse the same `lat`/`lon`
  across years if you have multiple photos of the same spot at different
  times (see the two sample-01 entries).
- `photoUrl` — a direct image URL. For a hackathon demo you can host these in
  a `/photos` folder alongside index.html and reference them relatively
  (e.g. `"photos/mg-road-1960.jpg"`) instead of an external URL.
- `caption` — credit the source. Most archives require attribution; check
  each source's reuse terms before using it in anything beyond a demo.

## Tuning match sensitivity

Two constants at the top of the `<script>` in index.html:
- `MATCH_RADIUS_M` — how close (in meters) you need to be. GPS accuracy on
  phones is often 5-20m outdoors, worse near tall buildings — don't set this
  too tight or nothing will ever trigger.
- `HEADING_CONE_DEG` — how far off your compass heading can be and still
  count. Phone compasses drift and need calibration (the figure-8 wave
  gesture); expect to loosen this during field testing, not tighten it.

## Known rough edges to expect

- iOS Safari requires the orientation permission prompt to fire from a
  direct tap (already handled by the Begin button) — don't refactor that
  into an automatic call or it'll silently fail.
- Android compass heading (`alpha`) is device-dependent; some phones report
  it inverted or drifting. If matches feel systematically off by roughly
  90/180 degrees, that's the usual culprit — adjust the heading values in
  your data rather than the code.
- Test outdoors, not at a desk — GPS and magnetometer both behave
  differently indoors.

## Stretch goal: agent-assisted tagging

If you have time left, the slowest manual step (finding lat/lon + rough
heading for each archival photo) is a good candidate to hand to an LLM
agent: feed it a raw caption/description from an archive listing, have it
extract or infer a place name, geocode that name, and flag low-confidence
guesses for you to verify by hand rather than trusting them blindly. That
turns the tagging bottleneck into a review step instead of a data-entry
step, and it's a genuine technical differentiator for a hackathon judge
versus a purely manual pipeline.
