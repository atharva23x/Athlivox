# Athlivox — Local Full-Stack Demo

Athlivox is a role-based athlete network built around Indian college sport, with a special focus on Pune. Player, Organizer, and Admin accounts each get a different interface and different permissions. Accounts, profile photos and details, event registrations (with full athlete details and cancellation), reel likes, video reel uploads, reel editing/deletion, a verified sponsor-partner directory with athlete sponsorship requests and admin review, notifications, moderation actions, and medal verification are stored on the server. Medals and reputation are no longer static demo numbers: organizers submit results with proof, admins verify them, and only approved results earn reputation through an immutable ledger. Every athlete also has an achievement cabinet (gold, silver, and bronze medals, trophies, certificates), a short achievement history, and a LinkedIn-style follow graph. Players follow each other, see follower/following counts, filter the Players page to the athletes they follow, and get a **Following** reel feed made of those athletes' reels plus their own posts. Event venues use real Pune addresses so the built-in map opens the correct location. Structured data lives in `data.json`; uploaded videos live in `uploads/`. A dark/light theme toggle and a larger, easier-to-scan sidebar complete the interface.

## Run it

Option 1 — double-click:

```text
start-athlivox.bat
```

Option 2 — terminal:

```text
node server.js
```

Then open **http://localhost:3000**.

Requires Node.js 18 or newer. No npm packages are needed.

## Deploying

The app is a single zero-dependency Node.js server. Upload these files/folders to the server or hosting platform:

| Path | Required | Purpose |
| --- | --- | --- |
| `server.js` | Yes | HTTP server and JSON API |
| `index.html` | Yes | Complete frontend |
| `athlivox-logo.svg` | Yes | Header/sidebar/auth logo and favicon |
| `uploads/` | Yes | Bundled demo reels and future athlete video uploads |
| `data.json` | Recommended | Demo database; if omitted, the server creates a fresh seeded one on first start |
| `package.json` | Yes for `npm start` | Defines the `start` script and Node version |
| `render.yaml` | Optional | Render blueprint with a persistent disk and `/api/health` check |
| `start-athlivox.bat` | Optional | Windows-only local launcher |
| `README.md` | Optional | Documentation |

Start it with:

```text
npm start
```

or:

```text
node server.js
```

Set `PORT` if the platform requires it, for example `PORT=8080 node server.js`. The default is `3000`.

### Persistent storage

On a host with a mounted volume, point the app at it:

```text
ATHLIVOX_DATA_DIR=/var/data
```

The server stores `data.json` and `uploads/` there. On first start it copies the bundled demo database and demo reels into that directory, so the demo is ready immediately. If the volume is empty after a reset, the same seed is copied again.

### Render / Railway (recommended)

**Render**

1. Push the deploy folder to a Git repository.
2. In Render, create a **Web Service** from that repo.
3. Runtime: **Node**, build command: `npm install`, start command: `npm start`.
4. Add a persistent disk mounted at `/var/data`.
5. Set `ATHLIVOX_DATA_DIR` to `/var/data`.
6. Deploy and open the service URL.

The included `render.yaml` does steps 3-5 automatically on a paid instance that supports disks. Render's free instance does not include a persistent disk, so its data resets when the service restarts or redeploys.

**Railway**

1. Create a project from the repo.
2. Add a volume mounted at `/data`.
3. Set `ATHLIVOX_DATA_DIR=/data`.
4. Start command: `npm start`.

**VPS**

Upload the deploy folder, run `npm start` under systemd or PM2, and put Nginx/Caddy in front for HTTPS. The app folder itself is the persistent storage.

**Important hosting notes**

- Use a host with a **persistent disk** (Render, Railway, Fly.io, a VPS, or similar). The app writes accounts, follows, registrations, reels, and sponsor requests to `data.json`, and uploaded videos to `uploads/`.
- **Vercel will not work for this version.** Vercel functions have a read-only filesystem except `/tmp`, so `data.json` and `uploads/` cannot persist; the function also expects an exported handler instead of a long-running `server.listen()`. A Vercel version would need an external database, blob storage, and a serverless API adapter.
- No build step and no `npm install` are required because there are no npm dependencies.
- The frontend loads Tailwind CSS, Font Awesome, and Google Fonts from CDNs, so the deployed browser needs internet access.
- To reset the demo, stop the server and delete `data.json` and the uploaded videos from the data directory; the server will recreate the bundled demo seed on the next start.

