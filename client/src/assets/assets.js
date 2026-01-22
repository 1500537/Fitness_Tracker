import watchultra from './watch_ultra.png'
import athelete from './atheletee.png'
import watch2 from './watch2.png'
import watch1 from './watch1.png'

export const assets = {
  watchultra,
  athelete,
  watch2,
  watch1,
  // About Images
  img1: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",
  img2: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
  img3: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800",
  img4: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800",


  // 100% Working Professional Athlete Image (Transparent PNG)
  athleteImg: "https://www.pngmart.com/files/13/Fitness-Model-PNG-Transparent-Image.png",
  
  // Backup URL (agar upar wala kabi slow ho): 
  // "https://www.pngmart.com/files/22/Athlete-PNG-File.png"


}

export const aboutData = [
  {
    id: "01",
    title: "Limitless\nTraining",
    desc: "We've taken tracking to a whole new level. Now every rep and every breath's data is in your hands.",
    image: assets.img1,
    accent: "Bio-Sync Tech"
  },
  {
    id: "02",
    title: "Mental\nRecovery",
    desc: "Performance isn't just about the body. Our AI tracks your stress levels and suggests recovery protocols.",
    image: assets.img2,
    accent: "AI Mind Analysis"
  },
  {
    id: "03",
    title: "Urban\nSpeed",
    desc: "Whether cycling or running in the city, our watch tracks every street with precision GPS technology.",
    image: assets.img3,
    accent: "Precision GPS 2.0"
  },
  {
    id: "04",
    title: "Elite\nEndurance",
    desc: "Built for extreme conditions, this watch never leaves your side, whether on mountains or by the sea.",
    image: assets.img4,
    accent: "Ultra Durability"
  }
];

export const pricingData = [
  {
    id: 1,
    name: "Starter",
    tagline: "Foundation of Pulse",
    monthlyPrice: 0,
    annualPrice: 0,
    features: ["Basic Biometrics", "7-Day History", "Community Access", "Mobile App"],
    style: "bg-white border-gray-200 text-black",
    buttonStyle: "bg-black text-white",
    popular: false
  },
  {
    id: 2,
    name: "Pro Performance",
    tagline: "The Athlete's Choice",
    monthlyPrice: 39,
    annualPrice: 29,
    features: ["Advanced AI Insights", "Unlimited History", "Heart Rate Zones", "Recovery Coaching", "Desktop Dashboard"],
    style: "bg-white border-[#FF7222] scale-105 shadow-2xl z-20 text-black",
    buttonStyle: "bg-[#FF7222] text-white",
    popular: true
  },
  {
    id: 3,
    name: "Elite Force",
    tagline: "Ultimate Human Potential",
    monthlyPrice: 99,
    annualPrice: 89,
    features: ["Personal Coach", "Blood Oxygen (SpO2)", "Sleep Lab Access", "Priority Support", "Family Sharing"],
    style: "bg-[#0F0F0F] border-gray-900 text-white",
    buttonStyle: "bg-white text-black",
    popular: false
  }
];
// Existing exports...
export const INITIAL_SUBSCRIPTIONS = [
  { 
    id: 'TX-9901', 
    user: 'Alpha_User', 
    plan: 'Basic', 
    start: new Date(), 
    end: new Date(Date.now() + 10000000), 
    status: 'Active' 
  },
  { 
    id: 'TX-9902', 
    user: 'Ghost_Protocol', 
    plan: 'Premium', 
    start: new Date(), 
    end: new Date(Date.now() + 50000000), 
    status: 'Active' 
  },
  { 
    id: 'TX-9903', 
    user: 'Cyber_Punk', 
    plan: 'Elite Force', 
    start: new Date(), 
    end: new Date(Date.now() + 15000), // 15 Seconds for live demo
    status: 'Expiring' 
  },
];


// ... purani images and data yahan rahengy

export const testimonialsData = [
  {
    id: 1,
    name: "Frank John",
    role: "Freelancer",
    story: "I achieved my fitness goals in record time with personalized workouts. Notifications on my wrist keep me connected, even during workouts. Love it!",
    stars: 4,
    image: assets.athelete // Jo aapne import kiya hua hai
  },
  {
    id: 2,
    name: "Alex Rivera",
    role: "Athlete",
    story: "PulseHeart has changed how I track my recovery. The AI insights are scary accurate. Highly recommended for pros!",
    stars: 5,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"
  }
];

