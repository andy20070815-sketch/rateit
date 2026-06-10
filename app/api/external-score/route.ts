import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title')
  const apiKey = process.env.OMDB_API_KEY

  if (!title) return NextResponse.json(null)
  if (!apiKey) return NextResponse.json(null)

  try {
    const res = await fetch(
      `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`,
      { next: { revalidate: 3600 } }
    )
    const data = await res.json()

    if (data.Response === 'False') return NextResponse.json(null)

    const scores: { source: string; value: string }[] = []

    if (data.imdbRating && data.imdbRating !== 'N/A') {
      scores.push({ source: 'IMDb', value: data.imdbRating + '/10' })
    }
    const rt = data.Ratings?.find((r: { Source: string }) => r.Source === 'Rotten Tomatoes')
    if (rt) scores.push({ source: 'Rotten Tomatoes', value: rt.Value })
    const meta = data.Ratings?.find((r: { Source: string }) => r.Source === 'Metacritic')
    if (meta) scores.push({ source: 'Metacritic', value: meta.Value })

    return NextResponse.json({
      scores,
      poster: data.Poster !== 'N/A' ? data.Poster : null,
      year: data.Year !== 'N/A' ? data.Year : null,
      genre: data.Genre !== 'N/A' ? data.Genre : null,
      plot: data.Plot !== 'N/A' ? data.Plot : null,
      director: data.Director !== 'N/A' ? data.Director : null,
      actors: data.Actors !== 'N/A' ? data.Actors : null,
      runtime: data.Runtime !== 'N/A' ? data.Runtime : null,
      awards: data.Awards !== 'N/A' ? data.Awards : null,
      rated: data.Rated !== 'N/A' ? data.Rated : null,
    })
  } catch {
    return NextResponse.json(null)
  }
}
