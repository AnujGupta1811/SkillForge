export async function fetchStackOverflow(skill: string, tags: string[]) {
  const tagged = encodeURIComponent([skill, ...tags].join(';'))
  const key = process.env.STACKOVERFLOW_KEY
    ? `&key=${process.env.STACKOVERFLOW_KEY}` : ''
  const res = await fetch(
    `https://api.stackexchange.com/2.3/questions?order=desc&sort=votes&tagged=${tagged}&site=stackoverflow&filter=withbody&pagesize=10${key}`
  )
  const data = await res.json()
  return (data.items || []).map((item: any) => ({
    title: item.title,
    description: item.body?.replace(/<[^>]+>/g, '').slice(0, 300) || '',
    source: 'stackoverflow' as const,
    source_url: item.link,
    tags: item.tags,
  }))
}