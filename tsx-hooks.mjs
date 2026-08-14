// Node 26 native TS strips types but does not transform JSX. This loader hook
// lets `node --test` import .tsx view components by transpiling them with the
// installed `typescript` devDependency. Used only for tests:
//   node --import ./tsx-hooks.mjs --test
import { registerHooks } from 'node:module'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.')) {
      const candidates = [specifier, `${specifier}.ts`, `${specifier}.tsx`, `${specifier}.js`]
      for (const candidate of candidates) {
        try {
          return nextResolve(candidate, context)
        } catch {
          // Try the next candidate extension; the final nextResolve below
          // surfaces the original error when nothing matches.
        }
      }
    }
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (url.endsWith('.tsx')) {
      const filePath = fileURLToPath(url)
      const source = readFileSync(filePath, 'utf8')
      const { outputText } = ts.transpileModule(source, {
        fileName: filePath,
        compilerOptions: {
          jsx: ts.JsxEmit.ReactJSX,
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
        },
      })
      return { format: 'module', source: outputText, shortCircuit: true }
    }
    return nextLoad(url, context)
  },
})
