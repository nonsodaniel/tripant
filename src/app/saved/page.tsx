"use client";

import { useState } from "react";
import { Plus, Bookmark, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PlaceCard } from "@/components/places/PlaceCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSavedStore } from "@/lib/store/useSavedStore";
import { clsx } from "clsx";

export default function SavedPage() {
  const { savedPlaces, savedLists, createList, deleteList } = useSavedStore();
  const [activeList, setActiveList] = useState<string | null>(null);
  const [newListName, setNewListName] = useState("");
  const [showNewList, setShowNewList] = useState(false);

  const filteredPlaces = activeList
    ? savedPlaces.filter((sp) => sp.listId === activeList)
    : savedPlaces;

  function handleCreateList() {
    if (!newListName.trim()) return;
    createList(newListName.trim());
    setNewListName("");
    setShowNewList(false);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Saved</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {savedPlaces.length} saved places
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowNewList(true)}
        >
          New List
        </Button>
      </div>

      {/* List tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
        <button
          onClick={() => setActiveList(null)}
          className={clsx(
            "flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150",
            !activeList
              ? "bg-accent text-white border-accent"
              : "bg-surface text-text-secondary border-border hover:border-border-strong"
          )}
        >
          All ({savedPlaces.length})
        </button>
        {savedLists.map((list) => {
          const count = savedPlaces.filter((sp) => sp.listId === list.id).length;
          return (
            <button
              key={list.id}
              onClick={() => setActiveList(activeList === list.id ? null : list.id)}
              className={clsx(
                "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150",
                activeList === list.id
                  ? "bg-accent text-white border-accent"
                  : "bg-surface text-text-secondary border-border hover:border-border-strong"
              )}
            >
              {list.emoji && <span>{list.emoji}</span>}
              {list.name} ({count})
              {activeList === list.id && (
                <button
                  onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${list.name}"?`)) deleteList(list.id); }}
                  className="ml-1 hover:text-red-300"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </button>
          );
        })}
      </div>

      {/* New list form */}
      {showNewList && (
        <div className="flex items-center gap-2 p-3 bg-surface border border-border rounded-xl mb-4">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="List name…"
            className="flex-1 text-sm bg-transparent text-text-primary focus:outline-none"
            onKeyDown={(e) => { if (e.key === "Enter") handleCreateList(); }}
            autoFocus
          />
          <Button variant="primary" size="sm" onClick={handleCreateList} disabled={!newListName.trim()}>
            Create
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowNewList(false)}>
            Cancel
          </Button>
        </div>
      )}

      {filteredPlaces.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-6 h-6" />}
          title="No saved places"
          description="Tap the bookmark icon on any place to save it here."
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filteredPlaces.map(({ place }) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </div>
  );
}
