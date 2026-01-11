import * as fs from 'fs';
import * as path from 'path';

const CHARTS_DIR = path.join(process.cwd(), 'example/Charts');

// Helper to ensure directory exists
if (!fs.existsSync(CHARTS_DIR)) {
    fs.mkdirSync(CHARTS_DIR, { recursive: true });
}

// Helper for randoms
const random = (min: number, max: number): number => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number): number => Math.floor(random(min, max));
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

// Helper for dates
const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const toISODate = (date: Date): string => date.toISOString().split('T')[0]!; // YYYY-MM-DD

// 1. Weight Tracking (Line Chart)
function generateWeightTracking() {
    let currentDate = new Date('2023-01-01T08:00:00.000Z');
    let currentWeight = 80.0;

    for (let i = 0; i < 30; i++) {
        currentWeight += random(-0.5, 0.4);
        const content = `---
Date: "${toISODate(currentDate)}"
Weight: ${currentWeight.toFixed(1)}
---

# Weight-Log-${i}

Daily weight log.
`;
        fs.writeFileSync(path.join(CHARTS_DIR, `Weight-Log-${i}.md`), content);
        currentDate = addDays(currentDate, 1);
    }
}

// 2. Gym Punch Card (Heatmap/Scatter)
function generateGymPunchCard() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hours = Array.from({length: 24}, (_, i) => i);

    let count = 0;
    days.forEach(day => {
        hours.forEach(hour => {
            let chance = 0.1;
            if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 20)) {
                chance = 0.6;
            }

            if (Math.random() < chance) {
                const activity = randomInt(1, 10);
                const content = `---
Day: "${day}"
Hour: ${hour}
Activity: ${activity}
---

# Gym-Visit-${count++}

Activity log.
`;
                fs.writeFileSync(path.join(CHARTS_DIR, `Gym-Visit-${count}.md`), content);
            }
        });
    });
}

// 3. Nutrition (Pie / Rose)
function generateNutrition() {
    const nutrients = [
        { name: 'Protein', value: 150 },
        { name: 'Carbs', value: 200 },
        { name: 'Fat', value: 60 },
        { name: 'Fiber', value: 30 },
        { name: 'Sugar', value: 40 }
    ];

    nutrients.forEach((n, i) => {
        const content = `---
Nutrient: "${n.name}"
Amount: ${n.value}
---

# Nutrient-${i}

Dietary info.
`;
        fs.writeFileSync(path.join(CHARTS_DIR, `Nutrient-${i}.md`), content);
    });
}

// 4. Lift Progress (Scatter / Effect Scatter)
function generateLiftProgress() {
    let currentDate = new Date('2023-01-01T08:00:00.000Z');
    const exercises = ['Squat', 'Bench Press', 'Deadlift'];
    const baseWeights: Record<string, number> = { 'Squat': 100, 'Bench Press': 80, 'Deadlift': 120 };

    let count = 0;
    for (let i = 0; i < 20; i++) {
        const exercise = exercises[i % 3]!;
        const weight = baseWeights[exercise]! + (Math.floor(i / 3) * 2.5);

        const content = `---
Date: "${toISODate(currentDate)}"
Exercise: "${exercise}"
Weight: ${weight}
RPE: ${randomInt(7, 10)}
---

# Lift-Log-${count++}

Workout log.
`;
        fs.writeFileSync(path.join(CHARTS_DIR, `Lift-Log-${count}.md`), content);
        currentDate = addDays(currentDate, 2);
    }
}

// 5. Survey Analysis (Rose Chart)
function generateSurveyAnalysis() {
    const categories = ['Data Analysis', 'Visualization', 'Communication', 'Problem Solving', 'Coding', 'Management'];

    categories.forEach((cat, i) => {
        const score = randomInt(60, 100);
        const content = `---
Category: "${cat}"
Score: ${score}
---

# Survey-${i}

Skill assessment.
`;
        fs.writeFileSync(path.join(CHARTS_DIR, `Survey-${i}.md`), content);
    });
}

// 6. Product Comparison (Parallel Chart)
function generateProductComparison() {
    const series = ['Series A', 'Series B', 'Series C'];

    let count = 0;
    for (let i = 0; i < 50; i++) {
        const s = randomChoice(series);
        const price = randomInt(500, 2000);
        const weight = random(1.0, 3.0).toFixed(1);
        const rating = random(3.0, 5.0).toFixed(1);
        const battery = randomInt(4, 24);

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
        fs.writeFileSync(path.join(CHARTS_DIR, `Product-${count}.md`), content);
    }
}

// 7. Travel Routes (Lines Chart)
function generateTravelRoutes() {
    // Simple mock coordinates
    const cities = [
        { name: 'London', lon: -0.12, lat: 51.50 },
        { name: 'New York', lon: -74.00, lat: 40.71 },
        { name: 'Tokyo', lon: 139.69, lat: 35.68 },
        { name: 'Beijing', lon: 116.40, lat: 39.90 },
        { name: 'Sydney', lon: 151.20, lat: -33.86 }
    ];

    let count = 0;
    cities.forEach(start => {
        cities.forEach(end => {
            if (start.name !== end.name) {
                // Generate flight if distance is reasonable (mock logic)
                if (Math.random() > 0.5) {
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
                    fs.writeFileSync(path.join(CHARTS_DIR, `Route-${count}.md`), content);
                }
            }
        });
    });
}

// 8. City Locations (Effect Scatter)
function generateCityLocations() {
    const regions = ['Europe', 'North America', 'Asia', 'Oceania'];
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

    cities.forEach((c, i) => {
        const content = `---
City: "${c.name}"
Lon: ${c.lon}
Lat: ${c.lat}
Population: ${c.pop}
Region: "${c.region}"
---

# City-${i}

Major city.
`;
        fs.writeFileSync(path.join(CHARTS_DIR, `City-${i}.md`), content);
    });
}

function main() {
    console.log('Generating Weight Tracking data...');
    generateWeightTracking();
    console.log('Generating Gym Punch Card data...');
    generateGymPunchCard();
    console.log('Generating Nutrition data...');
    generateNutrition();
    console.log('Generating Lifting data...');
    generateLiftProgress();
    console.log('Generating Survey data...');
    generateSurveyAnalysis();
    console.log('Generating Product data...');
    generateProductComparison();
    console.log('Generating Route data...');
    generateTravelRoutes();
    console.log('Generating City data...');
    generateCityLocations();
    console.log('Done.');
}

main();
