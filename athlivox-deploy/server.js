const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = process.env.ATHLIVOX_DATA_DIR ? path.resolve(process.env.ATHLIVOX_DATA_DIR) : ROOT;
const DATA_FILE = path.join(DATA_DIR, "data.json");
const BUNDLED_DATA_FILE = path.join(ROOT, "data.json");
const HTML_FILE = path.join(ROOT, "index.html");
const LOGO_FILE = path.join(ROOT, "athlivox-logo.svg");
const BUNDLED_UPLOADS_DIR = path.join(ROOT, "uploads");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_AVATAR_CHARS = 1500000;
const DEMO_PASSWORD = "demo123";

// Reputation is earned only from results an admin has verified.
const MEDAL_POINTS = { Gold: 500, Silver: 300, Bronze: 150, Participation: 25 };
const LEVEL_MULTIPLIERS = { College: 1, District: 1.5, State: 2, National: 3 };
const MEDAL_TYPES = Object.keys(MEDAL_POINTS);
const COMPETITION_LEVELS = Object.keys(LEVEL_MULTIPLIERS);

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// On hosts with a persistent volume, seed the volume from the bundled demo data once.
if (DATA_DIR !== ROOT && !fs.existsSync(DATA_FILE) && fs.existsSync(BUNDLED_DATA_FILE)) {
  fs.copyFileSync(BUNDLED_DATA_FILE, DATA_FILE);
}
if (DATA_DIR !== ROOT && fs.existsSync(BUNDLED_UPLOADS_DIR)) {
  fs.readdirSync(BUNDLED_UPLOADS_DIR).forEach(name => {
    const source = path.join(BUNDLED_UPLOADS_DIR, name);
    const target = path.join(UPLOADS_DIR, name);
    if (fs.statSync(source).isFile() && !fs.existsSync(target)) {
      fs.copyFileSync(source, target);
    }
  });
}

function hashPassword(password) {
  return crypto.createHash("sha256").update("athlivox::" + password).digest("hex");
}

const demoPasswordHash = hashPassword(DEMO_PASSWORD);

const events = [
  { sport: "Basketball", name: "Inter-College Basketball Trials", date: "22 Nov", venue: "AISSMS COE Basketball Court", address: "AISSMS College of Engineering, Kennedy Road, Near RTO, Pune, Maharashtra 411001", deadline: "15 Nov", capacity: 48 },
  { sport: "Athletics", name: "Pune District Athletics Meet", date: "29 Nov", venue: "Shiv Chhatrapati Sports Complex", address: "Shiv Chhatrapati Sports Complex, Balewadi, Mahalunge, Pune, Maharashtra 411045", deadline: "22 Nov", capacity: 120 },
  { sport: "Badminton", name: "Pune Open Doubles Championship", date: "6 Dec", venue: "PDMBA Sports Complex", address: "PDMBA Sports Complex, Modern College Road, Shivajinagar, Pune, Maharashtra 411005", deadline: "29 Nov", capacity: 32 },
  { sport: "Swimming", name: "Maharashtra Swimming Trials", date: "13 Dec", venue: "Balewadi Aquatic Centre", address: "Shiv Chhatrapati Sports Complex, Balewadi, Mahalunge, Pune, Maharashtra 411045", deadline: "6 Dec", capacity: 64 },
  { sport: "Volleyball", name: "Pune University Volleyball Finals", date: "20 Dec", venue: "COEP Technological University Ground", address: "COEP Technological University, Wellesley Road, Shivajinagar, Pune, Maharashtra 411005", deadline: "13 Dec", capacity: 16 },
  { sport: "Soccer", name: "Pune Inter-College Football Cup", date: "27 Dec", venue: "Balewadi Football Ground", address: "Shiv Chhatrapati Sports Complex, Balewadi, Mahalunge, Pune, Maharashtra 411045", deadline: "20 Dec", capacity: 44 },
  { sport: "Tennis", name: "Pune District Tennis Open", date: "3 Jan", venue: "Deccan Gymkhana Tennis Courts", address: "Deccan Gymkhana, 5, Deccan Gymkhana Road, Pune, Maharashtra 411004", deadline: "27 Dec", capacity: 32 },
  { sport: "Kabaddi", name: "Maharashtra Kabaddi Championship", date: "10 Jan", venue: "Balewadi Indoor Stadium", address: "Shiv Chhatrapati Sports Complex, Balewadi, Mahalunge, Pune, Maharashtra 411045", deadline: "3 Jan", capacity: 40 },
  { sport: "Kho Kho", name: "Pune Kho Kho Championship", date: "17 Jan", venue: "COEP Technological University Ground", address: "COEP Technological University, Wellesley Road, Shivajinagar, Pune, Maharashtra 411005", deadline: "10 Jan", capacity: 36 },
  { sport: "Cricket", name: "Pune T20 Campus Championship", date: "24 Jan", venue: "MCA Stadium, Gahunje", address: "Maharashtra Cricket Association Stadium, Gahunje, Pune, Maharashtra 412101", deadline: "17 Jan", capacity: 36 },
  { sport: "Hockey", name: "Pune Hockey League Finals", date: "31 Jan", venue: "Balewadi Hockey Ground", address: "Shiv Chhatrapati Sports Complex, Balewadi, Mahalunge, Pune, Maharashtra 411045", deadline: "24 Jan", capacity: 24 },
  { sport: "Golf", name: "Pune Open Golf Invitational", date: "7 Feb", venue: "Poona Golf Club", address: "Poona Golf Club, Golf Club Road, Yerawada, Pune, Maharashtra 411006", deadline: "31 Jan", capacity: 48 },
  { sport: "Boxing", name: "Pune District Boxing Championship", date: "14 Feb", venue: "Balewadi Boxing Hall", address: "Shiv Chhatrapati Sports Complex, Balewadi, Mahalunge, Pune, Maharashtra 411045", deadline: "7 Feb", capacity: 24 },
  { sport: "Cycling", name: "Pune Cycling Criterium", date: "21 Feb", venue: "Balewadi Velodrome", address: "Shiv Chhatrapati Sports Complex, Balewadi, Mahalunge, Pune, Maharashtra 411045", deadline: "14 Feb", capacity: 80 },
  { sport: "Gymnastics", name: "Maharashtra Gymnastics Invitational", date: "28 Feb", venue: "Balewadi Gymnastics Hall", address: "Shiv Chhatrapati Sports Complex, Balewadi, Mahalunge, Pune, Maharashtra 411045", deadline: "21 Feb", capacity: 28 },
  { sport: "Table Tennis", name: "Pune Table Tennis Open", date: "7 Mar", venue: "Deccan Gymkhana Table Tennis Hall", address: "Deccan Gymkhana, 5, Deccan Gymkhana Road, Pune, Maharashtra 411004", deadline: "28 Feb", capacity: 32 }
];

const SPORTS = [
  "Basketball", "Athletics", "Badminton", "Swimming", "Volleyball",
  "Soccer", "Tennis", "Kabaddi", "Kho Kho", "Cricket", "Hockey",
  "Golf", "Boxing", "Cycling", "Gymnastics", "Table Tennis"
];

const SPORT_VISUALS = {
  Basketball: { emoji: "🏀", gradient: "linear-gradient(160deg, #F59E0B 0%, #B45309 46%, #1C1917 100%)" },
  Athletics: { emoji: "🏃", gradient: "linear-gradient(160deg, #2563EB 0%, #1E3A8A 52%, #0F172A 100%)" },
  Badminton: { emoji: "🏸", gradient: "linear-gradient(160deg, #10B981 0%, #047857 50%, #0F172A 100%)" },
  Swimming: { emoji: "🏊", gradient: "linear-gradient(160deg, #06B6D4 0%, #0E7490 46%, #0F172A 100%)" },
  Volleyball: { emoji: "🏐", gradient: "linear-gradient(160deg, #8B5CF6 0%, #5B21B6 50%, #0F172A 100%)" },
  Soccer: { emoji: "⚽", gradient: "linear-gradient(160deg, #22C55E 0%, #15803D 50%, #052E16 100%)" },
  Tennis: { emoji: "🎾", gradient: "linear-gradient(160deg, #84CC16 0%, #4D7C0F 50%, #1A2E05 100%)" },
  Kabaddi: { emoji: "🤼", gradient: "linear-gradient(160deg, #DC2626 0%, #7F1D1D 50%, #1C1917 100%)" },
  "Kho Kho": { emoji: "🏃", gradient: "linear-gradient(160deg, #F59E0B 0%, #B45309 50%, #1C1917 100%)" },
  Cricket: { emoji: "🏏", gradient: "linear-gradient(160deg, #14B8A6 0%, #0F766E 50%, #042F2E 100%)" },
  Hockey: { emoji: "🏒", gradient: "linear-gradient(160deg, #38BDF8 0%, #0369A1 50%, #082F49 100%)" },
  Golf: { emoji: "⛳", gradient: "linear-gradient(160deg, #10B981 0%, #065F46 50%, #022C22 100%)" },
  Boxing: { emoji: "🥊", gradient: "linear-gradient(160deg, #DC2626 0%, #7F1D1D 50%, #1C1917 100%)" },
  Cycling: { emoji: "🚴", gradient: "linear-gradient(160deg, #F97316 0%, #C2410C 50%, #431407 100%)" },
  Gymnastics: { emoji: "🤸", gradient: "linear-gradient(160deg, #EC4899 0%, #9D174D 50%, #500724 100%)" },
  "Table Tennis": { emoji: "🏓", gradient: "linear-gradient(160deg, #6366F1 0%, #4338CA 50%, #1E1B4B 100%)" }
};

const VIDEO_TYPES = {
  ".mp4": "video/mp4",
  ".m4v": "video/x-m4v",
  ".webm": "video/webm",
  ".ogv": "video/ogg",
  ".ogg": "video/ogg",
  ".mov": "video/quicktime"
};

const results = [
  { sport: "Basketball", teamA: "AISSMS COE", teamB: "COEP", scoreA: 78, scoreB: 72, winner: "AISSMS COE", tournament: "Pune University League", date: "18 Oct" },
  { sport: "Badminton", teamA: "Riya Kulkarni", teamB: "Sneha Iyer", scoreA: 21, scoreB: 15, winner: "Riya Kulkarni", tournament: "Pune Open", date: "12 Oct" },
  { sport: "Volleyball", teamA: "PCCOE Akurdi", teamB: "VIT Pune", scoreA: 3, scoreB: 1, winner: "PCCOE Akurdi", tournament: "Pune University League", date: "8 Oct" },
  { sport: "Swimming", teamA: "Ananya Joshi", teamB: "—", scoreA: 28.4, scoreB: 0, winner: "Ananya Joshi", tournament: "50m Freestyle", date: "5 Oct" },
  { sport: "Soccer", teamA: "COEP", teamB: "SPPU", scoreA: 3, scoreB: 1, winner: "COEP", tournament: "Pune Inter-College Cup", date: "2 Oct" },
  { sport: "Tennis", teamA: "Sneha Iyer", teamB: "Isha Deshpande", scoreA: 2, scoreB: 1, winner: "Sneha Iyer", tournament: "Pune District Open", date: "28 Sep" },
  { sport: "Kabaddi", teamA: "AISSMS COE", teamB: "PCCOE Akurdi", scoreA: 42, scoreB: 38, winner: "AISSMS COE", tournament: "Maharashtra Kabaddi Championship", date: "25 Sep" },
  { sport: "Cricket", teamA: "COEP", teamB: "VIT Pune", scoreA: 168, scoreB: 154, winner: "COEP", tournament: "Pune T20 Campus League", date: "20 Sep" },
  { sport: "Kho Kho", teamA: "COEP", teamB: "PCCOE Akurdi", scoreA: 18, scoreB: 15, winner: "COEP", tournament: "Pune Kho Kho Championship", date: "18 Sep" },
  { sport: "Gymnastics", teamA: "Isha Deshpande", teamB: "—", scoreA: 14.8, scoreB: 0, winner: "Isha Deshpande", tournament: "Maharashtra Invitational", date: "15 Sep" }
];

const players = [
  { name: "Aarav Deshmukh", college: "AISSMS COE", sports: ["Basketball", "Athletics"], medals: 5, reputation: 4850, stats: "34 matches · 487 pts · 112 assists" },
  { name: "Riya Kulkarni", college: "COEP Technological University", sports: ["Badminton", "Swimming"], medals: 8, reputation: 6200, stats: "42 matches · 38 wins" },
  { name: "Arjun Patil", college: "PCCOE Akurdi", sports: ["Volleyball", "Basketball"], medals: 3, reputation: 3200, stats: "28 matches · 210 kills" },
  { name: "Ananya Joshi", college: "MIT-WPU", sports: ["Swimming"], medals: 6, reputation: 4100, stats: "22 matches · 20 wins" },
  { name: "Isha Deshpande", college: "Fergusson College", sports: ["Swimming", "Athletics"], medals: 4, reputation: 3900, stats: "26 matches · 14 wins" },
  { name: "Vivaan Shah", college: "VIT Pune", sports: ["Volleyball", "Basketball"], medals: 2, reputation: 3100, stats: "30 matches · 180 kills" },
  { name: "Rohan Shinde", college: "SPPU", sports: ["Soccer"], medals: 5, reputation: 4400, stats: "26 matches · 18 goals" },
  { name: "Sneha Iyer", college: "Symbiosis International University", sports: ["Tennis"], medals: 7, reputation: 5100, stats: "31 matches · 27 wins" },
  { name: "Kabir Khan", college: "DY Patil College of Engineering", sports: ["Kabaddi"], medals: 4, reputation: 4600, stats: "18 matches · 96 raid points" },
  { name: "Aisha Khan", college: "Modern College of Engineering", sports: ["Cricket", "Table Tennis"], medals: 3, reputation: 3500, stats: "24 matches · 640 runs" },
  { name: "Omkar Jadhav", college: "COEP Technological University", sports: ["Kho Kho", "Athletics"], medals: 2, reputation: 2900, stats: "26 matches · 41 points" },
  { name: "Tanvi Bhosale", college: "AISSMS COE", sports: ["Gymnastics", "Cycling"], medals: 6, reputation: 4800, stats: "19 meets · 14 podium finishes" }
];

