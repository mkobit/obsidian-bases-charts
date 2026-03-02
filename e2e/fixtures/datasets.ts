import { NoteBuilder } from '../helpers/vault-builder'
import type { NoteDefinition } from '../helpers/vault-builder'

export const salesDataset: readonly NoteDefinition[] = [
  NoteBuilder.create('Sales-2023-01.md').withProperty('Date', '2023-01-01').withProperty('Product', 'Widget A').withProperty('Revenue', 45_000).withProperty('Units', 150).withProperty('Region', 'North').build(),
  NoteBuilder.create('Sales-2023-02.md').withProperty('Date', '2023-02-01').withProperty('Product', 'Widget B').withProperty('Revenue', 52_000).withProperty('Units', 180).withProperty('Region', 'South').build(),
  NoteBuilder.create('Sales-2023-03.md').withProperty('Date', '2023-03-01').withProperty('Product', 'Widget C').withProperty('Revenue', 38_000).withProperty('Units', 120).withProperty('Region', 'East').build(),
  NoteBuilder.create('Sales-2023-04.md').withProperty('Date', '2023-04-01').withProperty('Product', 'Widget A').withProperty('Revenue', 47_000).withProperty('Units', 160).withProperty('Region', 'West').build(),
  NoteBuilder.create('Sales-2023-05.md').withProperty('Date', '2023-05-01').withProperty('Product', 'Widget B').withProperty('Revenue', 55_000).withProperty('Units', 190).withProperty('Region', 'North').build(),
  NoteBuilder.create('Sales-2023-06.md').withProperty('Date', '2023-06-01').withProperty('Product', 'Widget C').withProperty('Revenue', 41_000).withProperty('Units', 130).withProperty('Region', 'South').build(),
  NoteBuilder.create('Sales-2023-07.md').withProperty('Date', '2023-07-01').withProperty('Product', 'Widget A').withProperty('Revenue', 49_000).withProperty('Units', 170).withProperty('Region', 'East').build(),
  NoteBuilder.create('Sales-2023-08.md').withProperty('Date', '2023-08-01').withProperty('Product', 'Widget B').withProperty('Revenue', 58_000).withProperty('Units', 200).withProperty('Region', 'West').build(),
  NoteBuilder.create('Sales-2023-09.md').withProperty('Date', '2023-09-01').withProperty('Product', 'Widget C').withProperty('Revenue', 44_000).withProperty('Units', 140).withProperty('Region', 'North').build(),
  NoteBuilder.create('Sales-2023-10.md').withProperty('Date', '2023-10-01').withProperty('Product', 'Widget A').withProperty('Revenue', 51_000).withProperty('Units', 180).withProperty('Region', 'South').build(),
]

export const ganttDataset: readonly NoteDefinition[] = [
  NoteBuilder.create('Task-1.md').withProperty('Task', 'Project Kickoff').withProperty('Start', '2024-01-01').withProperty('End', '2024-01-05').withProperty('Category', 'Planning').withProperty('Status', 'Done').build(),
  NoteBuilder.create('Task-2.md').withProperty('Task', 'Requirements Gathering').withProperty('Start', '2024-01-06').withProperty('End', '2024-01-15').withProperty('Category', 'Planning').withProperty('Status', 'Done').build(),
  NoteBuilder.create('Task-3.md').withProperty('Task', 'System Design').withProperty('Start', '2024-01-16').withProperty('End', '2024-01-30').withProperty('Category', 'Planning').withProperty('Status', 'In Progress').build(),
  NoteBuilder.create('Task-4.md').withProperty('Task', 'Frontend Development').withProperty('Start', '2024-02-01').withProperty('End', '2024-02-28').withProperty('Category', 'Development').withProperty('Status', 'To Do').build(),
  NoteBuilder.create('Task-5.md').withProperty('Task', 'Backend API').withProperty('Start', '2024-02-01').withProperty('End', '2024-03-15').withProperty('Category', 'Development').withProperty('Status', 'To Do').build(),
  NoteBuilder.create('Task-6.md').withProperty('Task', 'Integration Testing').withProperty('Start', '2024-03-16').withProperty('End', '2024-03-31').withProperty('Category', 'Testing').withProperty('Status', 'To Do').build(),
  NoteBuilder.create('Task-7.md').withProperty('Task', 'User Acceptance Testing').withProperty('Start', '2024-04-01').withProperty('End', '2024-04-15').withProperty('Category', 'Testing').withProperty('Status', 'To Do').build(),
  NoteBuilder.create('Task-8.md').withProperty('Task', 'Production Deployment').withProperty('Start', '2024-04-16').withProperty('End', '2024-04-20').withProperty('Category', 'Deployment').withProperty('Status', 'To Do').build(),
]

