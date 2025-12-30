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
    desc: "Humne tracking ko ek naye level par pohanchaya hai. Ab har rep aur har saans ka data aapke hath mein hai.",
    image: assets.img1,
    accent: "Bio-Sync Tech"
  },
  {
    id: "02",
    title: "Mental\nRecovery",
    desc: "Performance sirf body se nahi hoti. Humara AI aapke stress levels ko track kar ke recovery suggest karta hai.",
    image: assets.img2,
    accent: "AI Mind Analysis"
  },
  {
    id: "03",
    title: "Urban\nSpeed",
    desc: "City mein cycling ho ya running, humari watch precision GPS ke sath har gali ka track rakhti hai.",
    image: assets.img3,
    accent: "Precision GPS 2.0"
  },
  {
    id: "04",
    title: "Elite\nEndurance",
    desc: "Extreme conditions ke liye bani ye watch aapka sath kabhi nahi chorti, chahe pahar ho ya samundar.",
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