const playerSocialSeed = {
  "Aarav Deshmukh": {
    id: "player-aarav",
    achievements: { gold: 2, silver: 2, bronze: 1, trophies: 2, certificates: 6 },
    highlights: [
      { type: "Gold", title: "Pune University Basketball League", date: "Oct 2026", detail: "Champions · 78-72 final" },
      { type: "Trophy", title: "AISSMS Sportsman of the Year", date: "Sep 2026", detail: "Annual college sports awards" },
      { type: "Certificate", title: "State Athletics Coaching Camp", date: "Aug 2026", detail: "Completed the 6-week sprint program" }
    ]
  },
  "Riya Kulkarni": {
    id: "player-riya",
    achievements: { gold: 4, silver: 3, bronze: 1, trophies: 3, certificates: 9 },
    highlights: [
      { type: "Gold", title: "Pune Open Badminton Championship", date: "Oct 2026", detail: "Women's singles champion" },
      { type: "Trophy", title: "COEP Athlete of the Year", date: "Sep 2026", detail: "Top-ranked athlete across all sports" },
      { type: "Certificate", title: "Maharashtra Swimming Time Trials", date: "Aug 2026", detail: "Qualified in 100m freestyle" }
    ]
  },
  "Arjun Patil": {
    id: "player-arjun",
    achievements: { gold: 1, silver: 1, bronze: 1, trophies: 1, certificates: 3 },
    highlights: [
      { type: "Gold", title: "PCCOE Invitational Volleyball Cup", date: "Sep 2026", detail: "Winning team · 12 kills in the final" },
      { type: "Silver", title: "Pune University Basketball League", date: "Aug 2026", detail: "Runners-up with PCCOE" },
      { type: "Certificate", title: "Level 1 Volleyball Coaching", date: "Jul 2026", detail: "Maharashtra Volleyball Association" }
    ]
  },
  "Ananya Joshi": {
    id: "player-ananya",
    achievements: { gold: 3, silver: 2, bronze: 1, trophies: 2, certificates: 7 },
    highlights: [
      { type: "Gold", title: "Maharashtra Swimming Trials", date: "Oct 2026", detail: "100m freestyle · personal best" },
      { type: "Silver", title: "Pune Aquatic Meet", date: "Sep 2026", detail: "200m backstroke finalist" },
      { type: "Certificate", title: "NIS Swimming Level 1", date: "Jul 2026", detail: "Coaching certification completed" }
    ]
  },
  "Isha Deshpande": {
    id: "player-isha",
    achievements: { gold: 1, silver: 2, bronze: 1, trophies: 1, certificates: 5 },
    highlights: [
      { type: "Silver", title: "Pune District Athletics Meet", date: "Sep 2026", detail: "400m · second place" },
      { type: "Bronze", title: "Fergusson Aquatics Championship", date: "Aug 2026", detail: "100m butterfly" },
      { type: "Certificate", title: "Athletics Officiating Course", date: "Jun 2026", detail: "District athletics association" }
    ]
  },
  "Vivaan Shah": {
    id: "player-vivaan",
    achievements: { gold: 1, silver: 0, bronze: 1, trophies: 1, certificates: 2 },
    highlights: [
      { type: "Gold", title: "VIT Pune Inter-College Volleyball", date: "Sep 2026", detail: "Tournament MVP" },
      { type: "Bronze", title: "Pune University Basketball League", date: "Aug 2026", detail: "Third place with VIT Pune" },
      { type: "Certificate", title: "Strength & Conditioning Workshop", date: "Jun 2026", detail: "Athlete performance fundamentals" }
    ]
  },
  "Rohan Shinde": {
    id: "player-rohan",
    achievements: { gold: 2, silver: 2, bronze: 1, trophies: 2, certificates: 6 },
    highlights: [
      { type: "Gold", title: "Pune Inter-College Football Cup", date: "Oct 2026", detail: "Top scorer · 7 goals" },
      { type: "Trophy", title: "SPPU Football Player of the Season", date: "Sep 2026", detail: "Selected by the university panel" },
      { type: "Certificate", title: "AIFF Grassroots Coaching", date: "Jul 2026", detail: "Level D coaching certificate" }
    ]
  },
  "Sneha Iyer": {
    id: "player-sneha",
    achievements: { gold: 3, silver: 2, bronze: 2, trophies: 3, certificates: 8 },
    highlights: [
      { type: "Gold", title: "Pune District Tennis Open", date: "Oct 2026", detail: "Women's singles champion" },
      { type: "Gold", title: "Symbiosis Invitational", date: "Sep 2026", detail: "Undefeated through the draw" },
      { type: "Trophy", title: "Symbiosis Sportsperson of the Year", date: "Aug 2026", detail: "University sports honours" }
    ]
  },
  "Kabir Khan": {
    id: "player-kabir",
    achievements: { gold: 2, silver: 1, bronze: 1, trophies: 2, certificates: 5 },
    highlights: [
      { type: "Gold", title: "Maharashtra Kabaddi Championship", date: "Oct 2026", detail: "Best raider award" },
      { type: "Silver", title: "Pune District Kabaddi League", date: "Sep 2026", detail: "Runners-up · 96 raid points" },
      { type: "Certificate", title: "Kabaddi Referee Certification", date: "Jun 2026", detail: "State-level officiating licence" }
    ]
  },
  "Aisha Khan": {
    id: "player-aisha",
    achievements: { gold: 1, silver: 1, bronze: 1, trophies: 1, certificates: 4 },
    highlights: [
      { type: "Gold", title: "Pune T20 Campus Championship", date: "Oct 2026", detail: "Player of the match in the final" },
      { type: "Bronze", title: "Pune Table Tennis Open", date: "Aug 2026", detail: "Women's doubles" },
      { type: "Certificate", title: "Cricket Umpiring Level 1", date: "Jul 2026", detail: "MCA certified" }
    ]
  },
  "Omkar Jadhav": {
    id: "player-omkar",
    achievements: { gold: 0, silver: 1, bronze: 1, trophies: 0, certificates: 3 },
    highlights: [
      { type: "Silver", title: "Pune Kho Kho Championship", date: "Sep 2026", detail: "Runner-up with COEP" },
      { type: "Bronze", title: "COEP Athletics Meet", date: "Aug 2026", detail: "1500m · third place" },
      { type: "Certificate", title: "Kho Kho Coaching Camp", date: "Jun 2026", detail: "District-level training programme" }
    ]
  },
  "Tanvi Bhosale": {
    id: "player-tanvi",
    achievements: { gold: 2, silver: 3, bronze: 1, trophies: 2, certificates: 7 },
    highlights: [
      { type: "Gold", title: "Maharashtra Gymnastics Invitational", date: "Oct 2026", detail: "All-around champion" },
      { type: "Silver", title: "Pune Cycling Criterium", date: "Sep 2026", detail: "Under-21 category" },
      { type: "Trophy", title: "AISSMS Sportswoman of the Year", date: "Aug 2026", detail: "College annual sports awards" }
    ]
  }
};

const playerFollowSeed = {
  "player-aarav": ["player-riya", "player-ananya", "player-rohan", "player-sneha", "player-arjun", "player-kabir"],
  "player-riya": ["player-aarav", "player-arjun", "player-tanvi", "player-ananya", "player-sneha", "player-isha", "player-rohan"],
  "player-arjun": ["player-riya", "player-vivaan", "player-kabir", "player-aarav", "player-sneha"],
  "player-ananya": ["player-riya", "player-isha", "player-tanvi", "player-sneha", "player-aisha"],
  "player-isha": ["player-ananya", "player-tanvi", "player-aarav", "player-riya", "player-sneha"],
  "player-vivaan": ["player-arjun", "player-rohan", "player-kabir", "player-aarav", "player-tanvi"],
  "player-rohan": ["player-aarav", "player-vivaan", "player-sneha", "player-omkar", "player-riya", "player-kabir"],
  "player-sneha": ["player-riya", "player-rohan", "player-aisha", "player-tanvi", "player-ananya"],
  "player-kabir": ["player-arjun", "player-vivaan", "player-omkar", "player-rohan", "player-aisha"],
  "player-aisha": ["player-sneha", "player-tanvi", "player-riya", "player-ananya"],
  "player-omkar": ["player-rohan", "player-kabir", "player-aarav", "player-tanvi"],
  "player-tanvi": ["player-isha", "player-aisha", "player-riya", "player-ananya", "player-sneha", "player-kabir"]
};

const achievementEventPools = {
  Basketball: [
    { title: "Pune University Basketball League", organisation: "Pune University Sports Board" },
    { title: "Pune Inter-College Basketball Cup", organisation: "Pune District Basketball Association" },
    { title: "Balewadi Hoops Invitational", organisation: "Balewadi Sports Complex" },
    { title: "Deccan Basketball Championship", organisation: "Deccan Gymkhana" },
    { title: "Maharashtra College Basketball Championship", organisation: "Maharashtra Sports Council" }
  ],
  Athletics: [
    { title: "Pune District Athletics Meet", organisation: "Pune District Athletics Association" },
    { title: "Pune University Athletics Championship", organisation: "Pune University Sports Board" },
    { title: "Balewadi Track Open", organisation: "Balewadi Sports Complex" },
    { title: "Maharashtra State Athletics Meet", organisation: "Maharashtra Athletics Association" },
    { title: "Pune Marathon Age-Group Race", organisation: "Pune Running Club" }
  ],
  Badminton: [
    { title: "Pune Open Badminton Championship", organisation: "Pune District Badminton Association" },
    { title: "Pune District Badminton League", organisation: "Pune District Badminton Association" },
    { title: "COEP Invitational Shuttle Meet", organisation: "COEP Technological University" },
    { title: "Maharashtra Junior Badminton Championship", organisation: "Maharashtra Badminton Association" },
    { title: "Balewadi Shuttle Open", organisation: "Balewadi Sports Complex" }
  ],
  Swimming: [
    { title: "Pune Aquatic Meet", organisation: "Pune District Swimming Association" },
    { title: "Maharashtra Swimming Trials", organisation: "Maharashtra Swimming Association" },
    { title: "Balewadi Swim Open", organisation: "Balewadi Sports Complex" },
    { title: "Pune District Age-Group Swimming", organisation: "Pune District Swimming Association" },
    { title: "COEP Aquatics Championship", organisation: "COEP Technological University" }
  ],
  Volleyball: [
    { title: "Pune University Volleyball League", organisation: "Pune University Sports Board" },
    { title: "PCCOE Invitational Volleyball Cup", organisation: "PCCOE Akurdi" },
    { title: "Pune District Volleyball Championship", organisation: "Pune District Volleyball Association" },
    { title: "Balewadi Spikers Open", organisation: "Balewadi Sports Complex" },
    { title: "Maharashtra College Volleyball Championship", organisation: "Maharashtra Sports Council" }
  ],
  Soccer: [
    { title: "Pune Inter-College Football Cup", organisation: "Pune University Sports Board" },
    { title: "Pune District Football League", organisation: "Pune District Football Association" },
    { title: "Deccan Football Championship", organisation: "Deccan Gymkhana" },
    { title: "SPPU Football Tournament", organisation: "Savitribai Phule Pune University" },
    { title: "Maharashtra College Football Championship", organisation: "Maharashtra Sports Council" }
  ],
  Tennis: [
    { title: "Pune District Tennis Open", organisation: "Pune District Tennis Association" },
    { title: "Symbiosis Invitational Tennis", organisation: "Symbiosis International University" },
    { title: "Balewadi Hard Court Open", organisation: "Balewadi Sports Complex" },
    { title: "Maharashtra Tennis Ranking Tournament", organisation: "Maharashtra Tennis Association" },
    { title: "Pune University Tennis Championship", organisation: "Pune University Sports Board" }
  ],
  Kabaddi: [
    { title: "Maharashtra Kabaddi Championship", organisation: "Maharashtra Kabaddi Association" },
    { title: "Pune District Kabaddi League", organisation: "Pune District Kabaddi Association" },
    { title: "Pune University Kabaddi Cup", organisation: "Pune University Sports Board" },
    { title: "Balewadi Kabaddi Open", organisation: "Balewadi Sports Complex" },
    { title: "DY Patil Invitational Kabaddi", organisation: "DY Patil College of Engineering" }
  ],
  "Kho Kho": [
    { title: "Pune Kho Kho Championship", organisation: "Pune District Kho Kho Association" },
    { title: "Pune University Kho Kho Cup", organisation: "Pune University Sports Board" },
    { title: "Maharashtra Kho Kho League", organisation: "Maharashtra Kho Kho Association" },
    { title: "COEP Invitational Kho Kho", organisation: "COEP Technological University" },
    { title: "Balewadi Kho Kho Open", organisation: "Balewadi Sports Complex" }
  ],
  Cricket: [
    { title: "Pune T20 Campus Championship", organisation: "Pune University Sports Board" },
    { title: "Pune University Cricket Cup", organisation: "Pune University Sports Board" },
    { title: "Deccan Cricket League", organisation: "Deccan Gymkhana" },
    { title: "Maharashtra College Cricket Championship", organisation: "Maharashtra Cricket Association" },
    { title: "Modern College Invitational T20", organisation: "Modern College of Engineering" }
  ],
  Gymnastics: [
    { title: "Maharashtra Gymnastics Invitational", organisation: "Maharashtra Gymnastics Association" },
    { title: "Pune District Gymnastics Meet", organisation: "Pune District Gymnastics Association" },
    { title: "Balewadi Gymnastics Open", organisation: "Balewadi Sports Complex" },
    { title: "AISSMS Invitational Gymnastics Meet", organisation: "AISSMS COE" },
    { title: "Maharashtra State Gymnastics Championship", organisation: "Maharashtra Gymnastics Association" }
  ],
  Cycling: [
    { title: "Pune Cycling Criterium", organisation: "Pune Cycling Club" },
    { title: "Balewadi Velodrome Open", organisation: "Balewadi Sports Complex" },
    { title: "Maharashtra State Cycling Championship", organisation: "Maharashtra Cycling Association" },
    { title: "Deccan Hill Climb Challenge", organisation: "Deccan Gymkhana" },
    { title: "Pune University Cycling Time Trial", organisation: "Pune University Sports Board" }
  ],
  "Table Tennis": [
    { title: "Pune Table Tennis Open", organisation: "Pune District Table Tennis Association" },
    { title: "Pune University TT Championship", organisation: "Pune University Sports Board" },
    { title: "Balewadi TT League", organisation: "Balewadi Sports Complex" },
    { title: "Maharashtra Junior TT Championship", organisation: "Maharashtra Table Tennis Association" },
    { title: "Modern College TT Invitational", organisation: "Modern College of Engineering" }
  ]
};

