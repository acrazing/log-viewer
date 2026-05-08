import { detectUrlExt } from '../../shared/utils';
import {
  ContextEvent,
  HistoryAction,
  HistoryListItem,
  HistoryRecord,
  HistoryRecordInput,
  HistorySourceType,
  JsonViewAction,
  JsonViewReadyAction,
  JsonViewReadyResponse,
  JsonViewResponse,
} from '../../shared/types';
import commonStyle from './index.css?raw';
import Port = chrome.runtime.Port;

const EXCERPT_LIMIT = 240;

interface RenderOptions {
  src?: 'clipboard';
  sourceType?: HistorySourceType;
  saveHistory?: boolean;
}

interface TargetSource {
  content: string;
  sourceType: HistorySourceType;
}

export async function getTargetText(targetElement: HTMLElement | undefined | 'clipboard') {
  if (targetElement === 'clipboard') {
    return await navigator.clipboard.readText();
  }
  return document.getSelection()?.toString()?.trim() || targetElement?.innerText || '';
}

async function getTargetSource(src?: 'clipboard'): Promise<TargetSource> {
  if (src === 'clipboard') {
    return {
      content: await navigator.clipboard.readText(),
      sourceType: 'clipboard',
    };
  }

  const selectedText = document.getSelection()?.toString()?.trim();
  if (selectedText) {
    return {
      content: selectedText,
      sourceType: 'selection',
    };
  }

  return {
    content: targetElement?.innerText || '',
    sourceType: 'node',
  };
}

export async function getCode() {
  const r = await fetch('');
  const content = await r.text();
  const contentType = r.headers.get('content-type') || '';
  return [content, contentType] as const;
}

let styleElem: HTMLStyleElement | undefined;
let htmlElem: HTMLDivElement | undefined;
let contentElem: HTMLDivElement | undefined;
let historyElem: HTMLElement | undefined;
let historyToggleElem: HTMLButtonElement | undefined;
let historyListElem: HTMLDivElement | undefined;
let historyStatusElem: HTMLDivElement | undefined;
let port: Port | undefined;
let activeHistoryId: number | undefined;
let historyCollapsed = false;
let lastHistoryItems: HistoryListItem[] = [];

function sendRuntimeMessage<T>(message: HistoryAction | JsonViewReadyAction): Promise<T> {
  return chrome.runtime.sendMessage(message).then((res) => {
    if (res?.error) {
      throw new Error(res.error);
    }
    return res as T;
  });
}

const close = () => {
  if (htmlElem?.parentNode) {
    htmlElem.innerHTML = '';
    htmlElem.parentNode.removeChild(htmlElem);
  }
  if (styleElem?.parentNode) {
    styleElem.parentNode.removeChild(styleElem);
  }
  contentElem = void 0;
  historyElem = void 0;
  historyToggleElem = void 0;
  historyListElem = void 0;
  historyStatusElem = void 0;
  activeHistoryId = void 0;
  port?.disconnect();
  port = void 0;
};

function handleLineClick(e: MouseEvent) {
  if (!(e.target instanceof HTMLElement) || !e.target.classList.contains('line')) {
    return;
  }

  const open = e.target.classList.contains('closed');
  const indent = (e.target.textContent || '').match(/^\s*/)![0].length;
  let el = e.target.nextElementSibling;
  let found = false;
  while (el) {
    const content = el.textContent || '';
    const nextIndent = content.match(/^\s*/)![0].length;
    if (indent < nextIndent || !content.trim()) {
      el.classList.remove('closed');
      open ? el.classList.remove('hidden') : el.classList.add('hidden');
      el = el.nextElementSibling;
      found ||= true;
    } else {
      break;
    }
  }
  if (found) {
    e.target.classList.toggle('closed');
  }
}

function ensureElements() {
  if (!styleElem) {
    styleElem = document.createElement('style');
  }
  if (!htmlElem) {
    htmlElem = document.createElement('div');
    htmlElem.id = 'json-view-container';
    htmlElem.addEventListener('click', handleLineClick);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        close();
      }
    });
    window.addEventListener('click', (e) => {
      if (e.target instanceof Node && htmlElem?.parentNode && !htmlElem.contains(e.target)) {
        close();
      }
    });
  }
}

