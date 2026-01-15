import { BarChartView } from '../../src/views/bar-chart-view';
import { Plugin } from './obsidian-mock';

console.log('Setup script running...');

const mockController = {};

const plugin = new Plugin();
const container = document.getElementById('app-container');

// Mock Obsidian's createDiv extension
const mockCreateDiv = function (this: HTMLElement, props?: { cls?: string }) {
    const div = document.createElement('div');
    if (props?.cls) div.className = props.cls;
    this.appendChild(div);
    (div as any).createDiv = mockCreateDiv;
    return div;
};

if (container) {
    (container as any).createDiv = mockCreateDiv;
    console.log('Container found, initializing view...');
    const view = new BarChartView(mockController as any, container, plugin as any);

    // Mock data compliant with BasesData structure
    // BasesData is usually just an array of objects
    view.data = {
        data: [
            { category: 'Mon', value: 120 },
            { category: 'Tue', value: 200 },
            { category: 'Wed', value: 150 },
            { category: 'Thu', value: 80 },
            { category: 'Fri', value: 70 },
            { category: 'Sat', value: 110 },
            { category: 'Sun', value: 130 },
        ]
    } as any;

    // Set minimal config
    view.config.set('xAxisProp', 'category');
    view.config.set('yAxisProp', 'value');

    // Simulate lifecycle
    view.onload();
    view.onDataUpdated();

    console.log('View rendered.');
    (window as any).view = view;
} else {
    console.error('Container not found!');
}