export const contactData = {
  email: "performance@pulse.force",
  phone: "+1 (888) PULSE-FORCE",
  address: "99 Velocity Way, Cyber-Hub, New York, NY",
  socials: [
    { name: "Instagram", link: "#" },
    { name: "Twitter", link: "#" },
    { name: "LinkedIn", link: "#" }
  ]
};
export const eliteData = {

  workouts: [
    { id: 1, name: "Sumo Deadlift", sets: 5, reps: 5, weight: 140, category: "Strength", tag: "Back", notes: "Focus on hip drive" },
    { id: 2, name: "HIIT Sprints", sets: 8, reps: "30s", weight: "N/A", category: "Cardio", tag: "Fat Loss", notes: "1 min rest" }
  ],
  exerciseLibrary: {
    Strength: ["Bench Press", "Sumo Deadlift", "Squats", "Overhead Press", "Barbell Row"],
    Cardio: ["HIIT Sprints", "Rowing", "Cycling", "Jump Rope", "Treadmill"],
    Mobility: ["Deep Squat Hold", "Cat-Cow", "Shoulder Dislocates", "Pigeon Pose"],
    Endurance: ["Long Distance Run", "Swimming", "Burpees", "Mountain Climbers"]
  },
  nutrition: [
    { id: 1, type: "Breakfast", food: "Oatmeal & Whey", calories: 450, macros: { p: 35, c: 55, f: 10 } },
    { id: 2, type: "Lunch", food: "Chicken & Quinoa", calories: 650, macros: { p: 50, c: 60, f: 15 } }
  ],
  progress: [
    { date: 'Mon', weight: 80, performance: 70, chest: 105 },
    { date: 'Wed', weight: 79.5, performance: 85, chest: 105.5 },
    { date: 'Fri', weight: 79.2, performance: 95, chest: 106 }
  ]
};

export const nutritionData = {
  dailyTarget: { calories: 3000, protein: 220, carbs: 350, fats: 80 },
  initialMeals: [
    { id: 1, name: 'Whey Isolate + Oats', protein: 40, carbs: 55, fats: 8, time: '08:00 AM', type: 'Breakfast' },
    { id: 2, name: 'Grilled Chicken & Quinoa', protein: 55, carbs: 45, fats: 12, time: '01:30 PM', type: 'Lunch' },
  ]
};
export const progressAsset = {
  initialHistory: [
    { id: 1, date: '01/12', weight: 85, bench: 100, run: 15, waist: 34, score: 72 },
    { id: 2, date: '15/12', weight: 83, bench: 105, run: 14, waist: 33, score: 78 },
    { id: 3, date: '30/12', weight: 81, bench: 110, run: 12, waist: 32, score: 85 },
  ],
  radarLabels: [
    { key: 'bench', label: 'STRENGTH' },
    { key: 'run', label: 'SPEED' },
    { key: 'weight', label: 'LEAN' },
    { key: 'waist', label: 'CORE' },
    { key: 'score', label: 'VITALITY' }
  ]
};
export const dashboardData = {
  tabs: [
    { id: 'Workouts', icon: '🔥' },
    { id: 'Nutrition', icon: '🥗' },
    { id: 'Progress', icon: '📈' }
  ],
  stats: [
    { label: 'Neural Status', val: 'Active', color: 'text-emerald-400' },
    { label: 'Load Factor', val: '82%', color: 'text-orange-500' },
    { label: 'Sync Rate', val: '0.01ms', color: 'text-blue-400' },
    { label: 'Core Temp', val: 'Normal', color: 'text-white' }
  ]
};
export const progressAssets = {
  initialHistory: [
    { id: 1, date: '01/12/2025', weight: 85, bench: 100, run: 15, waist: 34, volume: 4500, bf: 22 },
    { id: 2, date: '15/12/2025', weight: 83, bench: 105, run: 14, waist: 33, volume: 4800, bf: 20 },
    { id: 3, date: '30/12/2025', weight: 81, bench: 110, run: 12, waist: 32, volume: 5200, bf: 18 },
  ],
  analyticsTheme: {
    primary: '#FF7222',
    secondary: '#3b82f6',
    bg: '#020202'
  }
};
// assets.js
export const AI_AVATARS = {
  trainer: "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=300&h=300&auto=format&fit=crop" // Professional Fitness Trainer
};