function setHistoryCollapsed(collapsed: boolean) {
  historyCollapsed = collapsed;
  historyElem?.classList.toggle('collapsed', collapsed);
  if (historyToggleElem) {
    historyToggleElem.textContent = collapsed ? '<' : '>';
    historyToggleElem.title = collapsed ? 'Show history' : 'Hide history';
    historyToggleElem.setAttribute('aria-label', collapsed ? 'Show history' : 'Hide history');
    historyToggleElem.setAttribute('aria-expanded', (!collapsed).toString());
  }
}

function ensureShell() {
  ensureElements();
  if (!htmlElem || (contentElem && htmlElem.contains(contentElem))) {
    return;
  }

  htmlElem.innerHTML = '';

  const main = document.createElement('div');
  main.className = 'log-viewer-main';

  contentElem = document.createElement('div');
  contentElem.className = 'log-viewer-content';
  main.appendChild(contentElem);

  historyElem = document.createElement('aside');
  historyElem.className = 'log-viewer-history';

  const header = document.createElement('div');
  header.className = 'log-viewer-history-header';

  const title = document.createElement('div');
  title.className = 'log-viewer-history-title';
  title.textContent = 'History';

  historyToggleElem = document.createElement('button');
  historyToggleElem.className = 'log-viewer-history-toggle';
  historyToggleElem.type = 'button';
  historyToggleElem.addEventListener('click', (e) => {
    e.stopPropagation();
    setHistoryCollapsed(!historyCollapsed);
  });

  header.append(title, historyToggleElem);

  historyStatusElem = document.createElement('div');
  historyStatusElem.className = 'log-viewer-history-status';

  historyListElem = document.createElement('div');
  historyListElem.className = 'log-viewer-history-list';

  historyElem.append(header, historyStatusElem, historyListElem);
  htmlElem.append(main, historyElem);
  setHistoryCollapsed(historyCollapsed);
}

function setViewClass(view?: string) {
  if (!htmlElem || !view) {
    return;
  }
  const isFull = htmlElem.classList.contains('full');
  htmlElem.className = view;
  if (isFull) {
    htmlElem.classList.add('full');
  }
}

const open = (view?: string) => {
  ensureShell();
  if (!styleElem || !htmlElem) {
    return;
  }
  if (!styleElem.parentNode) {
    styleElem.innerHTML = commonStyle;
    document.head.appendChild(styleElem);
  }
  if (!htmlElem.parentNode) {
    document.body.appendChild(htmlElem);
  }
  setViewClass(view);
  void loadHistory();
};

function excludeJsonView<T>(fn: () => T): T {
  if (styleElem?.parentNode && htmlElem?.parentNode) {
    const className = htmlElem.className;
    close();
    const value = fn();
    open();
    if (htmlElem) {
      htmlElem.className = className;
    }
    return value;
  }
  return fn();
}

export function getHtml() {
  return excludeJsonView(() => document.documentElement.outerHTML);
}

export function getTextContent() {
  return excludeJsonView(() => document.body.textContent || '');
}

function formatHistoryContentType(
  action: ContextEvent['action'],
  contentType: string,
  url: string
) {
  if (action === 'json-view') {
    return 'json';
  }
  if (action === 'ansi-view') {
    return 'ansi';
  }
  if (action === 'html-view') {
    return 'html';
  }

  const urlExt = detectUrlExt(url);
  if (urlExt) {
    return urlExt;
  }

  const mimeType = contentType.split(';')[0].trim().toLowerCase();
  const subtype = mimeType.split('/')[1];
  return subtype?.replace(/^x-/, '').replace(/^vnd\..*\+/, '') || mimeType || 'code';
}

function excerpt(content: string) {
  return content.trim().replace(/\s+/g, ' ').slice(0, EXCERPT_LIMIT);
}

async function addHistory(record: HistoryRecordInput) {
  const saved = await sendRuntimeMessage<HistoryRecord>({
    type: 'history-add',
    record,
  });
  activeHistoryId = saved.id;
  await loadHistory();
}

async function loadHistory() {
  if (!historyListElem || !historyStatusElem) {
    return;
  }

  historyStatusElem.textContent = 'Loading...';
  try {
    lastHistoryItems = await sendRuntimeMessage<HistoryListItem[]>({
      type: 'history-list',
    });
    renderHistoryItems(lastHistoryItems);
  } catch (e) {
    historyStatusElem.textContent = 'History unavailable';
  }
}

