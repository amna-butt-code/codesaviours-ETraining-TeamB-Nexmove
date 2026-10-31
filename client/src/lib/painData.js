export const REGIONS = [
  { id: "head", label: "Head", backLabel: "Back of head", shape: "ellipse", cx: 100, cy: 30, rx: 22, ry: 26 },
  { id: "neck", label: "Neck", x: 90, y: 55, w: 20, h: 18 },
  { id: "rshoulder", label: "Right shoulder", x: 55, y: 73, w: 35, h: 22 },
  { id: "lshoulder", label: "Left shoulder", x: 110, y: 73, w: 35, h: 22 },
  { id: "chest", label: "Chest", backLabel: "Upper back", x: 75, y: 95, w: 50, h: 40 },
  { id: "abdomen", label: "Abdomen", backLabel: "Lower back", x: 78, y: 135, w: 44, h: 40 },
  { id: "rarm", label: "Right upper arm", x: 42, y: 95, w: 22, h: 55 },
  { id: "larm", label: "Left upper arm", x: 136, y: 95, w: 22, h: 55 },
  { id: "rforearm", label: "Right forearm", x: 36, y: 150, w: 20, h: 55 },
  { id: "lforearm", label: "Left forearm", x: 144, y: 150, w: 20, h: 55 },
  { id: "hips", label: "Hips", backLabel: "Buttocks", x: 75, y: 175, w: 50, h: 30 },
  { id: "rthigh", label: "Right thigh", backLabel: "Back of right thigh", x: 72, y: 205, w: 26, h: 70 },
  { id: "lthigh", label: "Left thigh", backLabel: "Back of left thigh", x: 102, y: 205, w: 26, h: 70 },
  { id: "rknee", label: "Right knee", backLabel: "Back of right knee", x: 72, y: 275, w: 26, h: 25 },
  { id: "lknee", label: "Left knee", backLabel: "Back of left knee", x: 102, y: 275, w: 26, h: 25 },
  { id: "rleg", label: "Right lower leg", backLabel: "Right calf", x: 73, y: 300, w: 24, h: 70 },
  { id: "lleg", label: "Left lower leg", backLabel: "Left calf", x: 103, y: 300, w: 24, h: 70 },
  { id: "rfoot", label: "Right foot", x: 70, y: 370, w: 28, h: 18 },
  { id: "lfoot", label: "Left foot", x: 102, y: 370, w: 28, h: 18 },
];

export const DURATIONS = ["Less than 1 week", "1 to 4 weeks", "1 to 3 months", "More than 3 months"];

export const AGGRAVATING = [
  "Walking", "Sitting for long", "Standing for long", "Lifting", "Bending",
  "Climbing stairs", "Exercise or sport", "Night time or lying down",
];

export const RED_FLAGS = [
  "Chest pain or trouble breathing",
  "Sudden weakness or numbness",
  "Loss of control of bladder or bowel",
  "A serious accident or fall just now",
];

// Maps selected body regions to condition names used on the site
export function suggestions(regionIds) {
  const has = (...k) => regionIds.some((id) => k.includes(id));
  const out = new Set();
  if (has("neck", "neck-back")) out.add("Neck pain");
  if (has("rshoulder", "lshoulder", "rshoulder-back", "lshoulder-back")) out.add("Frozen shoulder");
  if (has("chest-back", "abdomen-back")) out.add("Back pain");
  if (has("abdomen-back", "hips-back", "rthigh-back", "lthigh-back")) out.add("Sciatica");
  if (has("rknee", "lknee", "rknee-back", "lknee-back")) out.add("Knee pain");
  if (has("rthigh", "lthigh", "rleg", "lleg", "rfoot", "lfoot", "rarm", "larm", "rforearm", "lforearm")) out.add("Sports injuries");
  if (out.size === 0) out.add("Posture problems");
  return [...out];
}