export const stockDataset: readonly NoteDefinition[] = [
  NoteBuilder.create('Stock-2024-01-02.md').withProperty('Date', '2024-01-02').withProperty('Open', 187.15).withProperty('High', 188.44).withProperty('Low', 183.89).withProperty('Close', 185.64).withProperty('Volume', 82_488_700).build(),
  NoteBuilder.create('Stock-2024-01-03.md').withProperty('Date', '2024-01-03').withProperty('Open', 184.22).withProperty('High', 185.88).withProperty('Low', 183.43).withProperty('Close', 184.25).withProperty('Volume', 58_414_500).build(),
  NoteBuilder.create('Stock-2024-01-04.md').withProperty('Date', '2024-01-04').withProperty('Open', 182.15).withProperty('High', 183.09).withProperty('Low', 180.88).withProperty('Close', 181.91).withProperty('Volume', 71_983_600).build(),
  NoteBuilder.create('Stock-2024-01-05.md').withProperty('Date', '2024-01-05').withProperty('Open', 181.99).withProperty('High', 182.76).withProperty('Low', 180.17).withProperty('Close', 181.18).withProperty('Volume', 62_303_300).build(),
  NoteBuilder.create('Stock-2024-01-08.md').withProperty('Date', '2024-01-08').withProperty('Open', 182.09).withProperty('High', 185.60).withProperty('Low', 181.50).withProperty('Close', 185.56).withProperty('Volume', 59_144_500).build(),
  NoteBuilder.create('Stock-2024-01-09.md').withProperty('Date', '2024-01-09').withProperty('Open', 183.92).withProperty('High', 185.15).withProperty('Low', 182.73).withProperty('Close', 185.14).withProperty('Volume', 42_841_800).build(),
  NoteBuilder.create('Stock-2024-01-10.md').withProperty('Date', '2024-01-10').withProperty('Open', 184.35).withProperty('High', 186.40).withProperty('Low', 183.92).withProperty('Close', 186.19).withProperty('Volume', 46_792_900).build(),
  NoteBuilder.create('Stock-2024-01-11.md').withProperty('Date', '2024-01-11').withProperty('Open', 186.54).withProperty('High', 187.05).withProperty('Low', 183.62).withProperty('Close', 185.59).withProperty('Volume', 49_128_400).build(),
  NoteBuilder.create('Stock-2024-01-12.md').withProperty('Date', '2024-01-12').withProperty('Open', 186.06).withProperty('High', 186.74).withProperty('Low', 185.19).withProperty('Close', 185.92).withProperty('Volume', 40_444_700).build(),
  NoteBuilder.create('Stock-2024-01-16.md').withProperty('Date', '2024-01-16').withProperty('Open', 182.16).withProperty('High', 184.26).withProperty('Low', 180.93).withProperty('Close', 183.63).withProperty('Volume', 65_603_000).build(),
  NoteBuilder.create('Stock-2024-01-17.md').withProperty('Date', '2024-01-17').withProperty('Open', 181.27).withProperty('High', 182.93).withProperty('Low', 180.30).withProperty('Close', 182.68).withProperty('Volume', 47_317_400).build(),
  NoteBuilder.create('Stock-2024-01-18.md').withProperty('Date', '2024-01-18').withProperty('Open', 186.09).withProperty('High', 189.14).withProperty('Low', 185.83).withProperty('Close', 188.63).withProperty('Volume', 78_005_800).build(),
  NoteBuilder.create('Stock-2024-01-19.md').withProperty('Date', '2024-01-19').withProperty('Open', 189.33).withProperty('High', 191.95).withProperty('Low', 188.82).withProperty('Close', 191.56).withProperty('Volume', 68_741_000).build(),
  NoteBuilder.create('Stock-2024-01-22.md').withProperty('Date', '2024-01-22').withProperty('Open', 192.30).withProperty('High', 195.33).withProperty('Low', 192.26).withProperty('Close', 193.89).withProperty('Volume', 60_133_900).build(),
  NoteBuilder.create('Stock-2024-01-23.md').withProperty('Date', '2024-01-23').withProperty('Open', 195.02).withProperty('High', 195.75).withProperty('Low', 193.83).withProperty('Close', 195.18).withProperty('Volume', 42_355_600).build(),
  NoteBuilder.create('Stock-2024-01-24.md').withProperty('Date', '2024-01-24').withProperty('Open', 195.42).withProperty('High', 196.38).withProperty('Low', 194.34).withProperty('Close', 194.50).withProperty('Volume', 53_631_300).build(),
  NoteBuilder.create('Stock-2024-01-25.md').withProperty('Date', '2024-01-25').withProperty('Open', 195.22).withProperty('High', 196.27).withProperty('Low', 193.11).withProperty('Close', 194.17).withProperty('Volume', 54_822_100).build(),
  NoteBuilder.create('Stock-2024-01-26.md').withProperty('Date', '2024-01-26').withProperty('Open', 194.27).withProperty('High', 194.76).withProperty('Low', 191.94).withProperty('Close', 192.42).withProperty('Volume', 44_594_000).build(),
  NoteBuilder.create('Stock-2024-01-29.md').withProperty('Date', '2024-01-29').withProperty('Open', 192.01).withProperty('High', 192.20).withProperty('Low', 189.58).withProperty('Close', 191.73).withProperty('Volume', 47_145_600).build(),
  NoteBuilder.create('Stock-2024-01-30.md').withProperty('Date', '2024-01-30').withProperty('Open', 190.94).withProperty('High', 191.80).withProperty('Low', 187.47).withProperty('Close', 188.04).withProperty('Volume', 55_859_400).build(),
]