const achievementTrophyPool = [
  { title: "{college} Athlete of the Year", detail: "Annual college sports awards", organisation: "{college}" },
  { title: "{college} Sportsperson of the Year", detail: "Annual university sports honours", organisation: "{college}" },
  { title: "Pune University Player of the Season", detail: "Selected by the university sports panel", organisation: "Pune University Sports Board" },
  { title: "{sport} Player of the Tournament", detail: "Best performer across the competition", organisation: "Pune District Sports Association" },
  { title: "Rising Star Award · {sport}", detail: "Recognised as the season's breakthrough athlete", organisation: "Athlivox Academy" },
  { title: "Coach's Award · {sport}", detail: "Leadership, consistency, and team contribution", organisation: "{college}" },
  { title: "Most Valuable Player · {sport}", detail: "Voted MVP by coaches and officials", organisation: "Pune District Sports Association" },
  { title: "Sports Leadership Award", detail: "Captaincy and community sports leadership", organisation: "Maharashtra Sports Council" }
];

const achievementCertificatePool = [
  { title: "First Aid & Sports Safety Certification", detail: "Emergency response and athlete safety", organisation: "Indian Red Cross Society, Pune" },
  { title: "Strength & Conditioning Workshop", detail: "Athlete performance fundamentals", organisation: "Balewadi Performance Lab" },
  { title: "Sports Nutrition Fundamentals", detail: "Fuel, recovery, and hydration planning", organisation: "Athlivox Academy" },
  { title: "Level 1 Coaching Certification · {sport}", detail: "Foundation coaching licence", organisation: "Maharashtra Sports Council" },
  { title: "District Officiating Licence · {sport}", detail: "Certified to officiate district competitions", organisation: "Pune District Sports Association" },
  { title: "Athlete Mental Health & Wellbeing Seminar", detail: "Pressure, focus, and recovery strategies", organisation: "Pune University Sports Board" },
  { title: "Anti-Doping Education Programme", detail: "Clean sport and WADA compliance", organisation: "National Anti-Doping Agency" },
  { title: "Sports Analytics Workshop", detail: "Performance data and video analysis", organisation: "Athlivox Academy" },
  { title: "Media & Communication for Athletes", detail: "Interviews, sponsors, and public speaking", organisation: "Symbiosis Institute of Media" },
  { title: "Grassroots Coaching Certificate · {sport}", detail: "Community coaching and athlete development", organisation: "Sports Authority of India" },
  { title: "Sports Physiotherapy Basics", detail: "Injury prevention and return-to-play", organisation: "Sancheti Institute, Pune" },
  { title: "Leadership in Sport Certificate", detail: "Team culture and captaincy programme", organisation: "Maharashtra Sports Council" }
];

const achievementDatePool = [
  "2026-10-18", "2026-09-27", "2026-09-06", "2026-08-16", "2026-07-26", "2026-07-12",
  "2026-06-21", "2026-05-30", "2026-05-09", "2026-04-19", "2026-03-15", "2026-02-08",
  "2026-01-18", "2025-12-14", "2025-11-23", "2025-10-05", "2025-09-14", "2025-08-24",
  "2025-07-19", "2025-06-08", "2025-05-11", "2025-04-06", "2025-03-02", "2025-02-09",
  "2025-01-26", "2024-12-15", "2024-11-10", "2024-10-06", "2024-09-01", "2024-08-18",
  "2024-07-07", "2024-06-09", "2024-05-05", "2024-04-21", "2024-03-10", "2024-02-11"
];

