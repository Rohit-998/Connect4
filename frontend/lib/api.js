const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function apiNewGame(difficulty = "medium", opponent = "alphabeta", token = null) {
  const headers = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${API_URL}/api/new-game`, {
    method: "POST",
    headers,
    body: JSON.stringify({ difficulty, opponent }),
  })
  return res.json()
}

export async function apiMakeMove(gameId, column, token = null) {
  const headers = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${API_URL}/api/make-move`, {
    method: "POST",
    headers,
    body: JSON.stringify({ game_id: gameId, column }),
  })
  return res.json()
}

export async function apiGetGame(gameId) {
  const res = await fetch(`${API_URL}/api/game/${gameId}`)
  return res.json()
}

export async function apiSaveReplay(gameId, result, token) {
  const res = await fetch(`${API_URL}/api/save-replay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ game_id: gameId, result }),
  })
  return res.json()
}

export async function apiGetReplays(token) {
  const res = await fetch(`${API_URL}/api/replays`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function apiGetReplay(replayId, token) {
  const res = await fetch(`${API_URL}/api/replay/${replayId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function apiAIvsAI(difficulty = "hard") {
  const res = await fetch(`${API_URL}/api/ai-vs-ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ difficulty }),
  })
  return res.json()
}
