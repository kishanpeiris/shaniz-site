import React, { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '../../api/client.js'

// A <select> of categories (with one-level subcategories shown indented
// under their parent) plus a "Manage" link that opens a small panel to
// add, rename, or delete categories/subcategories right there — no
// separate admin page needed for what's a fairly small, occasional
// task. `kind` scopes this to either 'product' or 'service' categories,
// since the two are kept as separate lists (see schema.sql).
export default function CategoryPicker({ kind, value, onChange }) {
  const [categories, setCategories] = useState([])
  const [managing, setManaging] = useState(false)
  const [error, setError] = useState('')

  const load = () =>
    apiGet(`/api/categories?kind=${kind}`)
      .then((r) => setCategories(r.categories))
      .catch((e) => setError(e.message))

  useEffect(() => {
    load()
  }, [kind])

  // Top-level categories first, each immediately followed by its own
  // subcategories — gives the flat <select> a grouped feel without
  // needing <optgroup> (which can't be indented/styled consistently).
  const topLevel = categories.filter((c) => !c.parent_id)
  const ordered = topLevel.flatMap((parent) => [
    parent,
    ...categories.filter((c) => c.parent_id === parent.id),
  ])

  return (
    <div>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
      >
        <option value="">No category</option>
        {ordered.map((c) => (
          <option key={c.id} value={c.id}>
            {c.parent_id ? `\u2014 ${c.name}` : c.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => setManaging((m) => !m)}
        className="mt-1 text-[0.65rem] uppercase tracking-wide text-moss underline"
      >
        {managing ? 'Close' : 'Manage categories'}
      </button>

      {managing && (
        <CategoryManager
          kind={kind}
          categories={categories}
          error={error}
          onError={setError}
          onChanged={load}
        />
      )}
    </div>
  )
}

function CategoryManager({ kind, categories, error, onError, onChanged }) {
  const [newName, setNewName] = useState('')
  const [newParent, setNewParent] = useState('')
  const [renaming, setRenaming] = useState(null)
  const [renameValue, setRenameValue] = useState('')

  const topLevel = categories.filter((c) => !c.parent_id)

  const add = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    onError('')
    try {
      await apiPost('/api/categories', { kind, name: newName.trim(), parent_id: newParent || null })
      setNewName('')
      setNewParent('')
      onChanged()
    } catch (err) {
      onError(err.message)
    }
  }

  const rename = async (id) => {
    if (!renameValue.trim()) return
    onError('')
    try {
      await apiPut(`/api/categories/${id}`, { name: renameValue.trim() })
      setRenaming(null)
      onChanged()
    } catch (err) {
      onError(err.message)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this category? Products/services in it will just become uncategorized \u2014 nothing else is deleted.')) return
    onError('')
    try {
      await apiDelete(`/api/categories/${id}`)
      onChanged()
    } catch (err) {
      onError(err.message)
    }
  }

  return (
    <div className="mt-2 rounded-sm border border-gold/25 bg-cream/60 p-3">
      {error && <p className="mb-2 text-xs text-[#a35a3a]">{error}</p>}
      <ul className="mb-3 space-y-1 text-xs">
        {categories.length === 0 && <li className="text-[#8a8672]">No categories yet.</li>}
        {topLevel.map((parent) => (
          <React.Fragment key={parent.id}>
            <CategoryRow
              category={parent}
              renaming={renaming === parent.id}
              renameValue={renameValue}
              onStartRename={() => {
                setRenaming(parent.id)
                setRenameValue(parent.name)
              }}
              onRenameValueChange={setRenameValue}
              onRenameSave={() => rename(parent.id)}
              onRenameCancel={() => setRenaming(null)}
              onDelete={() => remove(parent.id)}
            />
            {categories
              .filter((c) => c.parent_id === parent.id)
              .map((child) => (
                <CategoryRow
                  key={child.id}
                  category={child}
                  indent
                  renaming={renaming === child.id}
                  renameValue={renameValue}
                  onStartRename={() => {
                    setRenaming(child.id)
                    setRenameValue(child.name)
                  }}
                  onRenameValueChange={setRenameValue}
                  onRenameSave={() => rename(child.id)}
                  onRenameCancel={() => setRenaming(null)}
                  onDelete={() => remove(child.id)}
                />
              ))}
          </React.Fragment>
        ))}
      </ul>

      <form onSubmit={add} className="flex flex-wrap items-center gap-1.5">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category or subcategory name"
          className="min-w-[10rem] flex-1 rounded-sm border border-gold/30 bg-ivory px-2 py-1 text-xs"
        />
        <select
          value={newParent}
          onChange={(e) => setNewParent(e.target.value)}
          className="rounded-sm border border-gold/30 bg-ivory px-2 py-1 text-xs"
        >
          <option value="">Top-level category</option>
          {topLevel.map((c) => (
            <option key={c.id} value={c.id}>
              Subcategory of {c.name}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-full bg-forestDeep px-3 py-1 text-[0.65rem] uppercase tracking-wide text-cream">
          Add
        </button>
      </form>
    </div>
  )
}

function CategoryRow({ category, indent, renaming, renameValue, onRenameValueChange, onStartRename, onRenameSave, onRenameCancel, onDelete }) {
  return (
    <li className={`flex items-center justify-between gap-2 ${indent ? 'pl-4' : ''}`}>
      {renaming ? (
        <>
          <input
            value={renameValue}
            onChange={(e) => onRenameValueChange(e.target.value)}
            className="flex-1 rounded-sm border border-gold/30 bg-ivory px-1.5 py-0.5 text-xs"
            autoFocus
          />
          <button type="button" onClick={onRenameSave} className="text-forestDeep underline">Save</button>
          <button type="button" onClick={onRenameCancel} className="text-[#8a8672] underline">Cancel</button>
        </>
      ) : (
        <>
          <span className="flex-1 truncate text-forestDeep">{indent ? `\u2014 ${category.name}` : category.name}</span>
          <button type="button" onClick={onStartRename} className="text-forestDeep underline">Rename</button>
          <button type="button" onClick={onDelete} className="text-[#a35a3a] underline">Delete</button>
        </>
      )}
    </li>
  )
}