export const scoreDataset: readonly NoteDefinition[] = [
  NoteBuilder.create('Score-Alice-Math.md').withProperty('Subject', 'Math').withProperty('Score', 95).withProperty('Grade', 'A').withProperty('Student', 'Alice').build(),
  NoteBuilder.create('Score-Alice-Science.md').withProperty('Subject', 'Science').withProperty('Score', 88).withProperty('Grade', 'B').withProperty('Student', 'Alice').build(),
  NoteBuilder.create('Score-Alice-History.md').withProperty('Subject', 'History').withProperty('Score', 92).withProperty('Grade', 'A').withProperty('Student', 'Alice').build(),
  NoteBuilder.create('Score-Bob-Math.md').withProperty('Subject', 'Math').withProperty('Score', 78).withProperty('Grade', 'C').withProperty('Student', 'Bob').build(),
  NoteBuilder.create('Score-Bob-Science.md').withProperty('Subject', 'Science').withProperty('Score', 85).withProperty('Grade', 'B').withProperty('Student', 'Bob').build(),
  NoteBuilder.create('Score-Bob-History.md').withProperty('Subject', 'History').withProperty('Score', 80).withProperty('Grade', 'B').withProperty('Student', 'Bob').build(),
  NoteBuilder.create('Score-Charlie-Math.md').withProperty('Subject', 'Math').withProperty('Score', 100).withProperty('Grade', 'A').withProperty('Student', 'Charlie').build(),
  NoteBuilder.create('Score-Charlie-Science.md').withProperty('Subject', 'Science').withProperty('Score', 96).withProperty('Grade', 'A').withProperty('Student', 'Charlie').build(),
  NoteBuilder.create('Score-Charlie-History.md').withProperty('Subject', 'History').withProperty('Score', 94).withProperty('Grade', 'A').withProperty('Student', 'Charlie').build(),
  NoteBuilder.create('Score-Diana-Math.md').withProperty('Subject', 'Math').withProperty('Score', 82).withProperty('Grade', 'B').withProperty('Student', 'Diana').build(),
  NoteBuilder.create('Score-Diana-Science.md').withProperty('Subject', 'Science').withProperty('Score', 89).withProperty('Grade', 'B').withProperty('Student', 'Diana').build(),
  NoteBuilder.create('Score-Diana-History.md').withProperty('Subject', 'History').withProperty('Score', 85).withProperty('Grade', 'B').withProperty('Student', 'Diana').build(),
  NoteBuilder.create('Score-Eve-Math.md').withProperty('Subject', 'Math').withProperty('Score', 91).withProperty('Grade', 'A').withProperty('Student', 'Eve').build(),
  NoteBuilder.create('Score-Eve-Science.md').withProperty('Subject', 'Science').withProperty('Score', 93).withProperty('Grade', 'A').withProperty('Student', 'Eve').build(),
  NoteBuilder.create('Score-Eve-History.md').withProperty('Subject', 'History').withProperty('Score', 88).withProperty('Grade', 'B').withProperty('Student', 'Eve').build(),
]

