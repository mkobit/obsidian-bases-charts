import * as fs from 'fs';
import * as path from 'path';
import { Temporal } from 'temporal-polyfill';

const CHARTS_DIR = path.join(process.cwd(), 'example/Charts');

// Simple LCG for seeded randomness
class Random {
    private m = 0x80000000;
    private a = 1103515245;
    private c = 12345;
    private state: number;

    constructor(seed: number) {
        this.state = seed;
    }

    // Returns a float between 0 and 1
    next(): number {
        this.state = (this.a * this.state + this.c) % this.m;
        return this.state / (this.m - 1);
    }

    range(min: number, max: number): number {
        return this.next() * (max - min) + min;
    }

    int(min: number, max: number): number {
        return Math.floor(this.range(min, max));
    }

    choice<T>(arr: T[]): T {
        return arr[this.int(0, arr.length)]!;
    }
}

interface DemoFile {
    filename: string;
    content: string;
}

// 1. Weight Tracking
const generateWeightTracking = (rng: Random): DemoFile[] => {
    let currentDate = Temporal.PlainDate.from('2023-01-01');
    let currentWeight = 80.0;
    const files: DemoFile[] = [];

    for (let i = 0; i < 30; i++) {
        currentWeight += rng.range(-0.5, 0.4);
        const content = `---
Date: "${currentDate.toString()}"
Weight: ${currentWeight.toFixed(1)}
---

# Weight-Log-${i}

Daily weight log.
`;
        files.push({ filename: `Weight-Log-${i}.md`, content });
        currentDate = currentDate.add({ days: 1 });
    }
    return files;
};

// 2. Gym Punch Card
const generateGymPunchCard = (rng: Random): DemoFile[] => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const files: DemoFile[] = [];

    let count = 0;
    days.forEach(day => {
        hours.forEach(hour => {
            let chance = 0.1;
            if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 20)) {
                chance = 0.6;
            }

            if (rng.next() < chance) {
                const activity = rng.int(1, 10);
                const content = `---
Day: "${day}"
Hour: ${hour}
Activity: ${activity}
---

# Gym-Visit-${count++}

Activity log.
`;
                files.push({ filename: `Gym-Visit-${count}.md`, content });
            }
        });
    });
    return files;
};

// 3. Nutrition
const generateNutrition = (): DemoFile[] => {
    const nutrients = [
        { name: 'Protein', value: 150 },
        { name: 'Carbs', value: 200 },
        { name: 'Fat', value: 60 },
        { name: 'Fiber', value: 30 },
        { name: 'Sugar', value: 40 }
    ];

    return nutrients.map((n, i) => ({
        filename: `Nutrient-${i}.md`,
        content: `---
Nutrient: "${n.name}"
Amount: ${n.value}
---

# Nutrient-${i}

Dietary info.
`
    }));
};

// 4. Lift Progress
const generateLiftProgress = (rng: Random): DemoFile[] => {
    let currentDate = Temporal.PlainDate.from('2023-01-01');
    const exercises = ['Squat', 'Bench Press', 'Deadlift'];
    const baseWeights: Record<string, number> = { 'Squat': 100, 'Bench Press': 80, 'Deadlift': 120 };
    const files: DemoFile[] = [];

    let count = 0;
    for (let i = 0; i < 20; i++) {
        const exercise = exercises[i % 3]!;
        const weight = baseWeights[exercise]! + (Math.floor(i / 3) * 2.5);

        const content = `---
Date: "${currentDate.toString()}"
Exercise: "${exercise}"
Weight: ${weight}
RPE: ${rng.int(7, 10)}
---

# Lift-Log-${count++}

Workout log.
`;
        files.push({ filename: `Lift-Log-${count}.md`, content });
        currentDate = currentDate.add({ days: 2 });
    }
    return files;
};

// 5. Survey Analysis
const generateSurveyAnalysis = (rng: Random): DemoFile[] => {
    const categories = ['Data Analysis', 'Visualization', 'Communication', 'Problem Solving', 'Coding', 'Management'];

    return categories.map((cat, i) => ({
        filename: `Survey-${i}.md`,
        content: `---
Category: "${cat}"
Score: ${rng.int(60, 100)}
---

# Survey-${i}

Skill assessment.
`
    }));
};