## Demo accounts

All accounts use the password **`demo123`**. Roles are fixed per account; you cannot switch roles from the UI.

| Role | Email | What they see |
| --- | --- | --- |
| Player | `aarav@athlivox.local` | Home, Events, Results, Players, Reels, Sponsor Partners, Leaderboards |
| Player | `riya@athlivox.local` | Home, Events, Results, Players, Reels, Sponsor Partners, Leaderboards |
| Player | `arjun@athlivox.local` | Home, Events, Results, Players, Reels, Sponsor Partners, Leaderboards |
| Organizer | `organizer@athlivox.local` | Dashboard, Event Oversight, Registrations, Results & Medals, Athlete Pool, Sponsor Partners, Participation Analytics |
| Admin | `admin@athlivox.local` | Platform Overview, Accounts, Sponsor Partners, Result Verification, Content Moderation, Platform Analytics |

You can click any of the five demo cards on the login screen, or type the email and password manually. The demo athletes represent AISSMS COE, COEP Technological University, PCCOE Akurdi, MIT-WPU, VIT Pune, Symbiosis International University, Fergusson College, SPPU, DY Patil College of Engineering, and Modern College of Engineering. The sports catalog includes Basketball, Athletics, Badminton, Swimming, Volleyball, Soccer, Tennis, Kabaddi, Kho Kho, Cricket, Hockey, Golf, Boxing, Cycling, Gymnastics, and Table Tennis.

## Role permissions

### Player
- Search events and athletes from the home search bar, with results that jump straight to registration or athlete profiles
- Register for events after agreeing to the Terms & Conditions and confirming the details are accurate
- View and cancel their own registrations
- View athlete profiles, achievement cabinets, results, reels, and leaderboards
- Follow and unfollow other athletes; see follower/following counts on cards and profiles
- Filter the **Players** page to **All athletes** or **Following**
- Switch the **Reels** page between **For you** and a **Following** feed of followed athletes' reels plus their own
- Edit their own profile details and upload a profile photo
- Switch between dark and light themes
- Like reels and publish their own video reels
- Edit or delete reels they posted
- Browse the **Sponsor Partners** directory, open partner profiles, and send one sponsorship request per partner
- Track each request's status (Pending, Approved, Rejected) and read the admin's reason

### Organizer
- View event capacity and registration totals
- See every athlete registration with contact details and submitted notes
- Filter registrations by event
- **Submit results for verification** from **Results & Medals**: pick a registered athlete, medal/participation, competition level, and add a proof link or reference
- Track every submission's status (Pending, Approved, Rejected, Reversed) and see rejection/reversal reasons
- Scout the athlete pool, including medal/trophy/certificate chips on each athlete card, and view participation analytics
- View follower and following counts, but cannot follow athletes
- View the **Sponsor Partners** directory and partner profiles, but cannot send sponsorship requests
- Cannot verify their own submissions, register for events, like or publish reels, sponsor athletes, follow athletes, or delete content

### Admin
- View platform analytics, accounts, and system health
- **Verify results** from **Result Verification**: review athlete, event, proof, and the computed reputation before approving or rejecting
- Approvals write an immutable ledger entry and award reputation; rejections require a reason and award nothing
- **Reverse** an approved result with a required reason; this creates a negative ledger entry instead of editing history
- Review published reels and remove content that breaks platform rules
- Must enter a removal reason (5-300 characters); the reel owner is notified with that reason
- **Review sponsorship requests** from **Sponsor Partners**: approve to share the athlete's note with the sponsor, or reject with a required reason
- See the full verified sponsor directory that athletes browse
- Cannot register for events, like or publish reels, edit reels, or send sponsor requests

All signed-in roles can switch between dark and light themes and edit their own profile details.

Permission checks are enforced on both the frontend and the backend. Restricted API actions return **403 Forbidden**.

## Medal and reputation verification

Medals and reputation are earned through a two-step verification workflow, not seeded directly.

### 1. Organizer submits a result
From **Results & Medals**, the organizer selects an event, then an athlete registered for that event, and provides:

