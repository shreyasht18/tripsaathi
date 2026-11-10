// ALL values below are approximate / sample. Verify on Google Maps before the demo:
// coordinates (lat, lng), entry cost, opening hours (hrs = [open minutes, close minutes]).
// Example: hrs: [600, 1020] means 10:00 AM to 5:00 PM.
const START = { name: "Central Bus Stand", lat: 15.8575, lng: 74.5128 };

// img = file inside the images/ folder (optional). If the file is missing, no photo is shown.
const PLACES = [
  { name: "Belagavi Fort & Kamal Basti", img: "fort.jpg", lat: 15.8582, lng: 74.5190,
    dur: 90, cost: 0, walk: 2, step: false, tags: ["history", "culture"], closedDay: -1, hrs: [360, 1080],
    tip: "The Kamal Basadi main hall is reached by steps. Mornings are cooler. Hours (sample): 6 AM to 6 PM." },
  { name: "Kapileshwar Temple", img: "kapileshwar.jpg", lat: 15.8499, lng: 74.5084,
    dur: 60, cost: 0, walk: 1, step: true, tags: ["culture", "spiritual"], closedDay: -1, hrs: [360, 1200],
    tip: "Dress modestly and leave footwear at the entrance, as in most temples. Hours (sample): 6 AM to 8 PM." },
  { name: "Rani Chennamma Circle", img: "rani.jpg", lat: 15.8541, lng: 74.5062,
    dur: 30, cost: 0, walk: 1, step: true, tags: ["history"], closedDay: -1, hrs: [0, 1440],
    tip: "A roadside landmark, good for a quick photo. Take care with traffic." },
  { name: "Vaccine Depot Lake & Park", img: "lake.jpg", lat: 15.8658, lng: 74.5222,
    dur: 60, cost: 20, walk: 1, step: true, tags: ["nature", "kids"], closedDay: -1, hrs: [360, 1140],
    tip: "A good place to sit and rest between sights. Hours and entry fee (sample): 6 AM to 7 PM, Rs 20." },
  { name: "Military Mahadev Temple", img: "mahadev.jpg", lat: 15.8698, lng: 74.5330,
    dur: 45, cost: 0, walk: 1, step: true, tags: ["spiritual", "history"], closedDay: -1, hrs: [360, 1200],
    tip: "A quiet temple stop. Carry drinking water. Hours (sample): 6 AM to 8 PM." },

  // Famous snack and sweet stops (food: true)
  { name: "Shree Purohit Kunda", img: "kunda.jpg", food: true, lat: 15.8470, lng: 74.5035,
    dur: 25, cost: 150, walk: 1, step: true, tags: ["food"], closedDay: -1, hrs: [540, 1290],
    special: "Belagavi Kunda, the city's famous milk sweet. Buy a box to take home.",
    tip: "Hours (sample): 9 AM to 9:30 PM. Prices are approximate." },
  { name: "All India Bhel House (Camp)", food: true, lat: 15.8625, lng: 74.5035,
    dur: 30, cost: 150, walk: 1, step: true, tags: ["food"], closedDay: -1, hrs: [600, 1320],
    special: "Chaat, sweets and desserts near the Camp area.",
    tip: "Hours (sample): 10 AM to 10 PM. Ask about spice level when you order." },
  { name: "Sharma Sweets & Restaurant", food: true, lat: 15.8580, lng: 74.5075,
    dur: 25, cost: 100, walk: 1, step: true, tags: ["food"], closedDay: -1, hrs: [480, 1320],
    special: "Known for Belagavi-style masala doodh (spiced milk).",
    tip: "Hours (sample): 8 AM to 10 PM." }
];

// Lunch and dinner places. cost = approx per person in Rs.
const MEALS = [
  { name: "Hotel Amar (Tilakwadi)", lat: 15.8330, lng: 74.5110, dur: 60, cost: 250, veg: true, meal: true, walk: 1, step: true,
    special: "Vegetarian thali and South Indian dishes.",
    tip: "Go a little before 1 PM to avoid the lunch rush. Prices are approximate." },
  { name: "Hotel Panchamruth Pure Veg", lat: 15.8560, lng: 74.5095, dur: 60, cost: 200, veg: true, meal: true, walk: 1, step: true,
    special: "Pure veg meals at pocket-friendly prices.",
    tip: "A budget-friendly option for groups. Prices are approximate." },
  { name: "Niyaaz Restaurant (Tilakwadi)", lat: 15.8345, lng: 74.5120, dur: 60, cost: 300, veg: false, meal: true, walk: 1, step: true,
    special: "Known for chicken and mutton biryani and kebabs.",
    tip: "Portions can be large, so sharing works well. Prices are approximate." }
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