function achievementDateValue(value) {
  const text = String(value || "").trim();
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const month = text.match(/^([A-Za-z]{3})\s+(\d{4})$/);
  if (month) {
    const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    if (month[1] in months) return Date.UTC(Number(month[2]), months[month[1]], 15);
  }
  const parsed = Date.parse(text);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildAchievementHistory(player, social) {
  const target = {
    Gold: social.achievements.gold,
    Silver: social.achievements.silver,
    Bronze: social.achievements.bronze,
    Trophy: social.achievements.trophies,
    Certificate: social.achievements.certificates
  };
  const history = [];
  const seen = new Set();
  const sportList = player.sports && player.sports.length ? player.sports : ["Athletics"];
  const playerIndex = Math.max(0, players.findIndex(candidate => candidate.name === player.name));
  let dateCursor = (playerIndex * 5) % achievementDatePool.length;
  const usedDates = new Set();

  const nextDate = () => {
    for (let attempt = 0; attempt < achievementDatePool.length; attempt++) {
      const value = achievementDatePool[dateCursor % achievementDatePool.length];
      dateCursor += 1;
      if (!usedDates.has(value)) {
        usedDates.add(value);
        return value;
      }
    }
    return achievementDatePool[dateCursor++ % achievementDatePool.length];
  };

  const add = entry => {
    const key = entry.type + "|" + entry.title;
    if (seen.has(key)) return false;
    seen.add(key);
    history.push(entry);
    return true;
  };

  (social.highlights || []).forEach(item => {
    if (!target[item.type]) return;
    if (history.filter(entry => entry.type === item.type).length >= target[item.type]) return;
    add({
      type: item.type,
      title: item.title,
      date: item.date,
      detail: item.detail || "",
      sport: sportList.find(sport => item.title.toLowerCase().includes(sport.toLowerCase())) || "",
      organisation: ""
    });
  });

  const medalDetails = { Gold: "Champions", Silver: "Runners-up", Bronze: "Third place" };
  ["Gold", "Silver", "Bronze"].forEach(type => {
    let existing = history.filter(entry => entry.type === type).length;
    const candidates = [];
    sportList.forEach(sport => {
      (achievementEventPools[sport] || achievementEventPools.Athletics).forEach(event => {
        candidates.push({ sport, ...event });
      });
    });
    let cursor = playerIndex + existing;
    let attempts = 0;
    while (existing < target[type] && attempts < candidates.length * 2) {
      const candidate = candidates[cursor % candidates.length];
      cursor += 1;
      attempts += 1;
      if (seen.has(type + "|" + candidate.title)) continue;
      const entry = {
        type,
        title: candidate.title,
        date: nextDate(),
        detail: medalDetails[type] + " · " + candidate.sport,
        sport: candidate.sport,
        organisation: candidate.organisation
      };
      if (add(entry)) existing += 1;
    }
  });

  let trophyIndex = playerIndex;
  let trophyCount = history.filter(entry => entry.type === "Trophy").length;
  let trophyAttempts = 0;
  while (trophyCount < target.Trophy && trophyAttempts < achievementTrophyPool.length * 2) {
    const template = achievementTrophyPool[trophyIndex % achievementTrophyPool.length];
    const sport = sportList[trophyIndex % sportList.length];
    trophyIndex += 1;
    trophyAttempts += 1;
    const title = template.title.replace(/\{college\}/g, player.college).replace(/\{sport\}/g, sport);
    if (seen.has("Trophy|" + title)) continue;
    const entry = {
      type: "Trophy",
      title,
      date: nextDate(),
      detail: template.detail.replace(/\{sport\}/g, sport),
      sport,
      organisation: template.organisation.replace(/\{college\}/g, player.college)
    };
    if (add(entry)) trophyCount += 1;
  }

  let certificateIndex = playerIndex + 2;
  let certificateCount = history.filter(entry => entry.type === "Certificate").length;
  let certificateAttempts = 0;
  while (certificateCount < target.Certificate && certificateAttempts < achievementCertificatePool.length * 3) {
    const template = achievementCertificatePool[certificateIndex % achievementCertificatePool.length];
    const sport = sportList[certificateIndex % sportList.length];
    certificateIndex += 1;
    certificateAttempts += 1;
    const title = template.title.replace(/\{sport\}/g, sport);
    if (seen.has("Certificate|" + title)) continue;
    const entry = {
      type: "Certificate",
      title,
      date: nextDate(),
      detail: template.detail.replace(/\{sport\}/g, sport),
      sport,
      organisation: template.organisation
    };
    if (add(entry)) certificateCount += 1;
  }

  history.sort((a, b) => achievementDateValue(b.date) - achievementDateValue(a.date));
  return history;
}

players.forEach(player => {
  const social = playerSocialSeed[player.name];
  if (!social) return;
  player.id = social.id;
  player.achievements = { ...social.achievements };
  player.highlights = social.highlights.map(item => ({ ...item }));
  player.achievementHistory = buildAchievementHistory(player, social);
  player.achievementHistoryVersion = 3;
});

function buildSeedFollows() {
  const base = Date.parse("2026-10-01T09:00:00.000Z");
  const follows = [];
  Object.keys(playerFollowSeed).forEach((followerId, groupIndex) => {
    playerFollowSeed[followerId].forEach((followingId, index) => {
      follows.push({
        followerId,
        followingId,
        createdAt: new Date(base + (groupIndex * 8 + index) * 3600000).toISOString()
      });
    });
  });
  return follows;
}

const reels = [
  {
    id: "reel-1",
    sport: "Basketball",
    emoji: "🏀",
    title: "Half-court buzzer beater",
    caption: "Last-second shot to win the Pune university classic.",
    creator: "Aarav Deshmukh",
    reputation: 4850,
    likes: 1240,
    views: 18400,
    sponsored: false,
    gradient: "linear-gradient(160deg, #F59E0B 0%, #B45309 46%, #1C1917 100%)",
    videoUrl: "/uploads/demo-reel-basketball.mp4",
    mimeType: "video/mp4",
    size: 922730,
    createdBy: "u-aarav",
    likedBy: []
  },
  {
    id: "reel-2",
    sport: "Athletics",
    emoji: "🏃",
    title: "6AM track grind",
    caption: "Sunrise intervals at COEP before the first lecture.",
    creator: "Riya Kulkarni",
    reputation: 6200,
    likes: 892,
    views: 12300,
    sponsored: true,
    gradient: "linear-gradient(160deg, #2563EB 0%, #1E3A8A 52%, #0F172A 100%)",
    videoUrl: "/uploads/demo-reel-sprint.mp4",
    mimeType: "video/mp4",
    size: 2613906,
    createdBy: "u-riya",
    likedBy: []
  },
  {
    id: "reel-3",
    sport: "Swimming",
    emoji: "🏊",
    title: "Underwater turns in slow-mo",
    caption: "Technique check with Coach Patil before the Pune Open.",
    creator: "Ananya Joshi",
    reputation: 4100,
    likes: 2104,
    views: 26700,
    sponsored: false,
    gradient: "linear-gradient(160deg, #06B6D4 0%, #0E7490 46%, #0F172A 100%)",
    videoUrl: "/uploads/demo-reel-swimming.mp4",
    mimeType: "video/mp4",
    size: 3381951,
    likedBy: []
  },
  {
    id: "reel-4",
    sport: "Volleyball",
    emoji: "🏐",
    title: "Match point at the net",
    caption: "Block party in the Pune University League semifinal.",
    creator: "Vivaan Shah",
    reputation: 3100,
    likes: 768,
    views: 9800,
    sponsored: false,
    gradient: "linear-gradient(160deg, #14B8A6 0%, #0F766E 46%, #0F172A 100%)",
    videoUrl: "/uploads/demo-reel-volleyball.mp4",
    mimeType: "video/mp4",
    size: 1502030,
    likedBy: []
  },
  {
    id: "reel-5",
    sport: "Soccer",
    emoji: "⚽",
    title: "Late winner under lights",
    caption: "SPPU's counter-attack seals the Pune Inter-College Cup.",
    creator: "Rohan Shinde",
    reputation: 4400,
    likes: 1345,
    views: 15600,
    sponsored: true,
    gradient: "linear-gradient(160deg, #22C55E 0%, #15803D 52%, #0F172A 100%)",
    videoUrl: "/uploads/demo-reel-football.mp4",
    mimeType: "video/mp4",
    size: 1103065,
    likedBy: []
  },
  {
    id: "reel-6",
    sport: "Cricket",
    emoji: "🏏",
    title: "Straight drive for four",
    caption: "Middle of the bat at the Pune T20 Campus League.",
    creator: "Aisha Khan",
    reputation: 3500,
    likes: 1890,
    views: 22400,
    sponsored: false,
    gradient: "linear-gradient(160deg, #3B82F6 0%, #1D4ED8 48%, #0F172A 100%)",
    videoUrl: "/uploads/demo-reel-cricket.mp4",
    mimeType: "video/mp4",
    size: 1169604,
    likedBy: []
  },
  {
    id: "reel-7",
    sport: "Badminton",
    emoji: "🏸",
    title: "Match point rally",
    caption: "Winning point at the Pune Open quarterfinal.",
    creator: "Riya Kulkarni",
    reputation: 6200,
    likes: 1042,
    views: 13200,
    sponsored: false,
    gradient: "linear-gradient(160deg, #EC4899 0%, #9D174D 46%, #0F172A 100%)",
    videoUrl: "/uploads/demo-reel-badminton.mp4",
    mimeType: "video/mp4",
    size: 2210671,
    createdBy: "u-riya",
    likedBy: []
  },
  {
    id: "reel-8",
    sport: "Kabaddi",
    emoji: "🤼",
    title: "Last-raid escape",
    caption: "A do-or-die raid at the Maharashtra Kabaddi Championship.",
    creator: "Kabir Khan",
    reputation: 4600,
    likes: 976,
    views: 11800,
    sponsored: false,
    gradient: "linear-gradient(160deg, #F43F5E 0%, #9F1239 46%, #0F172A 100%)",
    videoUrl: "/uploads/demo-reel-kabaddi.mp4",
    mimeType: "video/mp4",
    size: 1140603,
    likedBy: []
  },
  {
    id: "reel-9",
    sport: "Tennis",
    emoji: "🎾",
    title: "Clay-court ace",
    caption: "Serve practice before the Pune District Open.",
    creator: "Sneha Iyer",
    reputation: 5100,
    likes: 1125,
    views: 14900,
    sponsored: false,
    gradient: "linear-gradient(160deg, #EA580C 0%, #9A3412 48%, #0F172A 100%)",
    videoUrl: "/uploads/demo-reel-tennis.mp4",
    mimeType: "video/mp4",
    size: 1182294,
    likedBy: []
  }
];

const scouts = [
  { name: "Sandeep Patil", meta: "Maharashtra State Sports Council", score: 9850 },
  { name: "Meera Joshi", meta: "Pune District Sports Office", score: 8420 },
  { name: "Vikram Rao", meta: "Khelo India Talent Desk", score: 7610 },
  { name: "Ananya Iyer", meta: "SAI Pune Centre", score: 6940 },
  { name: "Rahul Deshmukh", meta: "MCA Talent Desk", score: 6120 }
];

const colleges = [
  { name: "AISSMS COE", meta: "AISSMS Sports Council", score: 28450 },
  { name: "COEP Technological University", meta: "COEP Sports Council", score: 26780 },
  { name: "PCCOE Akurdi", meta: "PCCOE Athletics", score: 24110 },
  { name: "MIT-WPU", meta: "MIT-WPU Sports", score: 22840 },
  { name: "VIT Pune", meta: "VIT Sports Association", score: 21820 },
  { name: "Symbiosis International University", meta: "SIU Sports", score: 20450 },
  { name: "Fergusson College", meta: "Fergusson Sports", score: 19620 },
  { name: "SPPU", meta: "Savitribai Phule Pune University Sports", score: 18780 },
  { name: "DY Patil College of Engineering", meta: "DY Patil Sports", score: 17640 },
  { name: "Modern College of Engineering", meta: "Modern Sports", score: 16820 }
];

const users = [
  {
    id: "u-aarav",
    name: "Aarav Deshmukh",
    email: "aarav@athlivox.local",
    passwordHash: demoPasswordHash,
    role: "Player",
    college: "AISSMS COE",
    medals: 5,
    reputation: 4850,
    sports: ["Basketball", "Athletics"],
    initials: "AD"
  },
  {
    id: "u-organizer",
    name: "Sandeep Patil",
    email: "organizer@athlivox.local",
    passwordHash: demoPasswordHash,
    role: "Organizer",
    college: "Maharashtra State Sports Council",
    medals: 0,
    reputation: 9850,
    sports: ["Basketball", "Athletics"],
    initials: "SP"
  },
  {
    id: "u-admin",
    name: "Aditi Sharma",
    email: "admin@athlivox.local",
    passwordHash: demoPasswordHash,
    role: "Admin",
    college: "Athlivox India HQ",
    medals: 0,
    reputation: 0,
    sports: [],
    initials: "AS"
  },
  {
    id: "u-riya",
    name: "Riya Kulkarni",
    email: "riya@athlivox.local",
    passwordHash: demoPasswordHash,
    role: "Player",
    college: "COEP Technological University",
    medals: 8,
    reputation: 6200,
    sports: ["Badminton", "Swimming"],
    initials: "RK"
  },
  {
    id: "u-arjun",
    name: "Arjun Patil",
    email: "arjun@athlivox.local",
    passwordHash: demoPasswordHash,
    role: "Player",
    college: "PCCOE Akurdi",
    medals: 3,
    reputation: 3200,
    sports: ["Volleyball", "Basketball"],
    initials: "AP"
  }
];

const seedRegistrations = {
  "u-aarav": [
    {
      id: "reg-demo-trials",
      eventName: "Inter-College Basketball Trials",
      fullName: "Aarav Deshmukh",
      email: "aarav@athlivox.local",
      college: "AISSMS COE",
      sport: "Basketball",
      phone: "+91 98220 45120",
      notes: "Seeded demo registration for Aarav Deshmukh.",
      status: "Confirmed",
      createdAt: "2026-10-28T17:30:00.000Z"
    }
  ],
  "u-organizer": [],
  "u-admin": [],
  "u-riya": [
    {
      id: "reg-demo-badminton",
      eventName: "Pune Open Doubles Championship",
      fullName: "Riya Kulkarni",
      email: "riya@athlivox.local",
      college: "COEP Technological University",
      sport: "Badminton",
      phone: "+91 98220 45121",
      notes: "Seeded demo registration for Riya Kulkarni.",
      status: "Confirmed",
      createdAt: "2026-10-29T09:15:00.000Z"
    }
  ],
  "u-arjun": [
    {
      id: "reg-demo-volleyball",
      eventName: "Pune University Volleyball Finals",
      fullName: "Arjun Patil",
      email: "arjun@athlivox.local",
      college: "PCCOE Akurdi",
      sport: "Volleyball",
      phone: "+91 98220 45122",
      notes: "Seeded demo registration for Arjun Patil.",
      status: "Confirmed",
      createdAt: "2026-10-30T11:45:00.000Z"
    }
  ]
};

function initialNotifications(user) {
  if (user.role === "Organizer") {
    return [
      { id: "n-org-1", title: "New athlete registration", body: "Ananya Joshi registered for Maharashtra Swimming Trials.", time: "5 minutes ago", icon: "fa-user-plus", tone: "blue", read: false },
      { id: "n-org-2", title: "Event check-in open", body: "Inter-College Basketball Trials check-in is now live.", time: "30 minutes ago", icon: "fa-clipboard-check", tone: "emerald", read: false },
      { id: "n-org-3", title: "Scout digest ready", body: "12 scouts viewed your Balewadi event listings this week.", time: "Yesterday", icon: "fa-binoculars", tone: "amber", read: false }
    ];
  }

  if (user.role === "Admin") {
    return [
      { id: "n-adm-1", title: "System health check", body: "All Athlivox India services are running normally.", time: "2 minutes ago", icon: "fa-server", tone: "emerald", read: false },
      { id: "n-adm-2", title: "Sponsor request", body: "A new sponsor request needs review.", time: "1 hour ago", icon: "fa-handshake-angle", tone: "blue", read: false },
      { id: "n-adm-3", title: "Season report ready", body: "The October performance report is available.", time: "Yesterday", icon: "fa-chart-line", tone: "amber", read: false }
    ];
  }

  return [
    { id: "n-alex-1", title: "Registration confirmed", body: "Your spot for Inter-College Basketball Trials is locked in.", time: "2 minutes ago", icon: "fa-circle-check", tone: "emerald", read: false },
    { id: "n-alex-2", title: "New sponsor request", body: "A sponsor viewed your Athlivox profile.", time: "1 hour ago", icon: "fa-handshake-angle", tone: "blue", read: false },
    { id: "n-alex-3", title: "Leaderboard update", body: "You moved up to #3 at AISSMS COE.", time: "Yesterday", icon: "fa-ranking-star", tone: "amber", read: false }
  ];
}

const seedSponsors = [
  {
    id: "sponsor-sahyadri",
    name: "Sahyadri Sports Foundation",
    initials: "SSF",
    category: "Foundation",
    tagline: "Grassroots grants for Pune's college athletes",
    about: "A Pune-based sports foundation that funds travel, coaching and tournament fees for first-generation athletes. Every grant is reviewed by a panel of coaches and former athletes, with priority for athletes who have no other institutional support.",
    location: "Balewadi, Pune",
    website: "https://sahyadrisports.example",
    contactEmail: "grants@sahyadrisports.example",
    founded: 2014,
    sports: ["Athletics", "Basketball", "Swimming", "Badminton"],
    support: ["Travel & tournament fees", "Coaching stipends", "Equipment"],
    budget: "₹25,000 - ₹1,50,000 per athlete",
    athletesSupported: 120,
    verified: true,
    active: true,
    gradient: "linear-gradient(135deg, #1E3A8A, #2563EB)"
  },
  {
    id: "sponsor-deccan",
    name: "Deccan Track Club",
    initials: "DTC",
    category: "Sports club",
    tagline: "Track and field scholarships with year-round coaching",
    about: "A Deccan Gymkhana club that has supported Pune runners for more than two decades. Its athlete programme combines a monthly coaching stipend with access to the club's track, physio room and weekend race calendar.",
    location: "Deccan Gymkhana, Pune",
    website: "https://deccantrackclub.example",
    contactEmail: "athletes@deccantrackclub.example",
    founded: 1998,
    sports: ["Athletics", "Swimming", "Tennis"],
    support: ["Monthly coaching stipend", "Physiotherapy", "Race entries"],
    budget: "₹15,000 - ₹75,000 per season",
    athletesSupported: 45,
    verified: true,
    active: true,
    gradient: "linear-gradient(135deg, #065F46, #10B981)"
  },
  {
    id: "sponsor-balewadi",
    name: "Balewadi Performance Lab",
    initials: "BPL",
    category: "Academy",
    tagline: "High-performance training partnerships for serious athletes",
    about: "A performance centre next to the Shiv Chhatrapati Sports Complex. It offers selected college athletes structured strength and conditioning, recovery sessions and sport-science testing alongside their regular coaching.",
    location: "Balewadi, Pune",
    website: "https://balewadiperformance.example",
    contactEmail: "partnerships@balewadiperformance.example",
    founded: 2011,
    sports: ["Badminton", "Tennis", "Basketball", "Swimming"],
    support: ["Training access", "Strength & conditioning", "Recovery sessions"],
    budget: "In-kind training + ₹20,000 stipend",
    athletesSupported: 80,
    verified: true,
    active: true,
    gradient: "linear-gradient(135deg, #155E75, #06B6D4)"
  },
  {
    id: "sponsor-bharatshield",
    name: "BharatShield Gear",
    initials: "BSG",
    category: "Equipment brand",
    tagline: "Kit and apparel sponsorships for college teams",
    about: "A Pune sports equipment brand that outfits college teams with match kit, training apparel and footwear. Sponsorships are awarded per season and include a gear allowance the athlete can spend on the brand's catalogue.",
    location: "Hadapsar, Pune",
    website: "https://bharatshield.example",
    contactEmail: "team@bharatshield.example",
    founded: 2018,
    sports: ["Basketball", "Volleyball", "Badminton", "Tennis", "Athletics"],
    support: ["Match kit", "Training apparel", "Footwear"],
    budget: "₹10,000 - ₹60,000 in kit",
    athletesSupported: 60,
    verified: true,
    active: true,
    gradient: "linear-gradient(135deg, #92400E, #F59E0B)"
  },
  {
    id: "sponsor-kalyani",
    name: "Kalyani Mobility",
    initials: "KM",
    category: "Mobility brand",
    tagline: "Travel support for teams competing outside Pune",
    about: "A mobility company that helps college teams travel to district, state and national competitions. Support covers transport, fuel and a share of tournament entry fees for squads that qualify out of Pune.",
    location: "Chinchwad, Pune",
    website: "https://kalyanimobility.example",
    contactEmail: "sports@kalyanimobility.example",
    founded: 2005,
    sports: ["Cricket", "Soccer", "Kabaddi", "Hockey"],
    support: ["Team travel", "Tournament fees", "Fuel support"],
    budget: "₹20,000 - ₹1,00,000 per team",
    athletesSupported: 30,
    verified: true,
    active: true,
    gradient: "linear-gradient(135deg, #4C1D95, #8B5CF6)"
  },
  {
    id: "sponsor-pcst",
    name: "Pune Collegiate Sports Trust",
    initials: "PCST",
    category: "Trust",
    tagline: "Scholarships that keep college athletes in the game",
    about: "A trust set up by Pune college alumni to stop talented athletes from dropping out for financial reasons. It funds tuition-linked sports scholarships, facility access and coaching for athletes across the city's colleges.",
    location: "Shivajinagar, Pune",
    website: "https://punecollegiatesports.example",
    contactEmail: "scholarships@punecollegiatesports.example",
    founded: 2016,
    sports: ["Basketball", "Volleyball", "Athletics", "Kabaddi"],
    support: ["Sports scholarship", "Facility access", "Coaching"],
    budget: "₹30,000 - ₹2,00,000 per athlete",
    athletesSupported: 150,
    verified: true,
    active: true,
    gradient: "linear-gradient(135deg, #9D174D, #EC4899)"
  }
];

function createSeed() {
  const notifications = {};
  users.forEach(user => {
    notifications[user.id] = initialNotifications(user);
  });

  return {
    users,
    events,
    results,
    players,
    reels,
    scouts,
    colleges,
    registrations: JSON.parse(JSON.stringify(seedRegistrations)),
    medalSubmissions: [],
    medalLedger: [],
    notifications,
    sponsors: JSON.parse(JSON.stringify(seedSponsors)),
    sponsorRequests: [],
    follows: buildSeedFollows()
  };
}

function saveDb() {
  const tempFile = DATA_FILE + ".tmp";
  fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), "utf8");
  fs.renameSync(tempFile, DATA_FILE);
}

function loadDb() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    } catch (error) {
      console.warn("Could not read data.json. Creating a fresh demo database.");
    }
  }
  const seed = createSeed();
  fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), "utf8");
  return seed;
}

let db = loadDb();

db.users = db.users || users;
db.events = db.events || events;
db.results = db.results || results;
db.players = db.players || players;
db.scouts = db.scouts || scouts;
db.colleges = db.colleges || colleges;
db.sponsors = Array.isArray(db.sponsors) ? db.sponsors : [];
db.sponsorRequests = Array.isArray(db.sponsorRequests) ? db.sponsorRequests : [];
db.registrations = db.registrations || {};
db.notifications = db.notifications || {};
db.medalSubmissions = Array.isArray(db.medalSubmissions) ? db.medalSubmissions : [];
db.medalLedger = Array.isArray(db.medalLedger) ? db.medalLedger : [];