- Result type: Gold, Silver, Bronze, or Participation
- Competition level: College, District, State, or National
- Proof link or reference (result sheet URL, federation notice, or document reference)
- Optional internal note for the verifier

The backend rejects submissions for unregistered athletes, invalid levels, missing proof, or a duplicate athlete/event pair that is already pending or approved. Submitting notifies every admin account.

### 2. Admin verifies
From **Result Verification**, the admin sees the pending queue with athlete, college, event, proof link, note, and the reputation value at stake.

- **Approve** — writes a ledger entry with the verifier's name and timestamp, updates the athlete's medal count and reputation immediately, refreshes leaderboards, and notifies the athlete and organizer.
- **Reject** — requires a reason (3–300 characters). Nothing is written to the ledger and no reputation is awarded. The athlete and organizer are notified with the reason.

Only the admin can verify; organizers and players receive **403 Forbidden** if they call the endpoint directly.

### Points formula

```
reputation = base points × competition multiplier
```

| Result | Base points |
| --- | --- |
| Gold | 500 |
| Silver | 300 |
| Bronze | 150 |
| Participation | 25 |

| Competition level | Multiplier |
| --- | --- |
| College | ×1 |
| District | ×1.5 |
| State | ×2 |
| National | ×3 |

Examples: District Gold = 750, State Silver = 600, National Bronze = 450, College Participation = 25.

Medal count increases by 1 for each approved Gold, Silver, or Bronze. Participation results award reputation but not a medal.

### Immutable ledger and reversals
- Every approval is stored in `medalLedger` with the original submission, proof, submitter, verifier, and timestamp.
- Approved entries are never edited. If a result was verified in error, the admin uses **Reverse** and must give a reason. This marks the original as `Reversed` and adds a linked negative `Reversal` entry, so the athlete's totals return to their pre-result value while the full history remains visible.
- Rejections are kept in `medalSubmissions` with the reason and reviewer for audit purposes.

### Baseline career history
Existing demo athletes keep their career totals as `baseMedals` and `baseReputation` in `data.json`. Verified results are added on top, so the seeded profiles still look populated while every new medal is traceable. A player's profile shows a **Verified results** section listing each approved result, its level, verifier, date, proof, and points.

## Achievements and following

### Achievement cabinet

Every athlete profile opens with an **Achievement cabinet** and a **Recent achievements** timeline:

| Metric | What it counts |
| --- | --- |
| Gold | Seeded gold medals plus every approved Gold result on the medal ledger |
| Silver | Seeded silver medals plus every approved Silver result |
| Bronze | Seeded bronze medals plus every approved Bronze result |
| Trophies | Seeded trophies and athlete-of-the-year style honours |
| Certificates | Seeded coaching, officiating, and participation certificates |

The same breakdown appears as compact medal chips on Players page cards and Organizer athlete-pool cards, so the talent pool is scannable without opening each profile. Every cabinet tile is also a drill-down: click **Gold**, **Silver**, **Bronze**, **Trophies**, or **Certificates** to open a dated record of the exact events, placements, sports, and awarding bodies. Approved medal-ledger results appear in the same list with a **Verified result** badge and proof link. Achievement data is seeded per athlete in `server.js` and persisted to each player record in `data.json` as `achievements`, `highlights`, and `achievementHistory`.

### Follow graph

Following works like a lightweight professional network:

- **Follow / Unfollow** buttons appear on athlete cards and profiles for Player accounts only. An athlete cannot follow themselves, and Organizer/Admin accounts see counts but no follow controls.
- **Follower and following counts** are computed on the server from the follow graph and returned with every player in `GET /api/state`.
- **Players page tabs** — **All athletes** shows the full pool, **Following** shows only the athletes the signed-in player follows.
- **Reels page tabs** — **For you** shows every reel, **Following** shows reels created by followed athletes plus the signed-in player's own reels.
- **Notifications** — when a followed athlete has a real account, they receive a **New follower** notification. Follows are idempotent, so tapping Follow twice does not create duplicate edges.

Follow edges live in `data.json` under `follows` as `{ followerId, followingId, createdAt }`, keyed by stable player IDs such as `player-aarav` and `player-riya`.

### Social API

