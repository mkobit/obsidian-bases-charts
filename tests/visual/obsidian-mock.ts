export class Component {
  registerEvent() {}
  load() {}
  unload() {}
  addChild() {}
  removeChild() {}
}

export class View extends Component {
  app = {
    workspace: {
      on: () => {},
      trigger: () => {},
    },
    vault: {
        adapter: {
            read: async () => "{}"
        }
    }
  };
  containerEl = document.createElement('div');

  constructor() { super(); }

  onResize() {}
  onOpen() {}
  onClose() {}
}

export class ItemView extends View {
  contentEl = document.createElement('div');
  constructor() {
    super();
    this.contentEl.className = 'view-content';
    this.containerEl.appendChild(this.contentEl);
  }
}

// Mocking BasesView as if it exists in Obsidian (per project usage)
export class BasesView extends ItemView {
  config = new Map<string, any>();
  data = { data: [] };

  constructor(public controller: any) {
    super();
  }
}

export function debounce(func: Function, wait: number, immediate: boolean) {
  // For visual tests, we might want immediate execution or simple timeout
  return (...args: any[]) => {
      func(...args);
  };
}

export class Plugin {
    settings = { defaultHeight: '500px' };
    async saveSettings() {}
    async loadData() { return {}; }
    async saveData() {}
    addSettingTab() {}
}

export class PluginSettingTab {
    constructor(public app: any, public plugin: any) {}
    display() {}
}

export class Setting {
    constructor(public containerEl: HTMLElement) {}
    setName() { return this; }
    setDesc() { return this; }
    addText() { return this; }
    addToggle() { return this; }
}

export class App {}

export const Platform = {
    isMobile: true // As per project memory
};
