import { describe, expect, it } from 'vitest'
import { renameNodeReferences, renameReferencesInText } from '..'

describe('node references', () => {
  const renames = new Map([
    ['If', 'If 2'],
    ['Set', 'Set 2'],
    ["Bob's", "Bob's 2"],
  ])

  it('rewrites bracket references with either quote', () => {
    expect(renameReferencesInText("{{ $node['If'].json.a }}", renames)).toBe("{{ $node['If 2'].json.a }}")
    expect(renameReferencesInText('{{ $node["If"].json.a }}', renames)).toBe('{{ $node["If 2"].json.a }}')
  })

  it('handles escaped quotes in names', () => {
    expect(renameReferencesInText("$node['Bob\\'s']", renames)).toBe("$node['Bob\\'s 2']")
  })

  it('rewrites dot references, switching to brackets when the new name is not an identifier', () => {
    expect(renameReferencesInText('$node.Set.json', renames)).toBe("$node['Set 2'].json")
  })

  it('leaves other nodes and plain text alone', () => {
    expect(renameReferencesInText("$node['Other'].json $node.Settings", renames)).toBe("$node['Other'].json $node.Settings")
    expect(renameReferencesInText('If and Set', renames)).toBe('If and Set')
  })

  it('walks nested parameters', () => {
    const parameters = { a: "{{ $node['If'].json }}", list: [{ b: '$node.Set' }], n: 1, flag: true, none: null }
    expect(renameNodeReferences(parameters, renames)).toEqual({
      a: "{{ $node['If 2'].json }}",
      list: [{ b: "$node['Set 2']" }],
      n: 1,
      flag: true,
      none: null,
    })
  })

  it('returns the same parameters when nothing is renamed', () => {
    const parameters = { a: '$node.If' }
    expect(renameNodeReferences(parameters, new Map())).toBe(parameters)
  })
})