| Method | Endpoint | Role | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/follow` | Player | Follow or unfollow an athlete with `{ playerId, action }`, where `action` is `follow` or `unfollow`. Returns the updated player and the caller's `followingIds` |
| `GET` | `/api/state` | Any signed-in role | Includes enriched `players` (`followersCount`, `followingCount`, `isFollowing`, `isSelf`), `playerId`, `followingIds`, and reel `creatorId` values used by the feeds |

Self-follow returns **400**, duplicate follows are ignored, and Organizer/Admin calls return **403 Forbidden**.

## Sponsor partners

Sponsor partners are organisations that fund athletes directly. Athlivox lists only verified partners, explains exactly what each one offers, and routes every athlete request through an admin review before it reaches the sponsor.

### What athletes see

The **Sponsor Partners** page is available to Players and Organizers. It includes:

- A short explanation of what a sponsor partner is
- Category filters (Foundation, Sports club, Academy, Equipment brand, Mobility brand, Trust)
- Partner cards with logo initials, category, Pune location, focus sports, support range, and a verified badge
- A full partner profile with the organisation's story, founding year, athletes supported, focus sports, what they offer, support range, website, and contact email
- For Players, a **Request support** button and a **My sponsorship requests** tracker

### Seeded partners

The demo ships with six fictional Pune partners. Their names, domains, and contact addresses are illustrative only and do not represent real organisations.

| Partner | Category | Location | Focus sports | What they offer | Support range |
| --- | --- | --- | --- | --- | --- |
| Sahyadri Sports Foundation | Foundation | Balewadi | Athletics, Basketball, Swimming, Badminton | Travel and tournament fees, coaching stipends, equipment | ₹25,000 - ₹1,50,000 per athlete |
| Deccan Track Club | Sports club | Deccan Gymkhana | Athletics, Swimming, Tennis | Monthly coaching stipend, physiotherapy, race entries | ₹15,000 - ₹75,000 per season |
| Balewadi Performance Lab | Academy | Balewadi | Badminton, Tennis, Basketball, Swimming | Training access, strength and conditioning, recovery sessions | In-kind training + ₹20,000 stipend |
| BharatShield Gear | Equipment brand | Hadapsar | Basketball, Volleyball, Badminton, Tennis, Athletics | Match kit, training apparel, footwear | ₹10,000 - ₹60,000 in kit |
| Kalyani Mobility | Mobility brand | Chinchwad | Cricket, Soccer, Kabaddi, Hockey | Team travel, tournament fees, fuel support | ₹20,000 - ₹1,00,000 per team |
| Pune Collegiate Sports Trust | Trust | Shivajinagar | Basketball, Volleyball, Athletics, Kabaddi | Sports scholarship, facility access, coaching | ₹30,000 - ₹2,00,000 per athlete |

### How a request works

1. **Player sends a request** - from a partner card or profile, the player picks a sport and writes a 20-600 character note explaining their season and what they need.
2. **Duplicate guard** - a player can have only one `Pending` request per partner. Sending another returns **409 Conflict**.
3. **Admin review** - the request appears under **Sponsor Partners** in the admin console with the athlete, college, sport, note, and timestamp. The admin can:
   - **Approve** - optionally add a note; the athlete is notified that the request was approved and the sponsor will contact them.
   - **Reject** - must give a reason (5-300 characters); the athlete is notified with that reason.
4. **Athlete tracking** - the player's **My sponsorship requests** list shows every request, its status, the reviewer, the review date, and any admin note.

### Role rules

| Role | Sponsor directory | Send request | Review requests |
| --- | --- | --- | --- |
| Player | Yes | Yes, one pending per partner | No |
| Organizer | Yes, view only | No (**403 Forbidden**) | No |
| Admin | Yes, plus request queue | No (**403 Forbidden**) | Yes |

### Sponsor API

| Method | Endpoint | Role | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/state` | Any signed-in role | Players receive `sponsors` and their own `sponsorRequests`; Organizers receive `sponsors`; Admins receive `sponsors`, all `sponsorRequests`, and sponsor stats |
| `POST` | `/api/sponsor-request` | Player | Send a request with `sponsorId`, `sport`, and `message` |
| `POST` | `/api/sponsor-request-review` | Admin | Review with `requestId`, `decision` (`Approved` or `Rejected`), and optional/required `reason` |