// assets.js
export const COACH_INTEL = {
  trainerImage: athelete, // Professional Trainer/Builder
  suggestions: {
    surplus_high_protein: [
      "Current fuel levels optimal for hypertrophy. Focus on progressive overload in today's heavy sets.",
      "Anabolic window is peak. Ensure 8 hours of REM sleep for maximum fiber repair.",
      "High protein detected. Maintain hydration to support renal processing of amino acids."
    ],
    surplus_low_protein: [
      "Caloric surplus detected but nitrogen balance is suboptimal. Increase lean protein to prevent fat gain.",
      "Energy high, building blocks low. Deploy 30g whey or 150g chicken to hit growth targets.",
      "Warning: High carb surplus without protein sync leads to insulin resistance. Balance the load."
    ],
    deficit_high_protein: [
      "Incineration active. High protein is shielding muscle mass from catabolism. Stay the course.",
      "Fat oxidation at peak. If lethargy hits, consider a 50g complex carb 'refeed' tomorrow.",
      "Elite conditioning protocol detected. Your muscle-to-fat ratio is trending towards stage-ready."
    ],
    deficit_low_protein: [
      "CRITICAL: Muscle tissue at risk. Increase protein immediately to prevent catabolic breakdown.",
      "Deficit too steep for current protein intake. Body may scavenge muscle for energy. Adjust fuel.",
      "Emergency protocol: Add BCAA or Casein to maintain current lean mass during this cut."
    ],
    neutral: [
      "System stabilized at maintenance. Good for strength retention and recovery cycles.",
      "Baseline fuel levels reached. Awaiting mission parameters for growth or cut phase.",
      "Nutrient timing is key. Ensure your largest carb meal is post-workout for glycogen reload."
    ]
  }
};
export const athlete = assets.athleteImg;

//admin dummydata
// --- FITNESS & BUSINESS CORE ASSETS ---

// 1. TOP LEVEL STATS (Cards)
export const SYSTEM_STATS = [
  { 
    id: 1, 
    metric: 'users', 
    label: "Total_User_Base", 
    value: "12,402", 
    change: "+18%", 
    trend: "up", 
    color: "#FF7222", 
    sub: "Verified_Accounts",
    valueSuffix: "" 
  },
  { 
    id: 2, 
    metric: 'active', 
    label: "Active_Realtime", 
    value: "2,842", 
    change: "Live", 
    trend: "up", 
    color: "#00F0FF", 
    sub: "User_Engagement",
    valueSuffix: "" 
  },
  { 
    id: 3, 
    metric: 'workouts', 
    label: "Workout_Library", 
    value: "148", 
    change: "+12", 
    trend: "up", 
    color: "#AD00FF", 
    sub: "Premium_Content",
    valueSuffix: "Plans" 
  },
  { 
    id: 4, 
    metric: 'revenue', 
    label: "Plans_Revenue", 
    value: "84.2", 
    change: "+24%", 
    trend: "up", 
    color: "#00FF66", 
    sub: "Fiscal_Growth",
    valueSuffix: "k" 
  },
];

