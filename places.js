// Sample data (illustrative). Verify timings and entry fees before the final demo.
const START = { name: "Central Bus Stand", lat: 15.8575, lng: 74.5128 };

const PLACES = [
  {
    name: "Belagavi Fort & Kamal Basti",
    lat: 15.8582, lng: 74.5190,
    dur: 90, cost: 0, walk: 2, step: false,
    tags: ["history", "culture"], closedDay: -1,
    tip: "Paths inside are mostly flat, but Kamal Basti has a few steps. Go in the morning for cooler weather and better photos."
  },
  {
    name: "Kapileshwar Temple",
    lat: 15.8499, lng: 74.5084,
    dur: 60, cost: 0, walk: 1, step: true,
    tags: ["culture", "spiritual"], closedDay: -1,
    tip: "Easy entry with a shaded area to sit and rest. Keep footwear at the entrance and dress modestly."
  },
  {
    name: "Rani Chennamma Circle",
    lat: 15.8541, lng: 74.5062,
    dur: 30, cost: 0, walk: 1, step: true,
    tags: ["history"], closedDay: -1,
    tip: "A quick photo stop on the main road. Take care with traffic when crossing."
  },
  {
    name: "Vaccine Depot Lake & Park",
    lat: 15.8658, lng: 74.5222,
    dur: 60, cost: 20, walk: 1, step: true,
    tags: ["nature", "kids"], closedDay: -1,
    tip: "Shaded lawns and benches make it a good rest stop for kids and elders. Evenings are the most pleasant."
  },
  {
    name: "Military Mahadev Temple",
    lat: 15.8698, lng: 74.5330,
    dur: 45, cost: 0, walk: 1, step: true,
    tags: ["spiritual", "history"], closedDay: -1,
    tip: "A calm temple with a short walk from the gate. Carry a water bottle."
  },
  {
    name: "Belgaum Heritage Museum",
    lat: 15.8512, lng: 74.5143,
    dur: 60, cost: 30, walk: 1, step: true,
    tags: ["history", "culture", "kids"], closedDay: 1, // 1 = Monday
    tip: "Indoors, so it is a good option in heat or rain. The sample data marks it closed on Mondays; confirm before going."
  }
];

const LUNCH = {
  name: "Lunch & Kunda",
  lat: 15.8622, lng: 74.5105,
  dur: 60, cost: 200, walk: 1, step: true,
  tip: "Try Kunda, Belagavi's famous sweet, after your meal. Ask for a fresh batch."
};