Sponsor partners and requests persist in `data.json` under `sponsors` and `sponsorRequests`. Older demo databases that stored blind sponsor requests inside `sponsors` are migrated on startup, and the six seeded partners are added without duplicating existing ones.



Clicking **Register** opens a Terms & Conditions gate. The registration form only opens after the Terms checkbox is ticked and the agreement button is enabled. Inside the form, the confirmation checkbox must also be ticked before the submit button becomes available. The backend rejects registrations unless both `agreeToTerms` and `confirmAccuracy` are true.

## Profile editing and photos

Open the account menu and choose **Edit profile & photo**. Users can change their name, college/club, sports, and profile photo. Photos are resized in the browser to a 512 × 512 JPEG before they are saved as a data URL in `data.json`, so avatar changes survive restarts. Email and role are read-only in the demo. Updated names flow through athlete cards, leaderboards, reels, and registrations.

## Dark and light themes

Use the moon/sun button in the header or on the login screen. The choice is saved in `localStorage` under `athlivox_theme` and is restored on the next visit.

## Reel management

- **Fullscreen playback** — click any reel card (on the Reels page) or any video thumbnail in admin Content Moderation to open the fullscreen player. The video autoplays with sound and native controls; click the backdrop, the close button, or press **Esc** to stop and close it. Cards also play a muted hover preview.
- **Bundled demo videos** — nine real 720 × 1280 MP4 clips ship in `uploads/`, covering basketball, athletics, swimming, volleyball, football, cricket, badminton, kabaddi, and tennis. If an existing `data.json` predates a reel or video support, the server adds the missing seeded reels and attaches these files on startup.
- **Edit** — the creator can change the reel title, caption, and sport. The updated details are saved on the backend.
- **Delete** — the creator can remove their own reel and its uploaded video file. Admins can remove any reel from Content Moderation. Organizers cannot delete reels.
- **Moderation reasons** — admins must enter a 5–300 character reason before removing a reel. The backend rejects removals without a valid reason.
- **Moderation notifications** — when an admin removes a reel, the owner receives a notification that quotes the admin's removal reason.

### Demo video credits

The bundled demo reels are trimmed, cropped to 9:16, and re-encoded from freely licensed Wikimedia Commons footage:

