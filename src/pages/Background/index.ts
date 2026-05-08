import {
  ContextEvent,
  HistoryAction,
  JsonViewAction,
  JsonViewReadyAction,
  JsonViewReadyResponse,
  JsonViewResponse,
} from '../../shared/types';
import { Renderer } from './types';
import { jsonRender } from './renderers/json_render';
import { ansiRender } from './renderers/ansi_render';
import { homepage } from '../../../package.json';
import { codeRender } from './renderers/code_render';
import { errorContent } from './utils';
import {
  addHistoryRecord,
  deleteHistoryRecord,
  dismissReviewPrompt,
  getReviewPromptState,
  getHistoryRecord,
  listHistoryRecords,
} from './history';

function messageError(e: any) {
  return {
    error: (e?.stack || e?.message || e) + '',
  };
}

__webpack_public_path__ = chrome.runtime.getURL('/');

chrome.contextMenus.removeAll(() => {
  chrome.contextMenus.create({
    id: 'json-view',
    title: 'JSON view',
    type: 'normal',
    contexts: ['all'],
  });
  chrome.contextMenus.create({
    id: 'ansi-view',
    title: 'ANSI view',
    type: 'normal',
    contexts: ['all'],
  });
  chrome.contextMenus.create({
    id: 'code-view',
    title: 'Code view',
    type: 'normal',
    contexts: ['all'],
  });
  chrome.contextMenus.create({
    id: 'html-view',
    title: 'HTML view',
    type: 'normal',
    contexts: ['all'],
  });
  chrome.contextMenus.create({
    id: 'help',
    title: 'Help',
    type: 'normal',
    contexts: ['all'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'help') {
    chrome.tabs.create({ url: homepage });
    return;
  }
  if (!tab?.id) {
    return;
  }
  chrome.tabs.sendMessage(tab?.id, {
    action: info.menuItemId as ContextEvent['action'],
  } satisfies ContextEvent);
});

const contentTypeMap = new Map<number, string>();
const REVIEW_URL =
  'https://chromewebstore.google.com/detail/rawlens/lbnkfmnolbefifdccejjijdgdipnfaib/reviews';

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    const contentType = details.responseHeaders?.find(
      (p) => p.name.toLowerCase() === 'content-type'
    );
    contentTypeMap.set(details.tabId, contentType?.value ?? '');
  },
  {
    types: ['main_frame'],
    urls: ['<all_urls>'],
  },
  ['responseHeaders']
);

const renderers: Record<JsonViewAction['type'], Renderer> = {
  json: jsonRender,
  code: codeRender,
  ansi: ansiRender,
};

chrome.runtime.onConnect.addListener((port) => {
  let disconnected = false;
  port.onMessage.addListener(async (message: JsonViewAction) => {
    try {
      for await (const content of renderers[message.type](message)) {
        if (disconnected) {
          return;
        }
        port.postMessage({ content } satisfies JsonViewResponse);
      }
    } catch (e) {
      port.postMessage({ content: errorContent(e) } satisfies JsonViewResponse);
    }
    port.disconnect();
  });
  port.onDisconnect.addListener(() => {
    disconnected = true;
  });
});

chrome.runtime.onMessage.addListener(
  (message: JsonViewReadyAction | HistoryAction, sender, sendResponse) => {
    if (message.type === 'json-view-ready') {
      if (!sender.tab?.id) {
        return;
      }
      const contentType = contentTypeMap.get(sender.tab.id) ?? 'text/html';
      contentTypeMap.delete(sender.tab.id);
      sendResponse({ contentType } as JsonViewReadyResponse);
      return;
    }

    if (message.type === 'history-add') {
      addHistoryRecord(message.record).then(sendResponse, (e) => sendResponse(messageError(e)));
      return true;
    }

    if (message.type === 'history-list') {
      listHistoryRecords().then(sendResponse, (e) => sendResponse(messageError(e)));
      return true;
    }

    if (message.type === 'history-get') {
      getHistoryRecord(message.id).then(sendResponse, (e) => sendResponse(messageError(e)));
      return true;
    }

    if (message.type === 'history-delete') {
      deleteHistoryRecord(message.id).then(
        () => sendResponse({ ok: true }),
        (e) => sendResponse(messageError(e))
      );
      return true;
    }

    if (message.type === 'history-review-state') {
      getReviewPromptState().then(sendResponse, (e) => sendResponse(messageError(e)));
      return true;
    }

    if (message.type === 'history-review-dismiss') {
      dismissReviewPrompt(message.reason).then(sendResponse, (e) => sendResponse(messageError(e)));
      return true;
    }

    if (message.type === 'history-review-open') {
      dismissReviewPrompt('open-review').then(
        (state) => {
          chrome.tabs.create({ url: REVIEW_URL });
          sendResponse(state);
        },
        (e) => sendResponse(messageError(e))
      );
      return true;
    }
  }
);