// 6. Product Comparison
const generateProductComparison = (rng: Random): DemoFile[] => {
    const series = ['Series A', 'Series B', 'Series C'];
    const files: DemoFile[] = [];

    let count = 0;
    for (let i = 0; i < 50; i++) {
        const s = rng.choice(series);
        const price = rng.int(500, 2000);
        const weight = rng.range(1.0, 3.0).toFixed(1);
        const rating = rng.range(3.0, 5.0).toFixed(1);
        const battery = rng.int(4, 24);

        const content = `---
Name: "Product ${i}"
Price: ${price}
Weight: ${weight}
Rating: ${rating}
BatteryLife: ${battery}
Series: "${s}"
---

# Product-${count++}

Product spec.
`;
        files.push({ filename: `Product-${count}.md`, content });
    }
    return files;
};

// 7. Travel Routes
const generateTravelRoutes = (rng: Random): DemoFile[] => {
    const cities = [
        { name: 'London', lon: -0.12, lat: 51.50 },
        { name: 'New York', lon: -74.00, lat: 40.71 },
        { name: 'Tokyo', lon: 139.69, lat: 35.68 },
        { name: 'Beijing', lon: 116.40, lat: 39.90 },
        { name: 'Sydney', lon: 151.20, lat: -33.86 }
    ];
    const files: DemoFile[] = [];

    let count = 0;
    cities.forEach(start => {
        cities.forEach(end => {
            if (start.name !== end.name) {
                if (rng.next() > 0.5) {
                    const content = `---
Route: "${start.name} -> ${end.name}"
StartX: ${start.lon}
StartY: ${start.lat}
EndX: ${end.lon}
EndY: ${end.lat}
Type: "Flight"
---

# Route-${count++}

Flight path.
`;
                    files.push({ filename: `Route-${count}.md`, content });
                }
            }
        });
    });
    return files;
};

// 8. City Locations
const generateCityLocations = (): DemoFile[] => {
    const cities = [
        { name: 'London', lon: -0.12, lat: 51.50, pop: 9, region: 'Europe' },
        { name: 'New York', lon: -74.00, lat: 40.71, pop: 8.4, region: 'North America' },
        { name: 'Tokyo', lon: 139.69, lat: 35.68, pop: 14, region: 'Asia' },
        { name: 'Beijing', lon: 116.40, lat: 39.90, pop: 21.5, region: 'Asia' },
        { name: 'Sydney', lon: 151.20, lat: -33.86, pop: 5.3, region: 'Oceania' },
        { name: 'Paris', lon: 2.35, lat: 48.85, pop: 2.1, region: 'Europe' },
        { name: 'Berlin', lon: 13.40, lat: 52.52, pop: 3.6, region: 'Europe' },
        { name: 'Los Angeles', lon: -118.24, lat: 34.05, pop: 3.9, region: 'North America' }
    ];

    return cities.map((c, i) => ({
        filename: `City-${i}.md`,
        content: `---
City: "${c.name}"
Lon: ${c.lon}
Lat: ${c.lat}
Population: ${c.pop}
Region: "${c.region}"
---

# City-${i}

Major city.
`
    }));
};

const writeFiles = (files: DemoFile[]) => {
    if (!fs.existsSync(CHARTS_DIR)) {
        fs.mkdirSync(CHARTS_DIR, { recursive: true });
    }

    // Clear directory
    fs.readdirSync(CHARTS_DIR).forEach(f => fs.unlinkSync(path.join(CHARTS_DIR, f)));

    files.forEach(f => {
        fs.writeFileSync(path.join(CHARTS_DIR, f.filename), f.content);
    });
};

const parseSeed = (): number => {
    const args = process.argv.slice(2);
    const seedIndex = args.indexOf('--seed');
    if (seedIndex !== -1 && args[seedIndex + 1]) {
        return parseInt(args[seedIndex + 1]!, 10);
    }
    return 12345; // Default seed
};

function main() {
    const seed = parseSeed();
    console.log(`Generating data with seed: ${seed}`);
    const rng = new Random(seed);

    const allFiles = [
        ...generateWeightTracking(rng),
        ...generateGymPunchCard(rng),
        ...generateNutrition(),
        ...generateLiftProgress(rng),
        ...generateSurveyAnalysis(rng),
        ...generateProductComparison(rng),
        ...generateTravelRoutes(rng),
        ...generateCityLocations()
    ];

    console.log(`Writing ${allFiles.length} files...`);
    writeFiles(allFiles);
    console.log('Done.');
}

main();
