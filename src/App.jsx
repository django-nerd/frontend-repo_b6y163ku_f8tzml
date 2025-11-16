import { useEffect, useMemo, useState } from 'react'

function ChapterList({ chapters, onSelect }) {
  return (
    <div className="space-y-3">
      {chapters.map((ch) => (
        <button
          key={ch.id}
          onClick={() => onSelect(ch.id)}
          className="w-full text-left p-4 bg-white/70 hover:bg-white rounded-xl shadow transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{ch.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{ch.description}</p>
            </div>
            <span className="text-xs text-gray-500">{ch.exercises.length} exercises</span>
          </div>
        </button>
      ))}
    </div>
  )
}

function ExercisePanel({ chapter, onBack }) {
  const [selected, setSelected] = useState(chapter.exercises[0]?.id || '')
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const ex = chapter.exercises.find((e) => e.id === selected)
    setCode(ex?.starter_code || '')
    setResult(null)
  }, [selected, chapter])

  const baseUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])

  const run = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`${baseUrl}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapter_id: chapter.id, exercise_id: selected, code }),
      })
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setResult({ passed: false, feedback: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-blue-600 hover:underline">← Back to chapters</button>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1 space-y-2">
          {chapter.exercises.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelected(e.id)}
              className={`w-full text-left p-3 rounded-lg border ${selected === e.id ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}`}
            >
              <div className="font-medium text-gray-800">{e.title}</div>
            </button>
          ))}
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="p-4 bg-white rounded-xl shadow">
            <h3 className="text-xl font-semibold text-gray-800">Prompt</h3>
            <p className="text-gray-700 mt-2">
              {chapter.exercises.find((e) => e.id === selected)?.prompt}
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold text-gray-800">Your Code</h3>
              <button
                onClick={() => setCode(chapter.exercises.find((e) => e.id === selected)?.starter_code || '')}
                className="text-sm text-gray-600 hover:text-gray-800"
              >Reset</button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-56 font-mono text-sm p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="# Type your solution here"
            />
            <button
              onClick={run}
              disabled={loading}
              className={`mt-3 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 ${loading ? 'opacity-70' : ''}`}
            >{loading ? 'Running...' : 'Run Tests'}</button>
          </div>

          {result && (
            <div className={`p-4 rounded-xl shadow ${result.passed ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="font-semibold text-gray-800">
                {result.passed ? 'All tests passed' : 'Some tests failed'}
              </div>
              <div className="text-gray-700 mt-1 whitespace-pre-wrap">{result.feedback}</div>
              {result.details && (
                <pre className="mt-3 bg-white/70 p-3 rounded border text-xs overflow-auto">{JSON.stringify(result.details, null, 2)}</pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function App() {
  const [chapters, setChapters] = useState([])
  const [activeChapter, setActiveChapter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const baseUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${baseUrl}/chapters`)
        const data = await res.json()
        setChapters(data.chapters || [])
      } catch (e) {
        setError('Failed to load chapters')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [baseUrl])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-sky-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Python Coding Practice</h1>
          <p className="text-gray-600 mt-2">Practice by chapters with instant feedback</p>
        </div>

        {loading && <div className="text-center text-gray-600">Loading...</div>}
        {error && <div className="text-center text-red-600">{error}</div>}

        {!loading && !activeChapter && (
          <ChapterList chapters={chapters} onSelect={setActiveChapter} />
        )}

        {activeChapter && (
          <ExercisePanel
            chapter={chapters.find((c) => c.id === activeChapter)}
            onBack={() => setActiveChapter(null)}
          />
        )}
      </div>
    </div>
  )
}

export default App