// Backfill player social profiles for databases created before achievements/follows existed.
let socialMigrated = false;
db.players.forEach(player => {
  const social = playerSocialSeed[player.name];
  if (!social) return;
  if (!player.id) { player.id = social.id; socialMigrated = true; }
  if (!player.achievements || typeof player.achievements !== "object") {
    player.achievements = { ...social.achievements };
    socialMigrated = true;
  }
  if (!Array.isArray(player.highlights) || !player.highlights.length) {
    player.highlights = social.highlights.map(item => ({ ...item }));
    socialMigrated = true;
  }
  const history = Array.isArray(player.achievementHistory) ? player.achievementHistory : [];
  const historyCounts = { Gold: 0, Silver: 0, Bronze: 0, Trophy: 0, Certificate: 0 };
  history.forEach(item => {
    if (historyCounts[item.type] !== undefined) historyCounts[item.type] += 1;
  });
  const expectedAchievements = player.achievements || social.achievements;
  if (
    !history.length ||
    !player.achievementHistoryVersion ||
    player.achievementHistoryVersion < 3 ||
    historyCounts.Gold !== expectedAchievements.gold ||
    historyCounts.Silver !== expectedAchievements.silver ||
    historyCounts.Bronze !== expectedAchievements.bronze ||
    historyCounts.Trophy !== expectedAchievements.trophies ||
    historyCounts.Certificate !== expectedAchievements.certificates
  ) {
    player.achievementHistory = buildAchievementHistory(player, social);
    player.achievementHistoryVersion = 3;
    socialMigrated = true;
  }
});
if (!Array.isArray(db.follows)) {
  db.follows = buildSeedFollows();
  socialMigrated = true;
}
if (socialMigrated) saveDb();

// Older demo builds stored sponsor requests inside the sponsors array.
const legacySponsorRequests = db.sponsors.filter(entry => entry && entry.playerName && !entry.name);
if (legacySponsorRequests.length) {
  legacySponsorRequests.forEach(entry => {
    db.sponsorRequests.push({
      id: entry.id || "sr-" + crypto.randomBytes(5).toString("hex"),
      userId: entry.userId || "",
      athleteName: entry.playerName,
      college: "",
      sponsorId: "",
      sponsorName: "Unassigned sponsor",
      sport: "",
      message: "",
      status: "Pending",
      createdAt: entry.createdAt || new Date().toISOString(),
      reviewedBy: "",
      reviewedByName: "",
      reviewedAt: "",
      reason: ""
    });
  });
  db.sponsors = db.sponsors.filter(entry => !(entry && entry.playerName && !entry.name));
}

// Add newly bundled sponsor partners to databases created before they existed.
const seededSponsorIds = new Set(db.sponsors.map(sponsor => sponsor.id));
seedSponsors.forEach(seed => {
  if (!seededSponsorIds.has(seed.id)) db.sponsors.push({ ...seed });
});

// Keep existing data.json files in sync with newly added demo seed accounts and athletes.
users.forEach(seedUser => {
  const exists = db.users.some(candidate => candidate.id === seedUser.id || String(candidate.email || "").toLowerCase() === seedUser.email.toLowerCase());
  if (!exists) db.users.push({ ...seedUser });
});
players.forEach(seedPlayer => {
  if (!db.players.some(candidate => candidate.name === seedPlayer.name)) db.players.push({ ...seedPlayer });
});
events.forEach(seedEvent => {
  if (!db.events.some(candidate => candidate.name === seedEvent.name)) db.events.push({ ...seedEvent });
});
results.forEach(seedResult => {
  const exists = db.results.some(candidate =>
    candidate.sport === seedResult.sport &&
    candidate.tournament === seedResult.tournament &&
    candidate.date === seedResult.date
  );
  if (!exists) db.results.push({ ...seedResult });
});

db.events = (db.events || events).map(event => {
  const seedEvent = events.find(item => item.name === event.name);
  return {
    ...event,
    venue: (seedEvent && seedEvent.venue) || event.venue || "Venue to be announced",
    address: (seedEvent && seedEvent.address) || event.address || "",
    capacity: Number(event.capacity) || (seedEvent && seedEvent.capacity) || 100
  };
});

db.users.forEach(user => {
  const list = Array.isArray(db.registrations[user.id]) ? db.registrations[user.id] : [];
  db.registrations[user.id] = list.map(entry => {
    if (typeof entry === "string") {
      const event = db.events.find(item => item.name === entry);
      return {
        id: "reg-" + crypto.createHash("sha1").update(user.id + "::" + entry).digest("hex").slice(0, 10),
        eventName: entry,
        fullName: user.name,
        email: user.email,
        college: user.college,
        sport: event ? event.sport : (user.sports[0] || "General"),
        phone: "+91 98220 00000",
        notes: "Imported from the earlier demo registration.",
        status: "Confirmed",
        createdAt: new Date().toISOString()
      };
    }

    if (!entry || !entry.eventName) return null;
    return {
      id: entry.id || "reg-" + crypto.randomBytes(5).toString("hex"),
      eventName: String(entry.eventName),
      fullName: entry.fullName || user.name,
      email: entry.email || user.email,
      college: entry.college || user.college,
      sport: entry.sport || "General",
      phone: entry.phone || "",
      notes: entry.notes || "",
      status: entry.status || "Confirmed",
      createdAt: entry.createdAt || new Date().toISOString()
    };
  }).filter(Boolean);

  if (!Array.isArray(db.notifications[user.id])) db.notifications[user.id] = initialNotifications(user);
});

// Add newly seeded demo registrations to existing databases without duplicating entries.
Object.keys(seedRegistrations).forEach(userId => {
  if (!Array.isArray(db.registrations[userId])) db.registrations[userId] = [];
  seedRegistrations[userId].forEach(seedEntry => {
    const exists = db.registrations[userId].some(entry => entry && entry.eventName === seedEntry.eventName);
    if (!exists) db.registrations[userId].push({ ...seedEntry });
  });
});

db.reels = (db.reels || reels).map((reel, index) => {
  const fallback = reels[index] || reels[0];
  return {
    ...fallback,
    ...reel,
    id: reel.id || fallback.id,
    likedBy: Array.isArray(reel.likedBy) ? reel.likedBy : []
  };
});

// Add any newly bundled demo reels to databases created before they existed.
const seededReelIds = new Set(db.reels.map(reel => reel.id));
reels.forEach(seed => {
  if (seededReelIds.has(seed.id)) return;
  db.reels.push({ ...seed, likedBy: [] });
});

// Attach the bundled demo videos to seeded reels that were created before video support.
const demoReelVideos = {
  "reel-1": { videoUrl: "/uploads/demo-reel-basketball.mp4", mimeType: "video/mp4", size: 922730 },
  "reel-2": { videoUrl: "/uploads/demo-reel-sprint.mp4", mimeType: "video/mp4", size: 2613906 },
  "reel-3": { videoUrl: "/uploads/demo-reel-swimming.mp4", mimeType: "video/mp4", size: 3381951 },
  "reel-4": { videoUrl: "/uploads/demo-reel-volleyball.mp4", mimeType: "video/mp4", size: 1502030 },
  "reel-5": { videoUrl: "/uploads/demo-reel-football.mp4", mimeType: "video/mp4", size: 1103065 },
  "reel-6": { videoUrl: "/uploads/demo-reel-cricket.mp4", mimeType: "video/mp4", size: 1169604 },
  "reel-7": { videoUrl: "/uploads/demo-reel-badminton.mp4", mimeType: "video/mp4", size: 2210671 },
  "reel-8": { videoUrl: "/uploads/demo-reel-kabaddi.mp4", mimeType: "video/mp4", size: 1140603 },
  "reel-9": { videoUrl: "/uploads/demo-reel-tennis.mp4", mimeType: "video/mp4", size: 1182294 }
};
db.reels.forEach(reel => {
  const demo = demoReelVideos[reel.id];
  if (!demo) return;
  if (reel.videoUrl && reel.videoUrl !== demo.videoUrl) return;
  if (fs.existsSync(path.join(UPLOADS_DIR, path.basename(demo.videoUrl)))) {
    Object.assign(reel, demo);
  }
});

// Preserve each athlete's pre-platform career record once, then derive totals from verified results.
db.players.forEach(player => {
  if (!Number.isFinite(player.baseMedals)) player.baseMedals = Number(player.medals) || 0;
  if (!Number.isFinite(player.baseReputation)) player.baseReputation = Number(player.reputation) || 0;
});
recomputeAthleteStats();

saveDb();

const sessions = new Map();

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    college: user.college,
    medals: user.medals,
    reputation: user.reputation,
    sports: user.sports,
    initials: user.initials,
    avatar: user.avatar || ""
  };
}

function initialsFromName(name) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function buildAvatarMap() {
  const map = {};
  db.users.forEach(user => {
    if (user.avatar) map[user.name] = user.avatar;
  });
  return map;
}

function publicReel(reel, viewer) {
  const { likedBy, ...rest } = reel;
  const player = (db.players || []).find(candidate => candidate.name === reel.creator);
  return {
    ...rest,
    creatorId: player ? player.id : "",
    reputation: player ? player.reputation : rest.reputation,
    liked: viewer ? likedBy.includes(viewer.id) : false
  };
}

function getPlayerIdForUser(user) {
  if (!user || user.role !== "Player") return "";
  const player = (db.players || []).find(candidate => candidate.name === user.name);
  return player ? player.id : "";
}

function getFollowingIds(user) {
  const playerId = getPlayerIdForUser(user);
  if (!playerId) return [];
  return db.follows.filter(entry => entry.followerId === playerId).map(entry => entry.followingId);
}

function buildPlayerSocial(player, viewerPlayerId) {
  const followersCount = db.follows.filter(entry => entry.followingId === player.id).length;
  const followingCount = db.follows.filter(entry => entry.followerId === player.id).length;
  return {
    ...player,
    followersCount,
    followingCount,
    isFollowing: viewerPlayerId ? db.follows.some(entry => entry.followerId === viewerPlayerId && entry.followingId === player.id) : false,
    isSelf: viewerPlayerId === player.id
  };
}

function buildPlayersFor(user) {
  const viewerId = getPlayerIdForUser(user);
  return (db.players || []).map(player => buildPlayerSocial(player, viewerId));
}

function getAllRegistrations() {
  return Object.keys(db.registrations).flatMap(userId => {
    const account = db.users.find(candidate => candidate.id === userId);
    const list = Array.isArray(db.registrations[userId]) ? db.registrations[userId] : [];
    return list.map(entry => ({
      ...entry,
      userId,
      userName: account ? account.name : entry.fullName,
      userEmail: account ? account.email : entry.email,
      userRole: account ? account.role : "Player"
    }));
  }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function notifyRole(role, title, body, icon, tone) {
  db.users.filter(candidate => candidate.role === role).forEach(candidate => {
    addNotification(candidate.id, title, body, icon, tone);
  });
}

function buildOrganizerStats() {
  const totalCapacity = db.events.reduce((sum, event) => sum + (Number(event.capacity) || 100), 0);
  const totalRegistered = db.events.reduce((sum, event) => sum + countEventRegistrations(event.name), 0);
  return {
    events: db.events.length,
    registrations: getAllRegistrations().length,
    athletes: db.players.length,
    capacity: totalCapacity,
    registered: totalRegistered,
    fillRate: totalCapacity ? Math.round((totalRegistered / totalCapacity) * 100) : 0
  };
}

function buildAdminStats() {
  const users = db.users;
  return {
    users: users.length,
    players: users.filter(candidate => candidate.role === "Player").length,
    organizers: users.filter(candidate => candidate.role === "Organizer").length,
    admins: users.filter(candidate => candidate.role === "Admin").length,
    events: db.events.length,
    registrations: getAllRegistrations().length,
    reels: db.reels.length,
    sponsors: db.sponsors.filter(sponsor => sponsor.active !== false).length,
    sponsorRequests: db.sponsorRequests.filter(request => request.status === "Pending").length,
    storageBytes: db.reels.reduce((sum, reel) => sum + (Number(reel.size) || 0), 0),
    serverTime: new Date().toISOString()
  };
}

function getNotifications(userId) {
  return db.notifications[userId] || [];
}

function getLikedReelIds(userId) {
  return db.reels.filter(reel => reel.likedBy.includes(userId)).map(reel => reel.id);
}

function getUserRegistrations(userId) {
  return Array.isArray(db.registrations[userId]) ? db.registrations[userId] : [];
}

function getRegisteredEventNames(userId) {
  return getUserRegistrations(userId).map(entry => entry.eventName);
}

function countEventRegistrations(eventName) {
  return Object.keys(db.registrations).reduce((total, userId) => {
    return total + getUserRegistrations(userId)
      .filter(entry => entry.eventName === eventName && entry.status !== "Cancelled")
      .length;
  }, 0);
}

function buildEvents() {
  return db.events.map(event => {
    const capacity = Number(event.capacity) || 100;
    const registeredCount = countEventRegistrations(event.name);
    return {
      ...event,
      capacity,
      registeredCount,
      spotsLeft: Math.max(0, capacity - registeredCount)
    };
  });
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  if (!/^[+()\d\s.-]{7,24}$/.test(value)) return false;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

function buildLeaderboards() {
  return {
    players: db.players
      .map(player => ({ name: player.name, meta: player.college, score: player.reputation }))
      .sort((a, b) => b.score - a.score),
    scouts: db.scouts,
    colleges: db.colleges
  };
}

function medalPointsFor(medal, level) {
  const base = Number(MEDAL_POINTS[medal]) || 0;
  const multiplier = Number(LEVEL_MULTIPLIERS[level]) || 1;
  return Math.round(base * multiplier);
}

function getLedgerForAthlete(name) {
  return (db.medalLedger || []).filter(entry => entry && entry.athleteName === name);
}

function computeAthleteStats(name) {
  const player = db.players.find(candidate => candidate.name === name);
  const baseMedals = player && Number.isFinite(player.baseMedals) ? player.baseMedals : 0;
  const baseReputation = player && Number.isFinite(player.baseReputation) ? player.baseReputation : 0;
  const entries = getLedgerForAthlete(name);
  // Reversed originals still count their original positive points; the linked reversal entry cancels them out.
  const awarded = entries.filter(entry => (entry.status === "Approved" || entry.status === "Reversed") && Number(entry.points) > 0);
  const reversals = entries.filter(entry => entry.status === "Reversal");
  const verifiedMedals = entries.filter(entry => entry.status === "Approved" && entry.medal !== "Participation").length;
  const verifiedPoints = awarded.reduce((sum, entry) => sum + (Number(entry.points) || 0), 0)
    + reversals.reduce((sum, entry) => sum + (Number(entry.points) || 0), 0);

  return {
    baseMedals,
    baseReputation,
    verifiedMedals,
    verifiedPoints,
    medals: baseMedals + verifiedMedals,
    reputation: baseReputation + verifiedPoints
  };
}

function recomputeAthleteStats() {
  db.players.forEach(player => {
    const stats = computeAthleteStats(player.name);
    player.medals = stats.medals;
    player.reputation = stats.reputation;
    const account = db.users.find(candidate => candidate.role === "Player" && candidate.name === player.name);
    if (account) {
      account.medals = stats.medals;
      account.reputation = stats.reputation;
    }
  });
}

function buildPlayerState(user) {
  const notifications = getNotifications(user.id);
  return {
    role: "Player",
    user: publicUser(user),
    playerId: getPlayerIdForUser(user),
    followingIds: getFollowingIds(user),
    events: buildEvents(),
    results: db.results,
    players: buildPlayersFor(user),
    reels: db.reels.map(reel => publicReel(reel, user)),
    sponsors: db.sponsors.filter(sponsor => sponsor.active !== false),
    sponsorRequests: db.sponsorRequests.filter(request => request.userId === user.id),
    leaderboards: buildLeaderboards(),
    registrations: getUserRegistrations(user.id),
    registeredEvents: getRegisteredEventNames(user.id),
    likedReels: getLikedReelIds(user.id),
    medalSubmissions: db.medalSubmissions.filter(entry => entry.athleteName === user.name || entry.userId === user.id),
    medalLedger: db.medalLedger,
    medalSummary: computeAthleteStats(user.name),
    medalConfig: { points: MEDAL_POINTS, levels: LEVEL_MULTIPLIERS },
    notifications,
    unreadNotifications: notifications.filter(item => !item.read).length
  };
}

function buildOrganizerState(user) {
  const notifications = getNotifications(user.id);
  return {
    role: "Organizer",
    user: publicUser(user),
    events: buildEvents(),
    results: db.results,
    players: buildPlayersFor(user),
    sponsors: db.sponsors.filter(sponsor => sponsor.active !== false),
    leaderboards: buildLeaderboards(),
    allRegistrations: getAllRegistrations(),
    stats: buildOrganizerStats(),
    medalSubmissions: db.medalSubmissions.filter(entry => entry.submittedBy === user.id),
    medalLedger: db.medalLedger,
    medalConfig: { points: MEDAL_POINTS, levels: LEVEL_MULTIPLIERS },
    notifications,
    unreadNotifications: notifications.filter(item => !item.read).length
  };
}

function buildAdminState(user) {
  const notifications = getNotifications(user.id);
  return {
    role: "Admin",
    user: publicUser(user),
    events: buildEvents(),
    results: db.results,
    players: buildPlayersFor(user),
    reels: db.reels.map(reel => publicReel(reel, null)),
    users: db.users.map(publicUser),
    allRegistrations: getAllRegistrations(),
    sponsors: db.sponsors,
    sponsorRequests: db.sponsorRequests,
    stats: buildAdminStats(),
    leaderboards: buildLeaderboards(),
    medalSubmissions: db.medalSubmissions,
    medalLedger: db.medalLedger,
    medalConfig: { points: MEDAL_POINTS, levels: LEVEL_MULTIPLIERS },
    notifications,
    unreadNotifications: notifications.filter(item => !item.read).length
  };
}

function buildState(user) {
  let state;
  if (user.role === "Organizer") state = buildOrganizerState(user);
  else if (user.role === "Admin") state = buildAdminState(user);
  else state = buildPlayerState(user);
  state.avatars = buildAvatarMap();
  return state;
}

function addNotification(userId, title, body, icon, tone) {
  const notification = {
    id: "n-" + crypto.randomBytes(4).toString("hex"),
    title,
    body,
    time: "Just now",
    icon,
    tone,
    read: false
  };
  const list = db.notifications[userId] || [];
  db.notifications[userId] = [notification, ...list].slice(0, 20);
}

function getAuthUser(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const session = sessions.get(token);
  if (!session) return null;
  return db.users.find(user => user.id === session.userId) || null;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-store"
  };
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    ...corsHeaders()
  });
  res.end(JSON.stringify(payload));
}

