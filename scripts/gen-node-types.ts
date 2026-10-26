/**
 * Writes src/generated/node-types.ts from the backend node type descriptors.
 *
 *   npm run gen:node-types                         # backend snapshot next to this repo
 *   npm run gen:node-types -- --from <file|url>    # a descriptor file or a running backend
 *
 * The default source is the snapshot the backend tests keep in step with the code
 * (sociallabs-app/src/test/resources/snapshots/node-types.json).
 */
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { generateNodeTypes } from '@/core/node-types/codegen'
import type { NodeTypeDescriptor } from '@/core/node-types/descriptor'

const DEFAULT_SOURCE = '../sociallabs/sociallabs-app/src/test/resources/snapshots/node-types.json'
const TARGET = 'src/generated/node-types.ts'

async function load(source: string): Promise<NodeTypeDescriptor[]> {
  if (/^https?:\/\//.test(source)) {
    const response = await fetch(source, { headers: process.env.API_TOKEN ? { Authorization: `Bearer ${process.env.API_TOKEN}` } : {} })
    if (!response.ok) throw new Error(`${source}: HTTP ${response.status}`)
    return (await response.json()) as NodeTypeDescriptor[]
  }
  return JSON.parse(await readFile(resolve(source), 'utf8')) as NodeTypeDescriptor[]
}

const fromFlag = process.argv.indexOf('--from')
const source = fromFlag >= 0 ? process.argv[fromFlag + 1]! : DEFAULT_SOURCE
const descriptors = await load(source)
await writeFile(resolve(TARGET), generateNodeTypes(descriptors))
console.log(`${TARGET}: ${descriptors.filter((d) => d.properties.length).length} schema node types from ${source}`)
