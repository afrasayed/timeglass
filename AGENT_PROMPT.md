# Agent task: run and extend the Timeglass historical-AR prototype

## Context

You're picking up an existing project called **Timeglass** — a no-build,
single-page web app. A user stands near a tagged real-world location, and
if their GPS position and phone compass heading match a tagged point, the
app cross-fades a historical photo of that spot over the live camera feed.
An era selector (row of year buttons) lets them switch between time periods
for the same location.

Stack: plain HTML/CSS/JS, no framework, no backend, no build step. Uses
browser APIs only: `getUserMedia` (camera), `navigator.geolocation`
(GPS), and `DeviceOrientationEvent` (compass heading).

The project already contains:
- `index.html` — the entire app (camera feed, GPS watch, compass listener,
  point-matching logic, era buttons, cross-fade overlay UI).
- `points.json` — the location data the app reads at runtime.
- `photos/mushtifund-old.jpg` and `photos/mushtifund-current.jpg` — two
  real tagged photos already cropped and in place.

## Do not touch: existing location data

`points.json` currently contains real, researched data for one location
(Mushtifund Saunstha / Bookworm Trust & Library, Fontainhas, Panjim, Goa).
**Do not regenerate, "improve," or invent replacement values for the
existing two entries.** Preserve every field exactly as given below. You
may add *new* point entries alongside these, and you may fix genuine code
bugs that affect how this data is read, but the values themselves came
from real research and must survive untouched:

```json
{
  "points": [
    {
      "id": "mushtifund-old",
      "name": "Mushtifund Saunstha building",
      "lat": 15.4965,
      "lon": 73.8305,
      "heading": 250,
      "year": 1930,
      "photoUrl": "photos/mushtifund-old.jpg",
      "caption": "One of Goa's oldest non-profit educational institutions, founded 1908, teaching in Konkani/Marathi rather than Portuguese. Source: @memorias_de_pangim (year is approximate — verify)"
    },
    {
      "id": "mushtifund-current",
      "name": "Bookworm Trust & Library",
      "lat": 15.4965,
      "lon": 73.8305,
      "heading": 250,
      "year": 2025,
      "photoUrl": "photos/mushtifund-current.jpg",
      "caption": "Now Bookworm Trust & Library, House No. 127, Mala, Fontainhas — the children's library moved into this old blue-and-white building in September 2018"
    }
  ]
}
```

Note `lat`/`lon` (15.4965, 73.8305) are a neighborhood-level placeholder,
not the exact building GPS — that's expected and will be corrected later
from a phone standing at the real spot. Don't "fix" it yourself by
guessing a different coordinate.

## What to do

1. Serve the project locally and confirm it loads without console errors.
   Since camera/geolocation/orientation all require a secure context on
   mobile, set up a way to test on an actual phone — e.g. serve with
   `npx serve .` and tunnel it with `npx ngrok http <port>`, or deploy to
   a static host (Vercel/Netlify/GitHub Pages) that gives you https://
   for free.
2. Verify the full flow works: camera permission → geolocation permission
   → orientation permission (note: iOS requires
   `DeviceOrientationEvent.requestPermission()` to be called from a direct
   user tap — don't refactor this into an automatic call, it will silently
   break on iOS Safari) → points.json loads → era buttons render → photo
   overlay cross-fades in when both GPS distance and compass heading are
   within threshold.
3. Fix any actual bugs you find (permission flow, matching math, race
   conditions between GPS/orientation events firing before points.json has
   loaded, etc.) without changing the shape of `points.json` entries or
   the matching algorithm's intent (distance in meters via haversine,
   heading difference in degrees, both must pass their thresholds).
4. Run it side by side with me — i.e. keep a dev server running and report
   back what you see in the console/behavior as you test, rather than just
   writing code and stopping.

## Stretch goals (only after the above works)

- Add a small UI affordance for correcting `lat`/`lon`/`heading` live
  in the field (e.g. a hidden debug panel showing current GPS/heading
  values, so I can read off real numbers while standing at the location
  instead of guessing).
- Sketch (don't fully build unless asked) an agent-assisted tagging
  pipeline: given a raw photo caption/description, extract or infer a
  place name, geocode it, and flag low-confidence guesses for manual
  review rather than auto-trusting them.

## Constraints

- No frameworks, no build step — keep it a single `index.html` plus data
  files, consistent with the existing code.
- No backend/server-side code — everything runs client-side.
- Don't add analytics, telemetry, or any third-party script tags beyond
  what's already there.