function requireRole(res, user, roles, message) {
  if (roles.includes(user.role)) return true;
  sendJson(res, 403, { error: message });
  return false;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 4 * 1024 * 1024) {
        reject(new Error("Request body is too large."));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Invalid JSON body."));
      }
    });
    req.on("error", reject);
  });
}

function readRawBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on("data", chunk => {
      size += chunk.length;
      if (size > maxBytes) {
        const error = new Error("Request body is too large.");
        error.code = "BODY_TOO_LARGE";
        reject(error);
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function parseMultipart(buffer, contentType) {
  const boundaryMatch = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || "");
  if (!boundaryMatch) throw new Error("The upload is missing a multipart boundary.");

  const boundary = Buffer.from("--" + (boundaryMatch[1] || boundaryMatch[2]).trim());
  const parts = [];
  let cursor = buffer.indexOf(boundary);

  while (cursor !== -1) {
    cursor += boundary.length;
    const marker = buffer.slice(cursor, cursor + 2).toString("utf8");
    if (marker === "--") break;
    if (marker === "\r\n") cursor += 2;

    const next = buffer.indexOf(boundary, cursor);
    if (next === -1) break;

    let part = buffer.slice(cursor, next);
    if (part.slice(-2).toString("utf8") === "\r\n") part = part.slice(0, -2);

    const headerEnd = part.indexOf("\r\n\r\n");
    if (headerEnd !== -1) {
      const headers = part.slice(0, headerEnd).toString("utf8");
      const data = part.slice(headerEnd + 4);
      const nameMatch = /name="([^"]*)"/i.exec(headers);
      const filenameMatch = /filename="([^"]*)"/i.exec(headers);
      const typeMatch = /content-type:\s*([^\r\n]+)/i.exec(headers);
      parts.push({
        name: nameMatch ? nameMatch[1] : "",
        filename: filenameMatch ? filenameMatch[1] : "",
        contentType: typeMatch ? typeMatch[1].trim().toLowerCase() : "",
        data
      });
    }

    cursor = next;
  }

  return parts;
}

function uploadExtension(part) {
  const byType = {
    "video/mp4": ".mp4",
    "video/x-m4v": ".m4v",
    "video/webm": ".webm",
    "video/ogg": ".ogv",
    "video/quicktime": ".mov"
  };
  if (byType[part.contentType]) return byType[part.contentType];
  const fromName = path.extname(part.filename || "").toLowerCase();
  if (/^\.[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  return ".mp4";
}

function serveUpload(req, res, requestedName) {
  let filename = "";
  try {
    filename = decodeURIComponent(requestedName);
  } catch (error) {
    sendJson(res, 400, { error: "Invalid file name." });
    return;
  }

  if (!/^[A-Za-z0-9._-]+$/.test(filename)) {
    sendJson(res, 404, { error: "File not found." });
    return;
  }

  const filePath = path.join(UPLOADS_DIR, filename);
  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) {
      sendJson(res, 404, { error: "File not found." });
      return;
    }

    const type = VIDEO_TYPES[path.extname(filename).toLowerCase()] || "application/octet-stream";
    const headers = {
      ...corsHeaders(),
      "Content-Type": type,
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=3600"
    };

    const range = req.headers.range;
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match) {
        res.writeHead(416, { ...headers, "Content-Range": "bytes */" + stat.size });
        res.end();
        return;
      }

      let start = match[1] ? Number(match[1]) : 0;
      let end = match[2] ? Number(match[2]) : stat.size - 1;
      if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= stat.size) {
        res.writeHead(416, { ...headers, "Content-Range": "bytes */" + stat.size });
        res.end();
        return;
      }

      end = Math.min(end, stat.size - 1);
      res.writeHead(206, {
        ...headers,
        "Content-Range": "bytes " + start + "-" + end + "/" + stat.size,
        "Content-Length": end - start + 1
      });
      if (req.method === "HEAD") {
        res.end();
        return;
      }
      fs.createReadStream(filePath, { start, end }).pipe(res);
      return;
    }

    res.writeHead(200, { ...headers, "Content-Length": stat.size });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    fs.createReadStream(filePath).pipe(res);
  });
}

function serveHtml(res) {
  fs.readFile(HTML_FILE, (error, content) => {
    if (error) {
      sendJson(res, 500, { error: "index.html could not be loaded." });
      return;
    }
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      ...corsHeaders()
    });
    res.end(content);
  });
}

