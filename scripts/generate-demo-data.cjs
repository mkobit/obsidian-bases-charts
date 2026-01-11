const fs = require('fs');
const path = require('path');

const CHARTS_DIR = path.join(__dirname, '../example/Charts');
const EXAMPLE_DIR = path.join(__dirname, '../example');

// Helper to ensure directory exists
if (!fs.existsSync(CHARTS_DIR)) {
    fs.mkdirSync(CHARTS_DIR, { recursive: true });
}

// Helper for randoms
const random = (min, max) => Math.random() * (max - min) + min;
const randomInt = (min, max) => Math.floor(random(min, max));

// Helper for dates
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const toISODate = (date) => date.toISOString().split('T')[0]; // YYYY-MM-DD

// 1. Weight Tracking (Line Chart)
// Inspired by: https://echarts.apache.org/examples/en/editor.html?c=line-simple
// Theme: "Weight Tracking" (Obvious, relatable)
function generateWeightTracking() {
    const baseFile = `properties:
  note.Date:
    displayName: Date
  note.Weight:
    displayName: Body Weight (kg)
views:
  - type: line-chart
    name: Weight Trend
    xAxisProp: note.Date
    yAxisProp: note.Weight
    showLegend: true
    filters:
      and:
        - note.Weight != null
`;
    fs.writeFileSync(path.join(EXAMPLE_DIR, 'Weight_Tracking.base'), baseFile);

    let currentDate = new Date('2023-01-01T08:00:00.000Z');
    let currentWeight = 80.0;

    for (let i = 0; i < 30; i++) {
        // Fluctuate weight
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
// Inspired by: https://echarts.apache.org/examples/en/editor.html?c=scatter-punchCard
// Theme: "Gym Visits" (Obvious, relates to structure)
function generateGymPunchCard() {
    const baseFile = `properties:
  note.Day:
    displayName: Day of Week
  note.Hour:
    displayName: Hour of Day
  note.Activity:
    displayName: Activity Level
views:
  - type: heatmap-chart
    name: Gym Activity Heatmap
    xAxisProp: note.Hour
    yAxisProp: note.Day
    valueProp: note.Activity
    showLegend: true
    filters:
      and:
        - note.Activity != null
  - type: scatter-chart
    name: Gym Activity Scatter
    xAxisProp: note.Hour
    yAxisProp: note.Day
    sizeProp: note.Activity
    showLegend: true
    filters:
      and:
        - note.Activity != null
`;
    fs.writeFileSync(path.join(EXAMPLE_DIR, 'Gym_Visits.base'), baseFile);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hours = Array.from({length: 24}, (_, i) => i);

    let count = 0;
    // Generate scattered data - "Punch Card" style
    days.forEach(day => {
        hours.forEach(hour => {
            // Simulate realistic gym times (morning/evening peaks)
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

// 3. Nutrition (Pie / Nightingale)
// Inspired by: https://echarts.apache.org/examples/en/editor.html?c=pie-simple
// Theme: "Dietary Intake"
function generateNutrition() {
     const baseFile = `properties:
  note.Nutrient:
    displayName: Nutrient
  note.Amount:
    displayName: Amount (g)
views:
  - type: pie-chart
    name: Macro Distribution
    xAxisProp: note.Nutrient
    yAxisProp: note.Amount
    showLegend: true
    filters:
      and:
        - note.Nutrient != null
  - type: rose-chart
    name: Macro Rose Chart
    xAxisProp: note.Nutrient
    yAxisProp: note.Amount
    showLegend: true
    filters:
      and:
        - note.Nutrient != null
`;
    fs.writeFileSync(path.join(EXAMPLE_DIR, 'Nutrition.base'), baseFile);

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
// Inspired by: https://echarts.apache.org/examples/en/editor.html?c=scatter-effect
// Theme: "Weight Lifting"
function generateLiftProgress() {
    const baseFile = `properties:
  note.Date:
    displayName: Date
  note.Weight:
    displayName: Weight Lifted (kg)
  note.Exercise:
    displayName: Exercise
  note.RPE:
    displayName: RPE
views:
  - type: scatter-chart
    name: Lift Progress
    xAxisProp: note.Date
    yAxisProp: note.Weight
    seriesProp: note.Exercise
    showLegend: true
    filters:
      and:
        - note.Exercise != null
  - type: effect-scatter-chart
    name: Personal Records
    xAxisProp: note.Date
    yAxisProp: note.Weight
    seriesProp: note.Exercise
    sizeProp: note.RPE
    showLegend: true
    filters:
      and:
        - note.RPE >= 9
`;
    fs.writeFileSync(path.join(EXAMPLE_DIR, 'Lifting.base'), baseFile);

    let currentDate = new Date('2023-01-01T08:00:00.000Z');
    const exercises = ['Squat', 'Bench Press', 'Deadlift'];
    const baseWeights = { 'Squat': 100, 'Bench Press': 80, 'Deadlift': 120 };

    let count = 0;
    for (let i = 0; i < 20; i++) { // 20 sessions
        const exercise = exercises[i % 3];
        const weight = baseWeights[exercise] + (Math.floor(i / 3) * 2.5); // Progressive overload

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
        currentDate = addDays(currentDate, 2); // Every other day
    }
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
    console.log('Done.');
}

main();
