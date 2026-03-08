"use client";

import { useState } from "react";
import { Plus, Trash2, Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PlaceCard } from "@/components/places/PlaceCard";
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
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-surface border-b border-border px-4 py-5">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Saved</h1>
            <p className="text-sm text-text-secondary mt-1">
              {savedPlaces.length} {savedPlaces.length === 1 ? "place" : "places"} saved
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

        {/* List filter tabs */}
        <div className="flex gap-2 overflow-x-auto mt-4 pb-1 scrollbar-none">
          <button
            onClick={() => setActiveList(null)}
            className={clsx(
              "flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150",
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
                  "flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150",
                  activeList === list.id
                    ? "bg-accent text-white border-accent"
                    : "bg-surface text-text-secondary border-border hover:border-border-strong"
                )}
              >
                {list.emoji && <span>{list.emoji}</span>}
                {list.name} ({count})
                {activeList === list.id && (
                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${list.name}"?`)) {
                        deleteList(list.id);
                        setActiveList(null);
                      }
                    }}
                    className="ml-1 hover:opacity-70 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3 inline" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-5">
        {/* New list form */}
        {showNewList && (
          <div className="flex items-center gap-2 p-3 bg-surface border border-border rounded-xl mb-4 animate-slide-up">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="List name…"
              className="flex-1 text-sm bg-transparent text-text-primary placeholder:text-text-tertiary focus:outline-none"
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
          <div className="flex flex-col items-center text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-surface-tertiary flex items-center justify-center mb-4">
              <Heart className="w-7 h-7 text-text-tertiary" />
            </div>
            <h2 className="text-base font-semibold text-text-primary">
              {activeList ? "No places in this list" : "Nothing saved yet"}
            </h2>
            <p className="text-sm text-text-secondary mt-1 max-w-xs">
              Tap the bookmark icon on any place to save it here for later.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3 stagger">
            {filteredPlaces.map(({ place }) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
