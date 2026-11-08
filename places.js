// Coordinates, timings, prices and "special" notes are approximate.
// Check each one on Google Maps before your demo and fix what is wrong.
const START = { name: "Central Bus Stand", lat: 15.8575, lng: 74.5128 };

// img = file inside the images/ folder (optional). If the file is missing, no photo is shown.
const PLACES = [
  { name: "Belagavi Fort & Kamal Basti", img: "fort.jpg", lat: 15.8582, lng: 74.5190,
    dur: 90, cost: 0, walk: 2, step: false, tags: ["history", "culture"], closedDay: -1,
    tip: "Paths inside are mostly flat, but Kamal Basti has a few steps. Go in the morning for cooler weather and better photos." },
  { name: "Kapileshwar Temple", img: "kapileshwar.jpg", lat: 15.8499, lng: 74.5084,
    dur: 60, cost: 0, walk: 1, step: true, tags: ["culture", "spiritual"], closedDay: -1,
    tip: "Easy entry with a shaded area to sit and rest. Keep footwear at the entrance and dress modestly." },
  { name: "Rani Chennamma Circle", img: "rani.jpg", lat: 15.8541, lng: 74.5062,
    dur: 30, cost: 0, walk: 1, step: true, tags: ["history"], closedDay: -1,
    tip: "A quick photo stop on the main road. Take care with traffic when crossing." },
  { name: "Vaccine Depot Lake & Park", img: "lake.jpg", lat: 15.8658, lng: 74.5222,
    dur: 60, cost: 20, walk: 1, step: true, tags: ["nature", "kids"], closedDay: -1,
    tip: "Shaded lawns and benches make it a good rest stop for kids and elders. Evenings are the most pleasant." },
  { name: "Military Mahadev Temple", img: "mahadev.jpg", lat: 15.8698, lng: 74.5330,
    dur: 45, cost: 0, walk: 1, step: true, tags: ["spiritual", "history"], closedDay: -1,
    tip: "A calm temple with a short walk from the gate. Carry a water bottle." },
  { name: "Belgaum Heritage Museum", img: "museum.jpg", lat: 15.8512, lng: 74.5143,
    dur: 60, cost: 30, walk: 1, step: true, tags: ["history", "culture", "kids"], closedDay: 1, // 1 = Monday
    tip: "Indoors, so it is a good option in heat or rain. The sample data marks it closed on Mondays; confirm before going." },

  // Famous snack and sweet stops (food: true)
  { name: "Shree Purohit Kunda", img: "kunda.jpg", food: true, lat: 15.8470, lng: 74.5035,
    dur: 25, cost: 150, walk: 1, step: true, tags: ["food"], closedDay: -1,
    special: "Belagavi Kunda, the city's famous milk sweet. Buy a box to take home.",
    tip: "Kunda is best fresh. Ask for a small taste before buying a big box." },
  { name: "All India Bhel House (Camp)", food: true, lat: 15.8625, lng: 74.5035,
    dur: 30, cost: 150, walk: 1, step: true, tags: ["food"], closedDay: -1,
    special: "Chaat, sweets and desserts. A popular street-food style stop near Camp area.",
    tip: "Ask for spice level before you order." },
  { name: "Sharma Sweets & Restaurant", food: true, lat: 15.8580, lng: 74.5075,
    dur: 25, cost: 100, walk: 1, step: true, tags: ["food"], closedDay: -1,
    special: "Known for Belagavi-style masala doodh (spiced milk).",
    tip: "A good short break between sights." }
];

// Lunch and dinner places. cost = approx per person in Rs.
const MEALS = [
  { name: "Hotel Amar (Tilakwadi)", lat: 15.8330, lng: 74.5110, dur: 60, cost: 250, veg: true, meal: true, walk: 1, step: true,
    special: "Vegetarian thali and South Indian dishes. A long-time local favourite.",
    tip: "Gets busy at lunch. Go a little before 1 PM." },
  { name: "Hotel Panchamruth Pure Veg", lat: 15.8560, lng: 74.5095, dur: 60, cost: 200, veg: true, meal: true, walk: 1, step: true,
    special: "Pure veg meals at pocket-friendly prices, loved by locals.",
    tip: "Good value for students and big groups." },
  { name: "Niyaaz Restaurant (Tilakwadi)", lat: 15.8345, lng: 74.5120, dur: 60, cost: 300, veg: false, meal: true, walk: 1, step: true,
    special: "Famous for chicken and mutton biryani and kebabs.",
    tip: "Try the dum biryani. Portions are big, so share." }
];

const TAKEHOME = [
  "Belagavi Kunda: the city's signature milk sweet",
  "Gokak Karadantu: a chewy nut and dry-fruit sweet from nearby Gokak",
  "Belagavi masala doodh: spiced milk, best enjoyed there",
  "Jolada rotti (jowar flatbread) with spicy curries: a North Karnataka meal to try"
];

const PHRASES = [
  ["ನಮಸ್ಕಾರ", "Namaskara", "Hello"],
  ["ಎಷ್ಟು?", "Eshtu?", "How much?"],
  ["ಮೀಟರ್ ಹಾಕಿ", "Meter haaki", "Please use the meter"],
  ["ಇಲ್ಲಿ ನಿಲ್ಲಿಸಿ", "Illi nillisi", "Stop here"],
  ["ಧನ್ಯವಾದ", "Dhanyavaada", "Thank you"]
];