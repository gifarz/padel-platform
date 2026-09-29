/** Plain-text teaser from markdown content — used when a news item has no hand-written excerpt. */
export function plainExcerpt(markdown: string, max = 140): string {
  const text = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links → label
    .replace(/https?:\/\/\S+/g, ' ') // bare URLs (incl. video embeds)
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '') // block markers
    .replace(/[*_`~|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length <= max ? text : text.slice(0, max).replace(/\s+\S*$/, '') + '…'
}
