import { Difficulty, RewardDefinition } from "../../app/types";

interface RawReward {
  id: string;
  title: string;
  tier: Difficulty;
  popTags: string;
  cooldownHours: number;
}

const parsePopTags = (tags: string): Difficulty[] => {
  const map: Record<string, Difficulty> = {
    E: "easy",
    M: "medium",
    H: "hard"
  };
  return tags.split(",").map((tag) => map[tag.trim()]).filter((value): value is Difficulty => Boolean(value));
};

const build = (raw: RawReward): RewardDefinition => {
  return {
    id: raw.id,
    title: raw.title,
    tier: raw.tier,
    contextTags: ["athletic", "parent", "professor", "boston"],
    popForTaskDifficulties: parsePopTags(raw.popTags),
    minStreak: 0,
    cooldownHours: raw.cooldownHours
  };
};

const rawRewards: RawReward[] = [
  { id: "E01", title: "Fancy coffee permission at your favorite local cafe", tier: "easy", popTags: "E,M,H", cooldownHours: 24 },
  { id: "E02", title: "12-minute Charles River fresh-air walk", tier: "easy", popTags: "E,M", cooldownHours: 12 },
  { id: "E03", title: "15 minutes of guilt-free novel reading", tier: "easy", popTags: "E,M,H", cooldownHours: 8 },
  { id: "E04", title: "Sit-down tea in your best mug, no multitasking", tier: "easy", popTags: "E,M,H", cooldownHours: 8 },
  { id: "E05", title: "One premium pastry with coffee", tier: "easy", popTags: "E,M,H", cooldownHours: 24 },
  { id: "E06", title: "10-minute mobility reset before next meeting", tier: "easy", popTags: "E,M", cooldownHours: 8 },
  { id: "E07", title: "Sunset mini-walk around your block with podcast", tier: "easy", popTags: "E,M,H", cooldownHours: 12 },
  { id: "E08", title: "20 minutes of toddler-free shower + playlist", tier: "easy", popTags: "E,M,H", cooldownHours: 24 },
  { id: "E09", title: "Buy the good berries this week", tier: "easy", popTags: "E,M", cooldownHours: 48 },
  { id: "E10", title: "Add one fancy cheese to grocery run", tier: "easy", popTags: "E,M,H", cooldownHours: 48 },
  { id: "E11", title: "15-minute nap attempt, phone in other room", tier: "easy", popTags: "E,M,H", cooldownHours: 12 },
  { id: "E12", title: "Permission to skip one low-value email batch", tier: "easy", popTags: "E,M,H", cooldownHours: 8 },
  { id: "E13", title: "20 minutes reading arXiv outside your field for fun", tier: "easy", popTags: "E,M,H", cooldownHours: 12 },
  { id: "E14", title: "One new pen/notebook sticker for your planner", tier: "easy", popTags: "E,M", cooldownHours: 72 },
  { id: "E15", title: "10-minute breathing + stretch between classes", tier: "easy", popTags: "E,M,H", cooldownHours: 8 },
  { id: "E16", title: "Walk-and-call with a friend while strollering", tier: "easy", popTags: "E,M,H", cooldownHours: 24 },
  { id: "E17", title: "25-minute music-only deep work block with tea", tier: "easy", popTags: "E,M,H", cooldownHours: 8 },
  { id: "E18", title: "Lunch from the place you actually like", tier: "easy", popTags: "E,M,H", cooldownHours: 24 },
  { id: "E19", title: "15 minutes of zero-guilt social scrolling", tier: "easy", popTags: "E,M,H", cooldownHours: 24 },
  { id: "E20", title: "Takeout dessert add-on tonight", tier: "easy", popTags: "E,M,H", cooldownHours: 48 },
  { id: "E21", title: "New trail mix blend from local market", tier: "easy", popTags: "E,M", cooldownHours: 48 },
  { id: "E22", title: "Quick bookstore browse in Harvard Square", tier: "easy", popTags: "E,M", cooldownHours: 72 },
  { id: "E23", title: "20-minute couch recovery with blanket + audiobook", tier: "easy", popTags: "E,M,H", cooldownHours: 12 },
  { id: "E24", title: "Skip one nonessential household chore today", tier: "easy", popTags: "E,M,H", cooldownHours: 12 },
  { id: "E25", title: "Buy one bouquet for kitchen table", tier: "easy", popTags: "E,M,H", cooldownHours: 72 },
  { id: "E26", title: "15-minute espresso walk during campus break", tier: "easy", popTags: "E,M,H", cooldownHours: 24 },
  { id: "E27", title: "Add one premium yogurt flavor to cart", tier: "easy", popTags: "E,M", cooldownHours: 48 },
  { id: "E28", title: "Sit in a sunny spot for 10 minutes", tier: "easy", popTags: "E,M,H", cooldownHours: 8 },
  { id: "E29", title: "One chapter of a physics biography for fun", tier: "easy", popTags: "E,M,H", cooldownHours: 12 },
  { id: "E30", title: "20-minute stretch while toddler naps", tier: "easy", popTags: "E,M,H", cooldownHours: 12 },
  { id: "E31", title: "Permission to wear your comfiest lecture outfit", tier: "easy", popTags: "E,M,H", cooldownHours: 24 },
  { id: "E32", title: "Buy the better dark chocolate bar", tier: "easy", popTags: "E,M,H", cooldownHours: 48 },
  { id: "E33", title: "15-minute language-learning or puzzle break", tier: "easy", popTags: "E,M,H", cooldownHours: 12 },
  { id: "E34", title: "Coffee plus no email for first 20 morning minutes", tier: "easy", popTags: "E,M,H", cooldownHours: 24 },
  { id: "E35", title: "Visit a neighborhood bakery and bring one treat home", tier: "easy", popTags: "E,M,H", cooldownHours: 48 },
  { id: "E36", title: "10-minute outdoor brisk walk after daycare dropoff", tier: "easy", popTags: "E,M,H", cooldownHours: 12 },
  { id: "E37", title: "Fresh flowers from weekend market", tier: "easy", popTags: "E,M,H", cooldownHours: 72 },
  { id: "E38", title: "Buy one upgraded running sock pair", tier: "easy", popTags: "E,M", cooldownHours: 96 },
  { id: "E39", title: "20-minute early bedtime pass tonight", tier: "easy", popTags: "E,M,H", cooldownHours: 24 },
  { id: "E40", title: "Fancy coffee beans refill permission", tier: "easy", popTags: "E,M,H", cooldownHours: 96 },

  { id: "M01", title: "45-minute solo run on the Esplanade", tier: "medium", popTags: "M,H", cooldownHours: 24 },
  { id: "M02", title: "Strength session with no schedule guilt", tier: "medium", popTags: "M,H", cooldownHours: 24 },
  { id: "M03", title: "Buy one new science book from MIT/Harvard bookstore", tier: "medium", popTags: "M,H", cooldownHours: 120 },
  { id: "M04", title: "Museum hour at the MFA or Harvard museums", tier: "medium", popTags: "M,H", cooldownHours: 168 },
  { id: "M05", title: "Midday cafe writing session off campus", tier: "medium", popTags: "M,H", cooldownHours: 72 },
  { id: "M06", title: "Order dinner from favorite neighborhood spot", tier: "medium", popTags: "M,H", cooldownHours: 72 },
  { id: "M07", title: "60-minute uninterrupted reading block", tier: "medium", popTags: "M,H", cooldownHours: 24 },
  { id: "M08", title: "Sports massage gun 20-minute session", tier: "medium", popTags: "M,H", cooldownHours: 24 },
  { id: "M09", title: "New workout class drop-in (spin/yoga)", tier: "medium", popTags: "M,H", cooldownHours: 120 },
  { id: "M10", title: "One high-quality bath and skincare ritual", tier: "medium", popTags: "M,H", cooldownHours: 48 },
  { id: "M11", title: "Buy that niche spice/ingredient you wanted", tier: "medium", popTags: "M,H", cooldownHours: 120 },
  { id: "M12", title: "90-minute library retreat with no meetings", tier: "medium", popTags: "M,H", cooldownHours: 48 },
  { id: "M13", title: "1-hour date coffee or walk with partner", tier: "medium", popTags: "M,H", cooldownHours: 72 },
  { id: "M14", title: "Pay for grocery delivery this week to reclaim time", tier: "medium", popTags: "M,H", cooldownHours: 168 },
  { id: "M15", title: "New running route adventure in Cambridge/Brookline", tier: "medium", popTags: "M,H", cooldownHours: 72 },
  { id: "M16", title: "Quality headphones session for deep focus", tier: "medium", popTags: "M,H", cooldownHours: 48 },
  { id: "M17", title: "Buy one premium tea sampler tin", tier: "medium", popTags: "M,H", cooldownHours: 96 },
  { id: "M18", title: "2-hour protected no-admin research block", tier: "medium", popTags: "M,H", cooldownHours: 24 },
  { id: "M19", title: "Leave campus early one day this week", tier: "medium", popTags: "M,H", cooldownHours: 120 },
  { id: "M20", title: "Brunch reward with favorite pastry + coffee", tier: "medium", popTags: "M,H", cooldownHours: 120 },
  { id: "M21", title: "Buy upgraded toddler activity that buys 30 quiet minutes", tier: "medium", popTags: "M,H", cooldownHours: 168 },
  { id: "M22", title: "Long walk at Arnold Arboretum", tier: "medium", popTags: "M,H", cooldownHours: 120 },
  { id: "M23", title: "Book one babysitter hour for personal reset", tier: "medium", popTags: "M,H", cooldownHours: 168 },
  { id: "M24", title: "New resistance band or mobility tool", tier: "medium", popTags: "M,H", cooldownHours: 120 },
  { id: "M25", title: "Cozy evening movie with zero laptop", tier: "medium", popTags: "M,H", cooldownHours: 72 },
  { id: "M26", title: "Replace one household pain-point item with better version", tier: "medium", popTags: "M,H", cooldownHours: 168 },
  { id: "M27", title: "75-minute track workout plus recovery smoothie", tier: "medium", popTags: "M,H", cooldownHours: 72 },
  { id: "M28", title: "Buy one beautiful plant for office/home", tier: "medium", popTags: "M,H", cooldownHours: 168 },
  { id: "M29", title: "Two-hour Saturday personal project block", tier: "medium", popTags: "M,H", cooldownHours: 120 },
  { id: "M30", title: "Half-day inbox blackout and focused physics work", tier: "medium", popTags: "M,H", cooldownHours: 168 },

  { id: "H01", title: "Full morning off-duty block (3+ hours)", tier: "hard", popTags: "H", cooldownHours: 168 },
  { id: "H02", title: "Day trip hike in the Blue Hills or Middlesex Fells", tier: "hard", popTags: "H", cooldownHours: 240 },
  { id: "H03", title: "Boutique running shoes upgrade fund permission", tier: "hard", popTags: "H", cooldownHours: 336 },
  { id: "H04", title: "One full childcare-supported deep work day", tier: "hard", popTags: "H", cooldownHours: 240 },
  { id: "H05", title: "Mini solo retreat afternoon at a quiet hotel lounge/cafe", tier: "hard", popTags: "H", cooldownHours: 336 },
  { id: "H06", title: "Book a professional massage", tier: "hard", popTags: "H", cooldownHours: 336 },
  { id: "H07", title: "Pair of tickets to a Boston symphony/jazz event", tier: "hard", popTags: "H", cooldownHours: 336 },
  { id: "H08", title: "Personal day extension after major deadline week", tier: "hard", popTags: "H", cooldownHours: 336 },
  { id: "H09", title: "Premium winter training gear purchase", tier: "hard", popTags: "H", cooldownHours: 336 },
  { id: "H10", title: "Weekend half-day museum + bookstore circuit", tier: "hard", popTags: "H", cooldownHours: 240 },
  { id: "H11", title: "Trail race registration or event entry", tier: "hard", popTags: "H", cooldownHours: 720 },
  { id: "H12", title: "Fancy tasting-menu brunch/lunch date", tier: "hard", popTags: "H", cooldownHours: 336 },
  { id: "H13", title: "Buy that specialized kitchen tool you keep postponing", tier: "hard", popTags: "H", cooldownHours: 336 },
  { id: "H14", title: "Upgrade office ergonomic item (chair accessory/footrest)", tier: "hard", popTags: "H", cooldownHours: 336 },
  { id: "H15", title: "Full Sunday planning-and-recovery block with childcare cover", tier: "hard", popTags: "H", cooldownHours: 240 },
  { id: "H16", title: "Overnight mini staycation in greater Boston", tier: "hard", popTags: "H", cooldownHours: 720 },
  { id: "H17", title: "Sports science gadget fund (watch accessory/sensor)", tier: "hard", popTags: "H", cooldownHours: 720 },
  { id: "H18", title: "4-hour personal research retreat, no admin", tier: "hard", popTags: "H", cooldownHours: 240 },
  { id: "H19", title: "Book professional home cleaning once", tier: "hard", popTags: "H", cooldownHours: 720 },
  { id: "H20", title: "Celebration dinner at a top-choice Boston restaurant", tier: "hard", popTags: "H", cooldownHours: 720 }
];

export const REWARD_POOL: RewardDefinition[] = rawRewards.map(build);
