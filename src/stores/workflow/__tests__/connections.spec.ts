import { describe, expect, it } from 'vitest'
import { ConnectionType, connectionKey, withoutConnections } from '../types'
import type { Connection } from '../types'

function connection(source: string, sourcePort: number, target: string, targetPort = 0, id?: string): Connection {
  return {
    id,
    sourceNodeId: source,
    sourceOutputIndex: sourcePort,
    targetNodeId: target,
    targetInputIndex: targetPort,
    type: ConnectionType.MAIN,
  }
}

describe('connectionKey', () => {
  it('distinguishes target input ports', () => {
    expect(connectionKey(connection('a', 0, 'm', 0))).not.toBe(connectionKey(connection('a', 0, 'm', 1)))
  })
})

describe('withoutConnections', () => {
  it('removes an unsaved connection that has no database id', () => {
    const unsaved = connection('a', 0, 'b')
    const kept = connection('b', 1, 'c', 0, '42')

    expect(withoutConnections([unsaved, kept], new Set([connectionKey(unsaved)]))).toEqual([kept])
  })

  it('removes only the edge with the given key', () => {
    const trueBranch = connection('if', 0, 'x')
    const falseBranch = connection('if', 1, 'x')

    expect(withoutConnections([trueBranch, falseBranch], new Set([connectionKey(falseBranch)]))).toEqual([trueBranch])
  })
})
