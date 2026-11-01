// ─────────────────────────────────────────────────────────────
//  EDIT EVERYTHING HERE
//  - Contestants are listed in FINAL RANKING order: first = winner, last = last place.
//  - `steps` is optional. Leave it out and no number is shown for that person.
//  - `photo` is a file in public/photos/ (e.g. "/photos/anna.jpg").
//    Leave it out (or if the file is missing) and a coloured initials avatar is shown.
// ─────────────────────────────────────────────────────────────

export type Contestant = {
  name: string
  steps?: number
  photo?: string
  quote?: string // funny line shown in a speech bubble (not used for last place)
  // Where the face is in the photo, so gags (sunglasses, pig nose…) land on it.
  // x, y = point between the eyes (0–1 of the photo), d = distance between the eyes, rot = head tilt in degrees.
  face?: Face
  gag?: GagKind // the joke drawn on the face at the reveal
}

export type Face = { x: number; y: number; d: number; rot?: number }
export type GagKind = 'shades' | 'tear' | 'pig' | 'zzz' | 'chicken' | 'tears'


export type StatRecord = {
  label: string
  value: number
  unit: string
  who: string
  note?: string
  fun?: boolean // red "shame" styling
}

/** Turns '/photos/x.jpg' into a path that also works when the site lives in a sub-folder (GitHub Pages). */
export function asset(path: string) {
  return import.meta.env.BASE_URL + path.replace(/^\//, '')
}

export const config = {
  title: 'Provocarea Pașilor',
  year: '2026',
  tagline: 'Șase concurenți. Un campion. Zero scuze, decât accidentări.',

  contestants: [
    // Step totals are from the sheet up to 30-Oct. Update with the final numbers.
    { name: 'Deiu', photo: '/photos/deiu.jpg', steps: 447_156, face: { x: 0.51, y: 0.37, d: 0.33 }, gag: 'shades', quote: 'Am mers atât de mult încât Google Maps m-a întrebat dacă sunt bine.' }, // 🥇 winner
    { name: 'Bogdi', photo: '/photos/bogdi.jpg', steps: 438_186, face: { x: 0.57, y: 0.475, d: 0.28, rot: -24 }, gag: 'tear', quote: 'Locul 2 e doar primul dintre cei care au și o viață socială.' }, // 🥈 (Flo in the sheet)
    { name: 'Albert', photo: '/photos/albert.jpg', steps: 427_780, face: { x: 0.57, y: 0.425, d: 0.24, rot: 9 }, gag: 'pig', quote: 'Domnu care îngrașă porcu în ajun.' }, // 🥉
    { name: 'Luci', photo: '/photos/luci.jpg', steps: 278_470, face: { x: 0.53, y: 0.44, d: 0.275, rot: 8 }, gag: 'zzz', quote: 'Prea bun pentru rușine, prea leneș pentru podium.' },
    { name: 'Maris', photo: '/photos/maris.jpg', steps: 247_298, face: { x: 0.46, y: 0.435, d: 0.34, rot: -1 }, gag: 'chicken', quote: 'Am mers mult… majoritatea pașilor au fost până la frigider.' },
    { name: 'Flavius', photo: '/photos/flavius.jpg', steps: 235_721, face: { x: 0.355, y: 0.515, d: 0.27, rot: -4 }, gag: 'tears' }, // 🍅 last place — uses lastPlaceMessage below
  ] as Contestant[],

  lastPlaceMessage: 'Ti-o bagam in cur', // big roast for last place

  // ── Records screen (shown after the podium) ──
  // Group total steps are added up from the contestants above automatically.
  strideMeters: 0.8, // km = steps × stride (the sheet uses 0.8 m)
  records: [
    { label: 'Cea mai bună zi', value: 66_002, unit: 'pași', who: 'Bogdi', note: '31 oct' },
    { label: 'Cea mai mare medie zilnică', value: 22_358, unit: 'pași / zi', who: 'Deiu' },
    { label: 'Cele mai multe zile cu 20k+', value: 11, unit: 'zile', who: 'Bogdi', note: 'inclusiv 4 la rând' },
    { label: 'Cele mai multe zile cu 30k+', value: 6, unit: 'zile', who: 'Albert' },
    { label: 'Cea mai bună zi a grupului', value: 204_566, unit: 'pași', who: 'Toată gașca', note: '31 oct' },
    { label: 'Premiul canapeaua de aur', value: 1_073, unit: 'pași', who: 'Albert', note: '20 oct', fun: true },
  ] as StatRecord[],

  // Timings (milliseconds)
  suspenseMs: 2000, // build-up before places 6 → 2
  winnerSuspenseMs: 6500, // longer build-up before the winner

  tomatoCount: 10, // tomatoes in the first volley at last place
  extraTomatoes: 4, // tomatoes per press of T

  // Song for the winner (Rareș x Lazyed – Taj Mahal).
  // Put the file at public/audio/winner.mp3. startAt = second where the chorus starts.
  winnerSong: {
    src: '/audio/winner.mp3',
    startAt: 29,
    volume: 0.9,
    bpm: 147, // heads bob to this on the winner screen and podium
  },
}