export const countryDataset: readonly NoteDefinition[] = [
  NoteBuilder.create('Country-USA.md').withProperty('Country', 'USA').withProperty('Population', 331_002_651).withProperty('GDP', 21_433_226).withProperty('LifeExpectancy', 78.8).build(),
  NoteBuilder.create('Country-China.md').withProperty('Country', 'China').withProperty('Population', 1_439_323_776).withProperty('GDP', 14_342_903).withProperty('LifeExpectancy', 76.9).build(),
  NoteBuilder.create('Country-Japan.md').withProperty('Country', 'Japan').withProperty('Population', 126_476_461).withProperty('GDP', 5_081_770).withProperty('LifeExpectancy', 84.6).build(),
  NoteBuilder.create('Country-Germany.md').withProperty('Country', 'Germany').withProperty('Population', 83_783_942).withProperty('GDP', 3_861_123).withProperty('LifeExpectancy', 81.3).build(),
  NoteBuilder.create('Country-India.md').withProperty('Country', 'India').withProperty('Population', 1_380_004_385).withProperty('GDP', 2_870_504).withProperty('LifeExpectancy', 69.7).build(),
  NoteBuilder.create('Country-UK.md').withProperty('Country', 'UK').withProperty('Population', 67_886_011).withProperty('GDP', 2_829_108).withProperty('LifeExpectancy', 81.3).build(),
  NoteBuilder.create('Country-France.md').withProperty('Country', 'France').withProperty('Population', 65_273_511).withProperty('GDP', 2_715_518).withProperty('LifeExpectancy', 82.7).build(),
  NoteBuilder.create('Country-Italy.md').withProperty('Country', 'Italy').withProperty('Population', 60_461_826).withProperty('GDP', 2_003_576).withProperty('LifeExpectancy', 83.5).build(),
  NoteBuilder.create('Country-Brazil.md').withProperty('Country', 'Brazil').withProperty('Population', 212_559_417).withProperty('GDP', 1_839_758).withProperty('LifeExpectancy', 75.9).build(),
  NoteBuilder.create('Country-Canada.md').withProperty('Country', 'Canada').withProperty('Population', 37_742_154).withProperty('GDP', 1_736_426).withProperty('LifeExpectancy', 82.4).build(),
]

export const characterDataset: readonly NoteDefinition[] = [
  NoteBuilder.create('Char-Warrior.md').withProperty('Name', 'Grom').withProperty('Strength', 18).withProperty('Agility', 10).withProperty('Intelligence', 8).withProperty('Defense', 16).withProperty('HP', 150).build(),
  NoteBuilder.create('Char-Mage.md').withProperty('Name', 'Elara').withProperty('Strength', 6).withProperty('Agility', 12).withProperty('Intelligence', 20).withProperty('Defense', 8).withProperty('HP', 80).build(),
  NoteBuilder.create('Char-Rogue.md').withProperty('Name', 'Sylas').withProperty('Strength', 10).withProperty('Agility', 18).withProperty('Intelligence', 12).withProperty('Defense', 10).withProperty('HP', 100).build(),
  NoteBuilder.create('Char-Cleric.md').withProperty('Name', 'Bran').withProperty('Strength', 12).withProperty('Agility', 10).withProperty('Intelligence', 16).withProperty('Defense', 14).withProperty('HP', 120).build(),
  NoteBuilder.create('Char-Paladin.md').withProperty('Name', 'Kael').withProperty('Strength', 16).withProperty('Agility', 8).withProperty('Intelligence', 14).withProperty('Defense', 18).withProperty('HP', 140).build(),
  NoteBuilder.create('Char-Ranger.md').withProperty('Name', 'Lyra').withProperty('Strength', 12).withProperty('Agility', 16).withProperty('Intelligence', 10).withProperty('Defense', 12).withProperty('HP', 110).build(),
]

