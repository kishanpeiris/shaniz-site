import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet, apiPost, apiDelete } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import StarRating from './StarRating.jsx'
import StarRatingInput from './StarRatingInput.jsx'
import { formatCalendarDate } from '../lib/date.js'

function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-xs text-[#8a8672]">
      <span className="w-10">{star} star</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e9e2cd]">
        <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right">{count}</span>
    </div>
  )
}

function ReviewForm({ productId, onSubmitted }) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) return setError('Please choose a star rating.')
    setSubmitting(true)
    setError(null)
    try {
      const res = await apiPost(`/api/products/${productId}/reviews`, { rating, title, comment })
      onSubmitted(res.review)
      setRating(0)
      setTitle('')
      setComment('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-sm border border-gold/30 bg-cream/60 p-5">
      <p className="mb-2 text-sm font-semibold text-forestDeep">Write a review</p>
      <StarRatingInput value={rating} onChange={setRating} />
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Give your review a title (optional)"
        maxLength={120}
        className="mt-3 w-full rounded-sm border border-gold/30 bg-white px-3 py-2 text-sm"
      />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="What did you think? (optional)"
        maxLength={2000}
        rows={3}
        className="mt-2 w-full rounded-sm border border-gold/30 bg-white px-3 py-2 text-sm"
      />
      {error && <p className="mt-2 text-sm text-[#a35a3a]">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="mt-3 rounded-full bg-forestDeep px-5 py-2.5 text-xs uppercase tracking-wide text-cream disabled:opacity-50"
      >
        {submitting ? 'Posting…' : 'Post Review'}
      </button>
    </form>
  )
}

export default function ProductReviews({ productId }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState([])
  const [summary, setSummary] = useState({ count: 0, average: 0, breakdown: {} })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    let cancelled = false
    apiGet(`/api/products/${productId}/reviews`).then((res) => {
      if (cancelled) return
      setReviews(res.reviews)
      setSummary(res.summary)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [productId])

  // The real "you already reviewed this" enforcement is server-side
  // (409 on a second POST) — this is just a nicety to hide the button
  // once we can already see the user's own review in the list.
  const alreadyReviewed = user && reviews.some((r) => r.user_id === user.id)

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Remove this review?')) return
    await apiDelete(`/api/reviews/${reviewId}`)
    setReviews((prev) => prev.filter((r) => r.id !== reviewId))
  }

  const canDelete = (review) =>
    user && (user.id === review.user_id || ['admin', 'superadmin'].includes(user.role))

  if (loading) return null

  return (
    <div className="mt-16 border-t border-gold/20 pt-10">
      <h2 className="mb-5 text-2xl text-forestDeep">Reviews</h2>

      <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold text-forestDeep">
              {summary.average > 0 ? summary.average.toFixed(1) : '—'}
            </span>
            <StarRating rating={summary.average} size="text-lg" />
          </div>
          <p className="mb-4 mt-1 text-sm text-[#8a8672]">
            Based on {summary.count} review{summary.count === 1 ? '' : 's'}
          </p>
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => (
              <RatingBar key={star} star={star} count={summary.breakdown[star] || 0} total={summary.count} />
            ))}
          </div>
        </div>

        <div>
          {reviews.length === 0 && (
            <p className="mb-5 text-sm text-[#8a8672]">
              No reviews yet — be the first to share what you thought.
            </p>
          )}
          <ul className="space-y-5">
            {reviews.map((r) => (
              <li key={r.id} className="border-b border-gold/15 pb-5 last:border-0">
                <div className="flex items-center justify-between">
                  <div>
                    <StarRating rating={r.rating} />
                    {r.title && <p className="mt-1 font-semibold text-forestDeep">{r.title}</p>}
                  </div>
                  {canDelete(r) && (
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-xs uppercase tracking-wide text-[#a35a3a] underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {r.comment && <p className="mt-1.5 text-sm text-[#5c5949]">{r.comment}</p>}
                <p className="mt-1.5 text-xs text-[#8a8672]">
                  {r.author_name} · {formatCalendarDate(r.created_at)}
                  {r.is_verified_purchase && (
                    <span className="ml-2 rounded-full bg-moss/15 px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-moss">
                      Verified Purchase
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            {!user && (
              <p className="text-sm text-[#8a8672]">
                <Link to="/login" className="text-moss underline">
                  Log in
                </Link>{' '}
                to write a review (only customers who've purchased this product can review it).
              </p>
            )}
            {user && !showForm && !alreadyReviewed && (
              <button
                onClick={() => setShowForm(true)}
                className="rounded-full border border-forestDeep px-5 py-2.5 text-xs uppercase tracking-wide text-forestDeep hover:bg-forestDeep hover:text-cream"
              >
                Write a Review
              </button>
            )}
            {user && showForm && (
              <ReviewForm
                productId={productId}
                onSubmitted={(review) => {
                  setReviews((prev) => [{ ...review, user_id: user.id }, ...prev])
                  setSummary((s) => ({
                    count: s.count + 1,
                    average: (s.average * s.count + review.rating) / (s.count + 1),
                    breakdown: { ...s.breakdown, [review.rating]: (s.breakdown[review.rating] || 0) + 1 },
                  }))
                  setShowForm(false)
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