function formatHistoryTime(time: number) {
  return new Date(time).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function createBadge(text: string, className = '') {
  const badge = document.createElement('span');
  badge.className = `log-viewer-history-badge ${className}`.trim();
  badge.textContent = text;
  return badge;
}

function renderHistoryItems(items: HistoryListItem[]) {
  if (!historyListElem || !historyStatusElem) {
    return;
  }

  historyListElem.innerHTML = '';
  historyStatusElem.textContent = items.length
    ? `${items.length} record${items.length > 1 ? 's' : ''}`
    : 'No history yet';

  for (const item of items) {
    const entry = document.createElement('div');
    entry.className = 'log-viewer-history-item';
    entry.tabIndex = 0;
    entry.setAttribute('role', 'button');
    if (item.id === activeHistoryId) {
      entry.classList.add('active');
    }
    entry.addEventListener('click', () => {
      void showHistoryRecord(item.id);
    });
    entry.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        void showHistoryRecord(item.id);
      }
    });

    const row = document.createElement('div');
    row.className = 'log-viewer-history-row';

    const badges = document.createElement('div');
    badges.className = 'log-viewer-history-badges';
    badges.append(
      createBadge(item.contentType || 'code'),
      createBadge(item.sourceType, 'source'),
      createBadge(formatHistoryTime(item.time), 'time')
    );

    const deleteButton = document.createElement('button');
    deleteButton.className = 'log-viewer-history-delete';
    deleteButton.type = 'button';
    deleteButton.title = 'Delete';
    deleteButton.setAttribute('aria-label', 'Delete history entry');
    deleteButton.textContent = 'x';
    deleteButton.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        await sendRuntimeMessage<{ ok: boolean }>({
          type: 'history-delete',
          id: item.id,
        });
        if (activeHistoryId === item.id) {
          activeHistoryId = void 0;
        }
        await loadHistory();
      } catch (e) {
        if (historyStatusElem) {
          historyStatusElem.textContent = 'Delete failed';
        }
      }
    });

    row.append(badges, deleteButton);

    const text = document.createElement('div');
    text.className = 'log-viewer-history-excerpt';
    text.textContent = item.excerpt || '(empty)';

    entry.append(row, text);
    historyListElem.appendChild(entry);
  }
}

function getHistoryRenderType(record: HistoryRecord): JsonViewAction['type'] {
  if (record.contentType === 'ansi') {
    return 'ansi';
  }
  if (record.contentType === 'json') {
    return 'json';
  }
  return 'code';
}

function getHistoryRenderContentType(record: HistoryRecord) {
  if (record.contentType === 'html') {
    return 'text/html';
  }
  if (record.contentType === 'json') {
    return 'application/json';
  }
  return record.contentType;
}

async function showHistoryRecord(id: number) {
  let record: HistoryRecord | undefined;
  try {
    record = await sendRuntimeMessage<HistoryRecord | undefined>({
      type: 'history-get',
      id,
    });
  } catch (e) {
    if (historyStatusElem) {
      historyStatusElem.textContent = 'History load failed';
    }
    return;
  }

  if (!record) {
    await loadHistory();
    return;
  }

  activeHistoryId = record.id;
  renderHistoryItems(lastHistoryItems);

  const task = prepareElem('history-view');
  if (contentElem) {
    contentElem.textContent = `Loading (${task})...`;
  }
  await showJsonView(
    task,
    getHistoryRenderType(record),
    record.content,
    getHistoryRenderContentType(record),
    record.url
  );
}

let taskId = 0;

function prepareElem(view: string): number {
  open(view);
  return ++taskId;
}

async function showJsonView(
  id: number,
  type: JsonViewAction['type'],
  content: string,
  contentType: string = '',
  url: string = location.href
) {
  if (taskId !== id) {
    return;
  }
  ensureShell();
  content = content.trim();
  if (!content) {
    if (contentElem) {
      contentElem.innerHTML = '';
    }
    return;
  }
  const action: JsonViewAction = { type, content, contentType, url };
  if (styleElem) {
    styleElem.innerHTML = commonStyle;
  }
  if (contentElem) {
    contentElem.innerHTML = '';
  }
  port?.disconnect();
  port = chrome.runtime.connect();
  port.onDisconnect.addListener(() => {
    port = void 0;
  });
  const parts: string[] = [''];
  port.onMessage.addListener((res: JsonViewResponse) => {
    if (!contentElem) {
      return;
    }
    if (parts[parts.length - 1].length > 20 << 20) {
      parts.push('');
    }
    parts[parts.length - 1] += res.content;
    if (parts.length === 1) {
      const div = document.createElement('div');
      div.innerHTML = res.content;
      const inCode = div.querySelector(':scope > pre > code');
      const toCode = contentElem.querySelector(':scope > pre > code');
      if (inCode && toCode) {
        toCode.append(...inCode.childNodes);
      } else {
        contentElem.append(...div.childNodes);
      }
    }
  });
  port.postMessage(action);
}