function serveLogo(req, res) {
  fs.readFile(LOGO_FILE, (error, content) => {
    if (error) {
      sendJson(res, 404, { error: "Logo not found." });
      return;
    }
    res.writeHead(200, {
      ...corsHeaders(),
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://" + (req.headers.host || "localhost"));
  const pathname = url.pathname;

  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  if (pathname === "/api/health") {
    sendJson(res, 200, { ok: true, service: "athlivox", time: new Date().toISOString() });
    return;
  }

  if (pathname === "/api/login" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const user = db.users.find(candidate => candidate.email.toLowerCase() === email);

      if (!user || user.passwordHash !== hashPassword(password)) {
        sendJson(res, 401, { error: "Invalid email or password." });
        return;
      }

      const token = crypto.randomBytes(32).toString("hex");
      sessions.set(token, { userId: user.id, createdAt: Date.now() });
      sendJson(res, 200, { token, user: publicUser(user) });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (pathname === "/api/logout" && req.method === "POST") {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    sessions.delete(token);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (pathname.startsWith("/uploads/")) {
    if (req.method !== "GET" && req.method !== "HEAD") {
      sendJson(res, 405, { error: "Method not allowed." });
      return;
    }
    serveUpload(req, res, pathname.slice("/uploads/".length));
    return;
  }

  if (pathname.startsWith("/api/")) {
    const user = getAuthUser(req);
    if (!user) {
      sendJson(res, 401, { error: "Please sign in to continue." });
      return;
    }

    try {
      if (pathname === "/api/me" && req.method === "GET") {
        const notifications = getNotifications(user.id);
        sendJson(res, 200, {
          user: publicUser(user),
          registrations: getUserRegistrations(user.id),
          registeredEvents: getRegisteredEventNames(user.id),
          events: buildEvents(),
          likedReels: getLikedReelIds(user.id),
          notifications,
          unreadNotifications: notifications.filter(item => !item.read).length
        });
        return;
      }

      if (pathname === "/api/state" && req.method === "GET") {
        sendJson(res, 200, buildState(user));
        return;
      }

      if (pathname === "/api/medal-submissions" && req.method === "POST") {
        if (!requireRole(res, user, ["Organizer"], "Only organizer accounts can submit results for verification.")) return;
        const body = await readBody(req);
        const eventName = String(body.eventName || "").trim();
        const athleteName = String(body.athleteName || "").trim();
        const medal = String(body.medal || "").trim();
        const level = String(body.level || "").trim();
        const proofUrl = String(body.proofUrl || "").trim();
        const note = String(body.note || "").trim();
        const event = db.events.find(item => item.name === eventName);
        const player = db.players.find(item => item.name === athleteName);

        if (!event) {
          sendJson(res, 400, { error: "Choose a valid Athlivox event." });
          return;
        }
        if (!player) {
          sendJson(res, 400, { error: "Choose an athlete from the participant pool." });
          return;
        }
        if (!MEDAL_TYPES.includes(medal)) {
          sendJson(res, 400, { error: "Choose a valid result type." });
          return;
        }
        if (!COMPETITION_LEVELS.includes(level)) {
          sendJson(res, 400, { error: "Choose the competition level." });
          return;
        }
        if (proofUrl.length < 4 || proofUrl.length > 500) {
          sendJson(res, 400, { error: "Add a proof link or reference (4-500 characters)." });
          return;
        }
        if (note.length > 300) {
          sendJson(res, 400, { error: "Keep the internal note under 300 characters." });
          return;
        }

        const registered = getAllRegistrations().some(entry =>
          entry.eventName === eventName &&
          (entry.userName === athleteName || entry.fullName === athleteName)
        );
        if (!registered) {
          sendJson(res, 400, { error: athleteName + " is not registered for " + eventName + "." });
          return;
        }

        const duplicate = db.medalSubmissions.find(entry =>
          entry.athleteName === athleteName &&
          entry.eventName === eventName &&
          entry.status !== "Rejected" &&
          entry.status !== "Reversed"
        );
        if (duplicate) {
          sendJson(res, 409, { error: "A result for this athlete and event is already pending or approved." });
          return;
        }

        const now = new Date().toISOString();
        const submission = {
          id: "sub-" + crypto.randomBytes(6).toString("hex"),
          athleteName,
          athleteCollege: player.college,
          userId: (db.users.find(candidate => candidate.role === "Player" && candidate.name === athleteName) || {}).id || null,
          eventName,
          sport: event.sport,
          medal,
          level,
          points: medalPointsFor(medal, level),
          proofUrl,
          note,
          status: "Pending",
          submittedBy: user.id,
          submittedByName: user.name,
          submittedAt: now,
          reviewedBy: null,
          reviewedByName: null,
          reviewedAt: null,
          reason: null,
          ledgerId: null
        };

        db.medalSubmissions.unshift(submission);
        notifyRole(
          "Admin",
          "Result awaiting verification",
          user.name + " submitted " + medal + " for " + athleteName + " at " + eventName + ".",
          "fa-clipboard-check",
          "amber"
        );
        addNotification(
          user.id,
          "Result submitted",
          medal + " for " + athleteName + " at " + eventName + " is waiting for admin verification.",
          "fa-paper-plane",
          "blue"
        );
        saveDb();

        sendJson(res, 201, {
          message: "Result submitted for verification.",
          submission,
          medalSubmissions: db.medalSubmissions.filter(entry => entry.submittedBy === user.id)
        });
        return;
      }

      if (pathname === "/api/medal-verify" && req.method === "POST") {
        if (!requireRole(res, user, ["Admin"], "Only admin accounts can verify results.")) return;
        const body = await readBody(req);
        const submissionId = String(body.submissionId || "").trim();
        const action = String(body.action || "").trim().toLowerCase();
        const reason = String(body.reason || "").trim();
        const submission = db.medalSubmissions.find(entry => entry.id === submissionId);

        if (!submission || submission.status !== "Pending") {
          sendJson(res, 404, { error: "That result is no longer pending verification." });
          return;
        }
        if (action !== "approve" && action !== "reject") {
          sendJson(res, 400, { error: "Choose whether to approve or reject the result." });
          return;
        }
        if (action === "reject" && reason.length < 3) {
          sendJson(res, 400, { error: "Add a short reason for rejecting the result." });
          return;
        }

        const now = new Date().toISOString();
        submission.reviewedBy = user.id;
        submission.reviewedByName = user.name;
        submission.reviewedAt = now;
        submission.reason = action === "reject" ? reason : null;

        const athleteAccount = db.users.find(candidate => candidate.role === "Player" && candidate.name === submission.athleteName);
        const submitter = db.users.find(candidate => candidate.id === submission.submittedBy);

        if (action === "approve") {
          const ledgerEntry = {
            id: "led-" + crypto.randomBytes(6).toString("hex"),
            submissionId: submission.id,
            athleteName: submission.athleteName,
            athleteCollege: submission.athleteCollege,
            userId: submission.userId || (athleteAccount ? athleteAccount.id : null),
            eventName: submission.eventName,
            sport: submission.sport,
            medal: submission.medal,
            level: submission.level,
            points: medalPointsFor(submission.medal, submission.level),
            proofUrl: submission.proofUrl,
            note: submission.note,
            submittedBy: submission.submittedBy,
            submittedByName: submission.submittedByName,
            verifiedBy: user.id,
            verifiedByName: user.name,
            verifiedAt: now,
            status: "Approved",
            reversalOf: null,
            reversalReason: null
          };

          submission.status = "Approved";
          submission.ledgerId = ledgerEntry.id;
          db.medalLedger.unshift(ledgerEntry);
          recomputeAthleteStats();

          if (athleteAccount) {
            addNotification(
              athleteAccount.id,
              "Result verified",
              submission.medal + " at " + submission.eventName + " was verified by " + user.name + ". +" + ledgerEntry.points + " reputation.",
              "fa-medal",
              "emerald"
            );
          }
          if (submitter) {
            addNotification(
              submitter.id,
              "Result approved",
              submission.athleteName + "'s " + submission.medal + " at " + submission.eventName + " is now verified and on the reputation ledger.",
              "fa-circle-check",
              "emerald"
            );
          }

          saveDb();
          sendJson(res, 200, {
            message: submission.medal + " verified for " + submission.athleteName + ". +" + ledgerEntry.points + " reputation.",
            submission,
            ledgerEntry,
            medalSubmissions: db.medalSubmissions,
            medalLedger: db.medalLedger
          });
          return;
        }

        submission.status = "Rejected";
        if (submitter) {
          addNotification(
            submitter.id,
            "Result rejected",
            submission.athleteName + "'s " + submission.medal + " at " + submission.eventName + " was rejected. Reason: " + reason,
            "fa-circle-xmark",
            "rose"
          );
        }
        if (athleteAccount) {
          addNotification(
            athleteAccount.id,
            "Result not verified",
            "A submitted result for " + submission.eventName + " was rejected. Reason: " + reason,
            "fa-circle-xmark",
            "rose"
          );
        }

        saveDb();
        sendJson(res, 200, {
          message: "Result rejected.",
          submission,
          medalSubmissions: db.medalSubmissions,
          medalLedger: db.medalLedger
        });
        return;
      }

      if (pathname === "/api/medal-reverse" && req.method === "POST") {
        if (!requireRole(res, user, ["Admin"], "Only admin accounts can reverse verified results.")) return;
        const body = await readBody(req);
        const ledgerId = String(body.ledgerId || "").trim();
        const reason = String(body.reason || "").trim();
        const original = db.medalLedger.find(entry => entry.id === ledgerId && entry.status === "Approved");

        if (!original) {
          sendJson(res, 404, { error: "That verified result could not be found." });
          return;
        }
        if (reason.length < 3) {
          sendJson(res, 400, { error: "Add a short reason for reversing this result." });
          return;
        }

        const now = new Date().toISOString();
        original.status = "Reversed";
        original.reversalReason = reason;

        const linkedSubmission = db.medalSubmissions.find(entry => entry.id === original.submissionId);
        if (linkedSubmission) {
          linkedSubmission.status = "Reversed";
          linkedSubmission.reason = "Reversed: " + reason;
          linkedSubmission.reviewedBy = user.id;
          linkedSubmission.reviewedByName = user.name;
          linkedSubmission.reviewedAt = now;
        }

        const reversal = {
          id: "led-" + crypto.randomBytes(6).toString("hex"),
          submissionId: original.submissionId,
          athleteName: original.athleteName,
          athleteCollege: original.athleteCollege,
          userId: original.userId,
          eventName: original.eventName,
          sport: original.sport,
          medal: original.medal,
          level: original.level,
          points: -Math.abs(Number(original.points) || 0),
          proofUrl: original.proofUrl,
          note: "Reversal: " + reason,
          submittedBy: original.submittedBy,
          submittedByName: original.submittedByName,
          verifiedBy: user.id,
          verifiedByName: user.name,
          verifiedAt: now,
          status: "Reversal",
          reversalOf: original.id,
          reversalReason: reason
        };

        db.medalLedger.unshift(reversal);
        recomputeAthleteStats();

        const athleteAccount = db.users.find(candidate => candidate.role === "Player" && candidate.name === original.athleteName);
        if (athleteAccount) {
          addNotification(
            athleteAccount.id,
            "Verified result reversed",
            original.medal + " at " + original.eventName + " was reversed by " + user.name + ". Reason: " + reason,
            "fa-rotate-left",
            "rose"
          );
        }
        const submitter = db.users.find(candidate => candidate.id === original.submittedBy);
        if (submitter) {
          addNotification(
            submitter.id,
            "Verified result reversed",
            original.athleteName + "'s " + original.medal + " at " + original.eventName + " was reversed. Reason: " + reason,
            "fa-rotate-left",
            "rose"
          );
        }

        saveDb();
        sendJson(res, 200, {
          message: "Verified result reversed. Reputation has been recalculated.",
          ledgerEntry: reversal,
          original,
          medalLedger: db.medalLedger
        });
        return;
      }

      if (pathname === "/api/profile" && req.method === "PATCH") {
        const body = await readBody(req);
        const name = String(body.name || "").trim();
        const college = String(body.college || "").trim();
        const rawSports = Array.isArray(body.sports) ? body.sports : [];
        const sports = [...new Set(rawSports.map(item => String(item).trim()).filter(item => SPORTS.includes(item)))];
        const avatarProvided = Object.prototype.hasOwnProperty.call(body, "avatar");
        const avatar = avatarProvided ? String(body.avatar || "") : (user.avatar || "");

        if (name.length < 2 || name.length > 60) {
          sendJson(res, 400, { error: "Enter your full name (2-60 characters)." });
          return;
        }
        if (college.length < 2 || college.length > 100) {
          sendJson(res, 400, { error: "Enter your college or club name." });
          return;
        }
        if (user.role === "Player" && sports.length === 0) {
          sendJson(res, 400, { error: "Choose at least one sport." });
          return;
        }
        if (avatar) {
          if (!/^data:image\/(?:png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/i.test(avatar)) {
            sendJson(res, 400, { error: "Upload a PNG, JPG, or WebP profile photo." });
            return;
          }
          if (avatar.length > MAX_AVATAR_CHARS) {
            sendJson(res, 400, { error: "That profile photo is too large. Choose a smaller image." });
            return;
          }
        }
        const nameTaken = db.users.some(candidate => candidate.id !== user.id && candidate.name.toLowerCase() === name.toLowerCase());
        if (nameTaken) {
          sendJson(res, 409, { error: "That athlete name is already in use." });
          return;
        }

        const previousName = user.name;
        user.name = name;
        user.college = college;
        user.sports = sports;
        user.initials = initialsFromName(name);
        if (avatarProvided) user.avatar = avatar;

        const player = db.players.find(candidate => candidate.name === previousName);
        if (player) {
          player.name = name;
          player.college = college;
          player.sports = sports;
        }

        db.medalSubmissions.forEach(entry => {
          if (entry.athleteName === previousName) {
            entry.athleteName = name;
            entry.userId = user.id;
          }
        });
        db.medalLedger.forEach(entry => {
          if (entry.athleteName === previousName) {
            entry.athleteName = name;
            entry.userId = user.id;
          }
        });

        db.reels.forEach(reel => {
          if (reel.createdBy === user.id || (!reel.createdBy && reel.creator === previousName)) {
            reel.creator = name;
            reel.reputation = user.reputation;
          }
        });

        getUserRegistrations(user.id).forEach(entry => {
          entry.fullName = name;
          entry.college = college;
        });

        saveDb();
        sendJson(res, 200, {
          message: "Profile updated.",
          user: publicUser(user),
          players: db.players,
          avatars: buildAvatarMap()
        });
        return;
      }

      if (pathname === "/api/register-event" && req.method === "POST") {
        if (!requireRole(res, user, ["Player"], "Only player accounts can register for events.")) return;
        const body = await readBody(req);
        const eventName = String(body.eventName || "").trim();
        const event = db.events.find(item => item.name === eventName);
        if (!event) {
          sendJson(res, 404, { error: "That event could not be found." });
          return;
        }

        const registrations = getUserRegistrations(user.id);
        const existing = registrations.find(entry => entry.eventName === event.name);
        if (existing) {
          sendJson(res, 409, {
            error: "You are already registered for this event.",
            registration: existing,
            registrations,
            registeredEvents: getRegisteredEventNames(user.id),
            events: buildEvents()
          });
          return;
        }

        const capacity = Number(event.capacity) || 100;
        if (countEventRegistrations(event.name) >= capacity) {
          sendJson(res, 409, { error: "This event is full.", events: buildEvents() });
          return;
        }

        const fullName = String(body.fullName || "").trim();
        const email = String(body.email || "").trim().toLowerCase();
        const college = String(body.college || "").trim();
        const sport = String(body.sport || event.sport).trim();
        const phone = String(body.phone || "").trim();
        const notes = String(body.notes || "").trim();

        if (fullName.length < 2 || fullName.length > 80) {
          sendJson(res, 400, { error: "Enter the athlete's full name (2-80 characters)." });
          return;
        }
        if (!isValidEmail(email)) {
          sendJson(res, 400, { error: "Enter a valid email address." });
          return;
        }
        if (college.length < 2 || college.length > 100) {
          sendJson(res, 400, { error: "Enter your college or club name." });
          return;
        }
        if (!SPORTS.includes(sport)) {
          sendJson(res, 400, { error: "Choose a valid sport." });
          return;
        }
        if (!isValidPhone(phone)) {
          sendJson(res, 400, { error: "Enter a valid phone number (7-15 digits)." });
          return;
        }
        if (notes.length > 500) {
          sendJson(res, 400, { error: "Notes must be 500 characters or fewer." });
          return;
        }
        if (body.agreeToTerms !== true) {
          sendJson(res, 400, { error: "Agree to the Athlivox terms and conditions before registering." });
          return;
        }
        if (body.confirmAccuracy !== true) {
          sendJson(res, 400, { error: "Please confirm that your registration details are accurate." });
          return;
        }

        const registration = {
          id: "reg-" + crypto.randomBytes(5).toString("hex"),
          eventName: event.name,
          fullName,
          email,
          college,
          sport,
          phone,
          notes,
          status: "Confirmed",
          createdAt: new Date().toISOString()
        };

        db.registrations[user.id] = [registration, ...registrations];
        addNotification(user.id, "Registration confirmed", "Your spot for " + event.name + " is confirmed. Registration ID " + registration.id + ".", "fa-circle-check", "emerald");
        notifyRole("Organizer", "New athlete registration", fullName + " registered for " + event.name + " (" + college + ").", "fa-user-plus", "blue");
        saveDb();

        const notifications = getNotifications(user.id);
        sendJson(res, 201, {
          message: "Registered for " + event.name,
          registration,
          registrations: getUserRegistrations(user.id),
          registeredEvents: getRegisteredEventNames(user.id),
          events: buildEvents(),
          notifications,
          unreadNotifications: notifications.filter(item => !item.read).length
        });
        return;
      }

      if (pathname === "/api/cancel-registration" && req.method === "POST") {
        if (!requireRole(res, user, ["Player"], "Only player accounts can cancel registrations.")) return;
        const body = await readBody(req);
        const registrationId = String(body.registrationId || "").trim();
        const registrations = getUserRegistrations(user.id);
        const registration = registrations.find(entry => entry.id === registrationId);
        if (!registration) {
          sendJson(res, 404, { error: "That registration could not be found." });
          return;
        }

        db.registrations[user.id] = registrations.filter(entry => entry.id !== registrationId);
        addNotification(user.id, "Registration cancelled", "Your registration for " + registration.eventName + " was cancelled and the spot was released.", "fa-circle-xmark", "rose");
        notifyRole("Organizer", "Registration cancelled", registration.fullName + " cancelled their spot for " + registration.eventName + ".", "fa-circle-xmark", "rose");
        saveDb();

        const notifications = getNotifications(user.id);
        sendJson(res, 200, {
          message: "Registration cancelled for " + registration.eventName,
          registrations: getUserRegistrations(user.id),
          registeredEvents: getRegisteredEventNames(user.id),
          events: buildEvents(),
          notifications,
          unreadNotifications: notifications.filter(item => !item.read).length
        });
        return;
      }

      if (pathname === "/api/follow" && req.method === "POST") {
        if (!requireRole(res, user, ["Player"], "Only player accounts can follow athletes.")) return;
        const body = await readBody(req);
        const playerId = String(body.playerId || "").trim();
        const action = body.action === "unfollow" ? "unfollow" : "follow";
        const target = db.players.find(candidate => candidate.id === playerId);
        if (!target) {
          sendJson(res, 404, { error: "That athlete could not be found." });
          return;
        }

        const viewerId = getPlayerIdForUser(user);
        if (!viewerId) {
          sendJson(res, 400, { error: "Your athlete profile is not linked to a player record yet." });
          return;
        }
        if (viewerId === playerId) {
          sendJson(res, 400, { error: "You cannot follow yourself." });
          return;
        }

        const existing = db.follows.findIndex(entry => entry.followerId === viewerId && entry.followingId === playerId);
        if (action === "follow" && existing === -1) {
          db.follows.push({ followerId: viewerId, followingId: playerId, createdAt: new Date().toISOString() });
          const targetUser = db.users.find(candidate => candidate.role === "Player" && candidate.name === target.name);
          if (targetUser) {
            addNotification(targetUser.id, "New follower", user.name + " started following you.", "fa-user-plus", "blue");
          }
          saveDb();
        } else if (action === "unfollow" && existing >= 0) {
          db.follows.splice(existing, 1);
          saveDb();
        }

        const player = buildPlayerSocial(target, viewerId);
        sendJson(res, 200, {
          message: action === "follow" ? "Following " + target.name + "." : "Unfollowed " + target.name + ".",
          player,
          followingIds: getFollowingIds(user)
        });
        return;
      }

      if (pathname === "/api/like-reel" && req.method === "POST") {
        if (!requireRole(res, user, ["Player"], "Only player accounts can like reels.")) return;
        const body = await readBody(req);
        const reel = db.reels.find(item => item.id === body.reelId);
        if (!reel) {
          sendJson(res, 404, { error: "That reel could not be found." });
          return;
        }

        const alreadyLiked = reel.likedBy.includes(user.id);
        if (!alreadyLiked) {
          reel.likedBy.push(user.id);
          reel.likes += 1;
          saveDb();
        }

        sendJson(res, 200, {
          alreadyLiked,
          reel: { id: reel.id, likes: reel.likes },
          likedReels: getLikedReelIds(user.id),
          message: alreadyLiked ? "You already liked this reel." : "Reel liked."
        });
        return;
      }

      if (pathname === "/api/reels" && req.method === "POST") {
        if (!requireRole(res, user, ["Player"], "Only player accounts can publish reels.")) return;
        const contentType = req.headers["content-type"] || "";
        if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
          sendJson(res, 415, { error: "Upload the reel as multipart form data." });
          return;
        }

        let raw;
        try {
          raw = await readRawBody(req, MAX_VIDEO_BYTES + 1024 * 1024);
        } catch (error) {
          if (error.code === "BODY_TOO_LARGE") {
            sendJson(res, 413, { error: "Video is too large. Maximum size is 50 MB." });
            return;
          }
          throw error;
        }

        const parts = parseMultipart(raw, contentType);
        const fields = {};
        let videoPart = null;
        parts.forEach(part => {
          if (part.filename) {
            if (part.name === "video") videoPart = part;
          } else {
            fields[part.name] = part.data.toString("utf8");
          }
        });

        const title = String(fields.title || "").trim();
        const caption = String(fields.caption || "").trim();
        const sport = String(fields.sport || "").trim();

        if (title.length < 3 || title.length > 80) {
          sendJson(res, 400, { error: "Give the reel a title between 3 and 80 characters." });
          return;
        }
        if (caption.length < 3 || caption.length > 200) {
          sendJson(res, 400, { error: "Add a caption between 3 and 200 characters." });
          return;
        }
        if (!SPORTS.includes(sport)) {
          sendJson(res, 400, { error: "Choose a valid sport." });
          return;
        }
        if (!videoPart || !videoPart.data.length) {
          sendJson(res, 400, { error: "Choose a video file to upload." });
          return;
        }
        if (!videoPart.contentType.startsWith("video/")) {
          sendJson(res, 400, { error: "The uploaded file must be a video." });
          return;
        }
        if (videoPart.data.length > MAX_VIDEO_BYTES) {
          sendJson(res, 413, { error: "Video is too large. Maximum size is 50 MB." });
          return;
        }

        const extension = uploadExtension(videoPart);
        const filename = "reel-" + crypto.randomBytes(8).toString("hex") + extension;
        fs.writeFileSync(path.join(UPLOADS_DIR, filename), videoPart.data);

        const visual = SPORT_VISUALS[sport];
        const reel = {
          id: "reel-" + crypto.randomBytes(6).toString("hex"),
          sport,
          emoji: visual.emoji,
          title,
          caption,
          creator: user.name,
          reputation: user.reputation,
          likes: 0,
          views: 0,
          sponsored: false,
          gradient: visual.gradient,
          videoUrl: "/uploads/" + filename,
          mimeType: videoPart.contentType,
          originalName: path.basename(videoPart.filename || "video" + extension),
          size: videoPart.data.length,
          createdAt: new Date().toISOString(),
          createdBy: user.id,
          likedBy: []
        };

        db.reels.unshift(reel);
        addNotification(user.id, "Reel published", "Your reel \"" + title + "\" is now live on Athlivox.", "fa-video", "blue");
        notifyRole("Admin", "New reel published", user.name + " published \"" + title + "\" (" + sport + ").", "fa-video", "blue");
        saveDb();

        const notifications = getNotifications(user.id);
        sendJson(res, 201, {
          message: "Reel published.",
          reel: publicReel(reel, user),
          notifications,
          unreadNotifications: notifications.filter(item => !item.read).length
        });
        return;
      }

      const reelMatch = /^\/api\/reels\/([A-Za-z0-9-]+)$/.exec(pathname);

      if (reelMatch && req.method === "PATCH") {
        if (!requireRole(res, user, ["Player"], "Only the player who posted a reel can edit it.")) return;
        const reel = db.reels.find(item => item.id === reelMatch[1]);
        if (!reel) {
          sendJson(res, 404, { error: "That reel could not be found." });
          return;
        }

        const isOwner = reel.createdBy === user.id || (!reel.createdBy && reel.creator === user.name);
        if (!isOwner) {
          sendJson(res, 403, { error: "You can only edit reels you posted." });
          return;
        }

        const body = await readBody(req);
        const title = String(body.title || "").trim();
        const caption = String(body.caption || "").trim();
        const sport = String(body.sport || "").trim();

        if (title.length < 3 || title.length > 80) {
          sendJson(res, 400, { error: "Give the reel a title between 3 and 80 characters." });
          return;
        }
        if (caption.length < 3 || caption.length > 200) {
          sendJson(res, 400, { error: "Add a caption between 3 and 200 characters." });
          return;
        }
        if (!SPORTS.includes(sport)) {
          sendJson(res, 400, { error: "Choose a valid sport." });
          return;
        }

        reel.title = title;
        reel.caption = caption;
        if (reel.sport !== sport) {
          const visual = SPORT_VISUALS[sport];
          reel.sport = sport;
          reel.emoji = visual.emoji;
          reel.gradient = visual.gradient;
        }
        reel.updatedAt = new Date().toISOString();
        saveDb();

        sendJson(res, 200, { message: "Reel updated.", reel: publicReel(reel, user) });
        return;
      }

      if (reelMatch && req.method === "DELETE") {
        const reel = db.reels.find(item => item.id === reelMatch[1]);
        if (!reel) {
          sendJson(res, 404, { error: "That reel could not be found." });
          return;
        }

        const isOwner = reel.createdBy === user.id || (!reel.createdBy && reel.creator === user.name);
        const isAdmin = user.role === "Admin";
        if (!isOwner && !isAdmin) {
          sendJson(res, 403, { error: "You can only delete reels you posted." });
          return;
        }

        let removalReason = "";
        if (isAdmin) {
          const body = await readBody(req);
          removalReason = String(body.reason || "").trim();
          if (removalReason.length < 5 || removalReason.length > 300) {
            sendJson(res, 400, { error: "Add a removal reason between 5 and 300 characters." });
            return;
          }
        }

        if (reel.videoUrl) {
          const filename = path.basename(reel.videoUrl);
          try {
            fs.unlinkSync(path.join(UPLOADS_DIR, filename));
          } catch (error) {
            console.warn("Could not remove uploaded file:", filename);
          }
        }

        db.reels = db.reels.filter(item => item.id !== reel.id);
        const owner = db.users.find(candidate => candidate.id === reel.createdBy)
          || db.users.find(candidate => candidate.name === reel.creator);
        if (isAdmin && owner && owner.id !== user.id) {
          addNotification(
            owner.id,
            "Reel removed by admin",
            "Your reel \"" + reel.title + "\" was removed by an administrator. Reason: " + removalReason,
            "fa-shield-halved",
            "rose"
          );
        }
        saveDb();

        sendJson(res, 200, { ok: true, message: "Reel removed.", reelId: reel.id, reason: removalReason });
        return;
      }

      if (pathname === "/api/sponsor-request" && req.method === "POST") {
        if (!requireRole(res, user, ["Player"], "Only player accounts can request sponsorship.")) return;
        const body = await readBody(req);
        const sponsorId = String(body.sponsorId || "");
        const sponsor = db.sponsors.find(item => item.id === sponsorId && item.active !== false);
        if (!sponsor) {
          sendJson(res, 404, { error: "That sponsor partner could not be found." });
          return;
        }

        const sport = String(body.sport || "").trim();
        const message = String(body.message || "").trim();
        if (!sport) {
          sendJson(res, 400, { error: "Choose the sport you want support for." });
          return;
        }
        if (message.length < 20 || message.length > 600) {
          sendJson(res, 400, { error: "Write a short note between 20 and 600 characters for the sponsor." });
          return;
        }
        const pending = db.sponsorRequests.find(entry => entry.userId === user.id && entry.sponsorId === sponsor.id && entry.status === "Pending");
        if (pending) {
          sendJson(res, 409, { error: "You already have a pending request with this sponsor." });
          return;
        }

        const request = {
          id: "sr-" + crypto.randomBytes(5).toString("hex"),
          userId: user.id,
          athleteName: user.name,
          college: user.college || "",
          sponsorId: sponsor.id,
          sponsorName: sponsor.name,
          sport,
          message,
          status: "Pending",
          createdAt: new Date().toISOString(),
          reviewedBy: "",
          reviewedByName: "",
          reviewedAt: "",
          reason: ""
        };
        db.sponsorRequests.push(request);
        addNotification(user.id, "Sponsorship request sent", "Your request to " + sponsor.name + " is with the Athlivox admin team for review.", "fa-handshake-angle", "blue");
        notifyRole("Admin", "New sponsorship request", user.name + " requested support from " + sponsor.name + " for " + sport + ".", "fa-handshake-angle", "blue");
        saveDb();

        const notifications = getNotifications(user.id);
        sendJson(res, 200, {
          message: "Request sent to " + sponsor.name,
          request,
          notifications,
          unreadNotifications: notifications.filter(item => !item.read).length
        });
        return;
      }

      if (pathname === "/api/sponsor-request-review" && req.method === "POST") {
        if (!requireRole(res, user, ["Admin"], "Only admin accounts can review sponsorship requests.")) return;
        const body = await readBody(req);
        const request = db.sponsorRequests.find(entry => entry.id === String(body.requestId || ""));
        if (!request) {
          sendJson(res, 404, { error: "That sponsorship request could not be found." });
          return;
        }
        if (request.status !== "Pending") {
          sendJson(res, 409, { error: "This request has already been reviewed." });
          return;
        }

        const decision = String(body.decision || "");
        if (!["Approved", "Rejected"].includes(decision)) {
          sendJson(res, 400, { error: "Choose Approved or Rejected." });
          return;
        }
        const reason = String(body.reason || "").trim();
        if (decision === "Rejected" && (reason.length < 5 || reason.length > 300)) {
          sendJson(res, 400, { error: "Add a short reason between 5 and 300 characters." });
          return;
        }

        request.status = decision;
        request.reviewedBy = user.id;
        request.reviewedByName = user.name;
        request.reviewedAt = new Date().toISOString();
        request.reason = reason;

        const approved = decision === "Approved";
        addNotification(
          request.userId,
          approved ? "Sponsorship request approved" : "Sponsorship request declined",
          approved
            ? "Athlivox approved your request with " + request.sponsorName + ". The sponsor will contact you at your registered email."
            : "Your request with " + request.sponsorName + " was declined." + (reason ? " Reason: " + reason : ""),
          "fa-handshake-angle",
          approved ? "emerald" : "rose"
        );
        saveDb();

        const notifications = getNotifications(request.userId);
        sendJson(res, 200, {
          ok: true,
          message: approved ? "Sponsorship request approved." : "Sponsorship request rejected.",
          request,
          notifications,
          unreadNotifications: notifications.filter(item => !item.read).length
        });
        return;
      }

      if (pathname === "/api/notifications/read" && req.method === "POST") {
        const notifications = getNotifications(user.id).map(item => ({ ...item, read: true }));
        db.notifications[user.id] = notifications;
        saveDb();
        sendJson(res, 200, { notifications, unreadNotifications: 0 });
        return;
      }

      sendJson(res, 404, { error: "API route not found." });
    } catch (error) {
      console.error("API error:", error);
      sendJson(res, 500, { error: "The server could not complete that request." });
    }
    return;
  }

  if ((req.method === "GET" || req.method === "HEAD") && pathname === "/athlivox-logo.svg") {
    serveLogo(req, res);
    return;
  }

  if (req.method === "GET" && (pathname === "/" || pathname === "/index.html")) {
    serveHtml(res);
    return;
  }

  if (pathname === "/favicon.ico") {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  sendJson(res, 404, { error: "Not found." });
});

server.on("error", error => {
  if (error.code === "EADDRINUSE") {
    console.error("Port " + PORT + " is already in use. Set PORT to a free port and try again.");
  } else {
    console.error("Server error:", error);
  }
  process.exitCode = 1;
});

server.listen(PORT, () => {
  console.log("");
  console.log("  Athlivox is running at http://localhost:" + PORT);
  console.log("");
  console.log("  Demo accounts (password: " + DEMO_PASSWORD + ")");
  console.log("  Player     aarav@athlivox.local  (AISSMS COE)");
  console.log("  Player     riya@athlivox.local   (COEP Technological University)");
  console.log("  Player     arjun@athlivox.local  (PCCOE Akurdi)");
  console.log("  Organizer  organizer@athlivox.local");
  console.log("  Admin      admin@athlivox.local");
  console.log("");
});
