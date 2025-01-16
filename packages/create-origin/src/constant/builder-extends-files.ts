import type { TemplateInfo } from '$/template-system/types';
import type { ProjectConfig } from '$/types';
import { loader } from '$/template-system/template-map';
import { Builder } from '$/types';

export const BUILDER_EXTEND_FILE_MAP: Record<Builder, (config: ProjectConfig) => TemplateInfo[]> = {
  [Builder.vite]: (config: ProjectConfig) => {
    if (!config.enableTypeScript)
      return [];
    return [
      { filePath: 'src/vite-env.d.ts', loader, path: '/other/vite-env.d' },
    ];
  },
  [Builder.webpack]: () => [
  ],
  [Builder.rolldown]: () => [
  ],
  [Builder.rsbuild]: () => [
  ],
};
