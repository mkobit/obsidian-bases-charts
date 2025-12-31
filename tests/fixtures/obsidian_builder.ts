import { Temporal } from 'temporal-polyfill';

/**
 * Represents the valid types for Obsidian frontmatter properties.
 * Now includes Temporal types.
 */
export type FrontmatterValue =
    | string
    | number
    | boolean
    | null
    | Temporal.PlainDate
    | Temporal.ZonedDateTime
    | Temporal.Instant
    | FrontmatterValue[];

/**
 * A strongly-typed representation of an Obsidian frontmatter block.
 */
export type Frontmatter = Record<string, FrontmatterValue>;

/**
 * Interface representing a test Obsidian file.
 */
export interface TestFile {
    name: string;
    path: string[];
    filename: string;
    frontmatter: Frontmatter;
    content?: string;
}

/**
 * Builder for creating TestFile instances.
 */
export class ObsidianFileBuilder {
    private file: TestFile;

    private constructor(name: string) {
        this.file = {
            name,
            filename: `${name}.md`,
            path: [],
            frontmatter: {}
        };
    }

    static create(name: string): ObsidianFileBuilder {
        return new ObsidianFileBuilder(name);
    }

    withPath(segments: string[]): ObsidianFileBuilder {
        this.file.path = segments;
        return this;
    }

    withProperty(key: string, value: FrontmatterValue): ObsidianFileBuilder {
        this.file.frontmatter[key] = value;
        return this;
    }

    withFrontmatter(frontmatter: Frontmatter): ObsidianFileBuilder {
        this.file.frontmatter = { ...this.file.frontmatter, ...frontmatter };
        return this;
    }

    withContent(content: string): ObsidianFileBuilder {
        this.file.content = content;
        return this;
    }

    build(): TestFile {
        // Return a copy of the file object.
        // For frontmatter (which contains Polyfill objects that break structuredClone),
        // we do a shallow copy. This is sufficient for most test builders.
        return {
            ...this.file,
            path: [...this.file.path],
            frontmatter: { ...this.file.frontmatter }
        };
    }

    toRawString(): string {
        const fmKeys = Object.keys(this.file.frontmatter);
        let output = '';

        if (fmKeys.length > 0) {
            output += '---\n';
            for (const key of fmKeys) {
                const val = this.file.frontmatter[key];
                // Check for undefined explicitly, though type says it shouldn't happen if key is from keys()
                if (val !== undefined) {
                    output += `${key}: ${this.formatYamlValue(val)}\n`;
                }
            }
            output += '---\n';
        }

        if (this.file.content) {
            output += this.file.content;
        }

        return output;
    }

    private formatYamlValue(val: FrontmatterValue): string {
        if (val === null) return 'null';

        // Check for Temporal types using 'in' check or instanceof
        // Using instanceof is safer for classes
        if (val instanceof Temporal.PlainDate ||
            val instanceof Temporal.ZonedDateTime ||
            val instanceof Temporal.Instant) {
            return val.toString();
        }

        if (Array.isArray(val)) {
            // Recursive call for array items
            return `[${val.map(v => this.formatYamlValue(v)).join(', ')}]`;
        }

        if (typeof val === 'string') return `"${val}"`;

        // number or boolean
        return String(val);
    }
}