export const serverMetricsDataset: readonly NoteDefinition[] = [
  NoteBuilder.create('ServerA-0000.md').withProperty('Server', 'Server A').withProperty('Date', '2023-11-01T00:00:00Z').withProperty('CPU', 25).withProperty('Memory', 40).withProperty('Requests', 1500).build(),
  NoteBuilder.create('ServerA-0400.md').withProperty('Server', 'Server A').withProperty('Date', '2023-11-01T04:00:00Z').withProperty('CPU', 30).withProperty('Memory', 45).withProperty('Requests', 1800).build(),
  NoteBuilder.create('ServerA-0800.md').withProperty('Server', 'Server A').withProperty('Date', '2023-11-01T08:00:00Z').withProperty('CPU', 65).withProperty('Memory', 70).withProperty('Requests', 5500).build(),
  NoteBuilder.create('ServerA-1200.md').withProperty('Server', 'Server A').withProperty('Date', '2023-11-01T12:00:00Z').withProperty('CPU', 85).withProperty('Memory', 85).withProperty('Requests', 8000).build(),
  NoteBuilder.create('ServerA-1600.md').withProperty('Server', 'Server A').withProperty('Date', '2023-11-01T16:00:00Z').withProperty('CPU', 75).withProperty('Memory', 80).withProperty('Requests', 6500).build(),
  NoteBuilder.create('ServerA-2000.md').withProperty('Server', 'Server A').withProperty('Date', '2023-11-01T20:00:00Z').withProperty('CPU', 50).withProperty('Memory', 60).withProperty('Requests', 4000).build(),
  NoteBuilder.create('ServerB-0000.md').withProperty('Server', 'Server B').withProperty('Date', '2023-11-01T00:00:00Z').withProperty('CPU', 20).withProperty('Memory', 35).withProperty('Requests', 1200).build(),
  NoteBuilder.create('ServerB-0400.md').withProperty('Server', 'Server B').withProperty('Date', '2023-11-01T04:00:00Z').withProperty('CPU', 22).withProperty('Memory', 38).withProperty('Requests', 1400).build(),
  NoteBuilder.create('ServerB-0800.md').withProperty('Server', 'Server B').withProperty('Date', '2023-11-01T08:00:00Z').withProperty('CPU', 55).withProperty('Memory', 65).withProperty('Requests', 4800).build(),
  NoteBuilder.create('ServerB-1200.md').withProperty('Server', 'Server B').withProperty('Date', '2023-11-01T12:00:00Z').withProperty('CPU', 70).withProperty('Memory', 75).withProperty('Requests', 7000).build(),
  NoteBuilder.create('ServerB-1600.md').withProperty('Server', 'Server B').withProperty('Date', '2023-11-01T16:00:00Z').withProperty('CPU', 60).withProperty('Memory', 70).withProperty('Requests', 5800).build(),
  NoteBuilder.create('ServerB-2000.md').withProperty('Server', 'Server B').withProperty('Date', '2023-11-01T20:00:00Z').withProperty('CPU', 45).withProperty('Memory', 55).withProperty('Requests', 3500).build(),
  NoteBuilder.create('ServerC-0000.md').withProperty('Server', 'Server C').withProperty('Date', '2023-11-01T00:00:00Z').withProperty('CPU', 15).withProperty('Memory', 30).withProperty('Requests', 800).build(),
  NoteBuilder.create('ServerC-0400.md').withProperty('Server', 'Server C').withProperty('Date', '2023-11-01T04:00:00Z').withProperty('CPU', 18).withProperty('Memory', 32).withProperty('Requests', 1000).build(),
  NoteBuilder.create('ServerC-0800.md').withProperty('Server', 'Server C').withProperty('Date', '2023-11-01T08:00:00Z').withProperty('CPU', 40).withProperty('Memory', 50).withProperty('Requests', 3500).build(),
  NoteBuilder.create('ServerC-1200.md').withProperty('Server', 'Server C').withProperty('Date', '2023-11-01T12:00:00Z').withProperty('CPU', 55).withProperty('Memory', 60).withProperty('Requests', 5500).build(),
  NoteBuilder.create('ServerC-1600.md').withProperty('Server', 'Server C').withProperty('Date', '2023-11-01T16:00:00Z').withProperty('CPU', 45).withProperty('Memory', 55).withProperty('Requests', 4200).build(),
  NoteBuilder.create('ServerC-2000.md').withProperty('Server', 'Server C').withProperty('Date', '2023-11-01T20:00:00Z').withProperty('CPU', 30).withProperty('Memory', 40).withProperty('Requests', 2500).build(),
  NoteBuilder.create('ServerA-Summary.md').withProperty('Server', 'Server A').withProperty('Date', '2023-11-01T23:59:59Z').withProperty('CPU', 55).withProperty('Memory', 63.3).withProperty('Requests', 27_300).build(),
  NoteBuilder.create('ServerB-Summary.md').withProperty('Server', 'Server B').withProperty('Date', '2023-11-01T23:59:59Z').withProperty('CPU', 45.6).withProperty('Memory', 56.3).withProperty('Requests', 23_700).build(),
]