| Reel | Source | License |
| --- | --- | --- |
| Half-court buzzer beater | [NSF Diego Garcia hosts basketball game](https://commons.wikimedia.org/wiki/File:NSF_Diego_Garcia_hosts_basketball_game_(989713).webm) — U.S. Navy video by Seaman Latifah Choice | Public domain |
| 6AM track grind | [Women's 100M Final — 28th Summer Universiade 2015 Gwangju](https://commons.wikimedia.org/wiki/File:Women%27s_100M_Final_-_28th_Summer_Universiade_2015_Gwangju.webm) — FISUTV | CC BY 3.0 |
| Underwater turns in slow-mo | [Mary's Swim Boot Camp — Ceci's underwater freestyle video](https://commons.wikimedia.org/wiki/File:Mary%27s_Swim_Boot_Camp_-_Ceci%27s_underwater_freestyle_video.webm) — koolkatkari | CC BY 3.0 |
| Match point at the net | [Paris Volley - Chaumont — point passeur](https://commons.wikimedia.org/wiki/File:Paris_Volley_-_Chaumont,_18_February_2014_-_37_-_point_passeur.webm) — Shev123 | CC0 |
| Late winner under lights | [Reel Teaser: US Marines with MRF-D compete in Forces Football 2026](https://commons.wikimedia.org/wiki/File:Reel_Teaser-_US_Marines_with_MRF-D_compete_in_Forces_Football_2026_(1013780).webm) — U.S. Marines MRF-D by Cpl. Nan Yang | Public domain |
| Straight drive for four | [Hatfield Heath CC v Potter Street & Church Langley CC — straight drive for four](https://commons.wikimedia.org/wiki/File:Hatfield_Heath_CC_v_Potter_Street_%26_Church_Langley_CC_Video_6_straight_drive_for_four.webm) — Acabashi | CC BY-SA 4.0 |
| Match point rally | [Zmagovalna točka Kaje Stanković za tretji naslov slovenske prvakinje](https://commons.wikimedia.org/wiki/File:Zmagovalna_to%C4%8Dka_Kaje_Stankovi%C4%87_za_tretji_naslov_slovenske_prvakinje.webm) — Badminton klub Ljubljana | CC BY 3.0 |
| Last-raid escape | [Kabaddi-japan-2015-10-4](https://commons.wikimedia.org/wiki/File:Kabaddi-japan-2015-10-4.webm) — Nesnad | CC BY-SA 4.0 |
| Clay-court ace | [2018 Davis Cup Americas Zone - Uruguay vs Mexico - 04](https://commons.wikimedia.org/wiki/File:2018_Davis_Cup_Americas_Zone_-_Uruguay_vs_Mexico_-_04.webm) — NaBUru38 | CC BY-SA 4.0 |

Replace these files with your own footage for a real deployment; keep the filenames or update the seeded reel paths in `server.js` and `data.json`.

## What the backend handles

- Login, logout, and session validation
- Role-specific state payloads and endpoint permissions
- Profile updates with validated names, colleges, sports, and image data URLs
- Event registration with a validated athlete detail form and Terms/accuracy consent
- Event capacity and live spots-left tracking
- Registration details and cancellation with automatic spot release
- Organizer notifications for new or cancelled registrations
- Per-account event registrations, reel likes, and notifications
- Video reel uploads (MP4, WebM, OGG, MOV; up to 50 MB) stored in `uploads/` and streamed with byte-range support
- Nine bundled demo reel videos served from `uploads/` with fullscreen playback and hover previews
- Reel editing and deletion, including cleanup of uploaded files
- Admin content moderation with a required removal reason and reason-bearing owner notifications
- Medal submissions with registered-athlete, duplicate, level, and proof validation
- Admin result verification with approval/rejection, audit trail, and role guards
- Immutable medal ledger with computed athlete reputation, medal counts, and reversal entries
- Per-athlete achievement cabinets with gold/silver/bronze medals, trophies, certificates, and recent highlights
- Drill-down achievement records with event, date, sport, awarding body, verified-result badges, and proof links
- Persisted follow graph with server-computed follower/following counts, self-follow protection, and idempotent follow/unfollow
- Player-only follow controls, Following filters on Players and Reels, and new-follower notifications
- Verified sponsor-partner directory with profiles, categories, focus sports, support ranges, and contact details
- Player sponsorship requests with sport/message validation and one-pending-request-per-partner protection
- Admin sponsorship review with approval or reason-required rejection, plus athlete notifications
- Sponsor data persistence, legacy request migration, and duplicate-free seeding on startup
- Persistence to `data.json` and `uploads/`

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Complete role-based frontend |
| `server.js` | Zero-dependency HTTP server and JSON API |
| `athlivox-logo.svg` | Athlivox logo used in the header, sidebar, auth screen, and favicon |
| `data.json` | Auto-created demo database |
| `uploads/` | Auto-created folder for uploaded reel videos and the nine bundled demo reels |
| `start-athlivox.bat` | Starts the server and opens the browser |
| `package.json` | Optional `npm start` script |

## Notes

- Sessions are held in memory. Restarting `server.js` signs everyone out; the app shows the login screen again.
- To reset all demo data, stop the server, delete `data.json` and the contents of `uploads/`, then start the server again.
- Video uploads are limited to 50 MB and must be MP4, M4V, WebM, OGG, OGV, or MOV.
- Registrations, likes, uploads, reel edits, profile edits/photos, moderation actions, notifications, and accounts survive page reloads.
- Existing `data.json` files are migrated on startup to add the Riya and Arjun demo accounts, seeded demo registrations, `baseMedals`/`baseReputation`, `medalSubmissions`/`medalLedger`, the six seeded sponsor partners, and the `sponsorRequests` collection if they are missing. Legacy sponsor requests stored in `sponsors` are moved into `sponsorRequests`. Athlete IDs, achievement cabinets, highlights, detailed achievement records, and the seeded 63-edge follow graph are also backfilled automatically.
- The seeded season is India-focused: 16 Pune events with real venue addresses, Pune college leaderboards, and demo athletes from AISSMS COE, COEP Technological University, PCCOE Akurdi, and other Pune institutions.
- Theme choice is stored in the browser, not in `data.json`.
- The page loads Tailwind CSS, Font Awesome, and Google Fonts from CDNs, so an internet connection is needed for styling and icons.
