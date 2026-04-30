export async function fetchHackerNews(skill: string) {
  const query = encodeURIComponent(skill)
  const res = await fetch(
    `https://hn.algolia.com/api/v1/search?query=${query}&tags=ask_hn&hitsPerPage=10`
  )
  const data = await res.json()
  return (data.hits || []).map((item: any) => ({
    title: item.title,
    description: item.story_text?.slice(0, 300) || '',
    source: 'hackernews' as const,
    source_url: `https://news.ycombinator.com/item?id=${item.objectID}`,
    tags: [skill],
  }))
}