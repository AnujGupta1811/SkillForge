export async function fetchGithubIssues(skill: string, tags: string[]) {
  const query = encodeURIComponent(
    `${skill} ${tags.join(' ')} label:good-first-issue,help-wanted state:open`
  )
  const res = await fetch(
    `https://api.github.com/search/issues?q=${query}&sort=updated&per_page=10`,
    { headers: { Accept: 'application/vnd.github+json' } }
  )
  const data = await res.json()
  return (data.items || []).map((item: any) => ({
    title: item.title,
    description: item.body?.slice(0, 300) || '',
    source: 'github' as const,
    source_url: item.html_url,
    tags: item.labels.map((l: any) => l.name),
  }))
}