// 2. HISTORICAL CANDLESTICK DATA (Date-wise)
// Format: Date, Day, Open, Close, High, Low
export const HISTORICAL_DATA = {
  users: [
    { date: '2026-01-12', day: 'Mon', open: 11000, close: 11500, high: 11800, low: 10800 },
    { date: '2026-01-13', day: 'Tue', open: 11500, close: 11200, high: 12000, low: 11000 },
    { date: '2026-01-14', day: 'Wed', open: 11200, close: 11800, high: 12200, low: 11000 },
    { date: '2026-01-15', day: 'Thu', open: 11800, close: 12100, high: 12500, low: 11600 },
    { date: '2026-01-16', day: 'Fri', open: 12100, close: 11900, high: 12300, low: 11800 },
    { date: '2026-01-17', day: 'Sat', open: 11900, close: 12300, high: 12600, low: 11700 },
    { date: '2026-01-18', day: 'Sun', open: 12300, close: 12402, high: 12800, low: 12100 },
  ],
  active: [
    { date: '2026-01-12', day: 'Mon', open: 2100, close: 2400, high: 2600, low: 2000 },
    { date: '2026-01-13', day: 'Tue', open: 2400, close: 2200, high: 2500, low: 2100 },
    { date: '2026-01-14', day: 'Wed', open: 2200, close: 2600, high: 2800, low: 2150 },
    { date: '2026-01-15', day: 'Thu', open: 2600, close: 2800, high: 2900, low: 2500 },
    { date: '2026-01-16', day: 'Fri', open: 2800, close: 2500, high: 2850, low: 2400 },
    { date: '2026-01-17', day: 'Sat', open: 2500, close: 2700, high: 2900, low: 2450 },
    { date: '2026-01-18', day: 'Sun', open: 2700, close: 2842, high: 3000, low: 2600 },
  ],
  workouts: [
    { date: '2026-01-12', day: 'Mon', open: 120, close: 130, high: 135, low: 115 },
    { date: '2026-01-13', day: 'Tue', open: 130, close: 125, high: 132, low: 120 },
    { date: '2026-01-14', day: 'Wed', open: 125, close: 135, high: 140, low: 122 },
    { date: '2026-01-15', day: 'Thu', open: 135, close: 140, high: 145, low: 130 },
    { date: '2026-01-16', day: 'Fri', open: 140, close: 138, high: 142, low: 135 },
    { date: '2026-01-17', day: 'Sat', open: 138, close: 145, high: 148, low: 136 },
    { date: '2026-01-18', day: 'Sun', open: 145, close: 148, high: 152, low: 142 },
  ],
  revenue: [
    { date: '2026-01-12', day: 'Mon', open: 65.5, close: 72.1, high: 75.0, low: 62.0 },
    { date: '2026-01-13', day: 'Tue', open: 72.1, close: 68.4, high: 74.0, low: 67.0 },
    { date: '2026-01-14', day: 'Wed', open: 68.4, close: 78.9, high: 81.0, low: 66.0 },
    { date: '2026-01-15', day: 'Thu', open: 78.9, close: 80.2, high: 83.5, low: 76.0 },
    { date: '2026-01-16', day: 'Fri', open: 80.2, close: 77.5, high: 82.0, low: 75.0 },
    { date: '2026-01-17', day: 'Sat', open: 77.5, close: 82.3, high: 85.0, low: 76.0 },
    { date: '2026-01-18', day: 'Sun', open: 82.3, close: 84.2, high: 89.0, low: 80.0 },
  ]
};

// 3. TRANSACTION & ACTIVITY LOGS
export const RECENT_LOGS = [
  { 
    id: "TX-902", 
    user: "Zane_Alpha", 
    action: "Premium_Plan_Sync", 
    status: "Paid", 
    time: "2m ago", 
    amount: "$199.00" 
  },
  { 
    id: "TX-441", 
    user: "Sarah_Core", 
    action: "Personal_Training", 
    status: "Paid", 
    time: "14m ago", 
    amount: "$50.00" 
  },
  { 
    id: "TX-102", 
    user: "Guest_User", 
    action: "Library_Access", 
    status: "Denied", 
    time: "1h ago", 
    amount: "$0.00" 
  },
  { 
    id: "TX-883", 
    user: "Iron_Mike", 
    action: "Annual_Sub", 
    status: "Paid", 
    time: "3h ago", 
    amount: "$899.00" 
  },
];

// 4. WORKOUT CATEGORIES (For future use in UI)
export const WORKOUT_TYPES = [
  { label: "Strength", count: 45, icon: "Dumbbell" },
  { label: "Cardio", count: 32, icon: "Activity" },
  { label: "Recovery", count: 21, icon: "Heart" },
  { label: "Yoga", count: 50, icon: "Zap" },
];

//user dummydata in admin
export const USERS_LIST = [
  {
    id: "UID-7782",
    username: "Muhammad Umar",
    email: "muhammadumar.edu7@gmail.com",
    image: "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy51bnNwbGFzaC5jb20vcGhvdG8tMTUzNTc1OTc4NDIzMC1hMTlhYmNmOWFkM2Q/dz0xMDAmZz04MCJ9",
    pricing: "starter",
    role: "user",
    isBanned: false
  },
  {
    id: "UID-8821",
    username: "Sarah Khan",
    email: "sarah.fitness@gmail.com",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    pricing: "pro",
    role: "user",
    isBanned: false
  }
];