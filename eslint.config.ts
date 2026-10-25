import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  skipFormatting,

  // src/core holds framework-free domain code (workflow document, commands, node types, sync).
  // It must stay testable in plain Node and reusable outside components (ADR-0009).
  {
    name: 'app/core-is-framework-free',
    files: ['src/core/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: [
          { name: 'vue', message: 'src/core must not depend on Vue; expose plain TS and adapt it in features/.' },
          { name: 'pinia', message: 'src/core must not depend on Pinia stores.' },
          { name: 'vue-router', message: 'src/core must not depend on the router.' },
        ],
        patterns: [
          { group: ['@vue-flow/*'], message: 'Canvas integration belongs to features/workflow-editor/canvas.' },
          { group: ['*.vue'], message: 'src/core must not import components.' },
          { group: ['@/stores/*', '@/components/*', '@/views/*', '@/features/*'], message: 'src/core must not depend on UI layers.' },
        ],
      }],
    },
  },
)