async function render(action: ContextEvent['action'], options: RenderOptions = {}) {
  const id = prepareElem(action);
  activeHistoryId = void 0;
  if (contentElem) {
    contentElem.textContent = `Loading (${id})...`;
  }

  let content = '';
  let contentType = '';
  let renderType: JsonViewAction['type'] = 'code';
  let sourceType: HistorySourceType = options.sourceType || 'code';

  switch (action) {
    case 'json-view': {
      const target = await getTargetSource(options.src);
      content = target.content;
      sourceType = options.sourceType || target.sourceType;
      renderType = 'json';
      break;
    }
    case 'ansi-view': {
      const target = await getTargetSource(options.src);
      content = target.content;
      sourceType = options.sourceType || target.sourceType;
      renderType = 'ansi';
      break;
    }
    case 'html-view':
      content = getHtml();
      contentType = 'text/html';
      sourceType = options.sourceType || 'html';
      renderType = 'code';
      break;
    case 'code-view': {
      const result = await getCode();
      content = result[0];
      contentType = result[1];
      sourceType = options.sourceType || 'code';
      const urlExt = detectUrlExt(location.href);
      renderType = contentType.includes('json') || urlExt.includes('json') ? 'json' : 'code';
      break;
    }
  }

  if (options.saveHistory !== false) {
    try {
      await addHistory({
        time: Date.now(),
        contentType: formatHistoryContentType(action, contentType, location.href),
        sourceType,
        excerpt: excerpt(content),
        content,
        url: location.href,
      });
    } catch (e) {
      if (historyStatusElem) {
        historyStatusElem.textContent = 'History save failed';
      }
    }
  }

  await showJsonView(id, renderType, content, contentType);
}

const accepts: Record<string, ContextEvent['action'] | 'full'> = {
  v: 'json-view',
  x: 'ansi-view',
  h: 'html-view',
  c: 'code-view',
  p: 'json-view',
  f: 'full',
};

const sources: Partial<Record<string, 'clipboard'>> = {
  p: 'clipboard',
};

let targetElement: HTMLElement | undefined;

['contextmenu', 'mousemove'].forEach((e) =>
  document.addEventListener(e, (e) => {
    if (e.target instanceof Node && htmlElem?.contains(e.target)) {
      return;
    }
    targetElement = void 0;
    if (e.target instanceof HTMLElement) {
      targetElement = e.target;
    }
  })
);

const shouldAuto = (type: string) => {
  return /css|yaml|yml|js|javascript|xml|json|markdown|patch|diff|jsx|mjs|tsx|typescript|sql/i.test(
    type
  );
};

const shouldNot = (type: string) => {
  return /html|image|video|audio/i.test(type);
};

chrome.runtime.onMessage.addListener((message: ContextEvent) => {
  void render(message.action);
});

sendRuntimeMessage<JsonViewReadyResponse>({ type: 'json-view-ready' }).then((r) => {
  if (shouldNot(r.contentType)) {
    return;
  }
  if (shouldAuto(r.contentType) || shouldAuto(detectUrlExt(location.href))) {
    return render('code-view', {
      sourceType: 'file',
    });
  }
});

let lastKey = '';
let lastTime = 0;

document.addEventListener('keydown', async (e) => {
  if (
    document.activeElement instanceof HTMLInputElement ||
    document.activeElement instanceof HTMLTextAreaElement ||
    (document.activeElement as HTMLElement | null)?.isContentEditable
  ) {
    return;
  }
  const oldKey = lastKey;
  const oldTime = lastTime;
  lastKey = e.key;
  lastTime = Date.now();
  if (!accepts[lastKey] || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
    lastKey = '';
    lastTime = 0;
    return;
  }
  if (document.getSelection()?.toString()) {
    e.preventDefault();
  }
  if (lastKey !== oldKey) {
    return;
  }
  if (lastTime - oldTime < 300) {
    e.preventDefault();
    const action = accepts[e.key];
    if (action === 'full') {
      htmlElem?.classList.toggle('full');
      return;
    }
    await render(action, {
      src: sources[e.key],
    });
  }
});
