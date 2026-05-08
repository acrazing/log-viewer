/*
 * @since 2024-11-28 21:40:02
 * @author junbao <junbao@moego.pet>
 */

import init, { type BiomePath, Workspace } from '@biomejs/wasm-web';

let lazy: Promise<unknown> | undefined = void 0;

export const biomeFormat = async (content: string, ext: string): Promise<string> => {
  if (!lazy) {
    lazy = init();
  }
  await lazy;
  const ws = new Workspace();
  const { projectKey } = ws.openProject({ openUninitialized: true, path: '/' });
  ws.updateSettings({
    projectKey,
    configuration: {
      files: { maxSize: 100 << 20 },
    },
  });
  const filePath: BiomePath = `/main.${ext}`;
  ws.openFile({
    projectKey,
    path: filePath,
    content: { content, type: 'fromClient', version: 0 },
  });
  const printed = ws.formatFile({ projectKey, path: filePath });
  return printed.code;
};
