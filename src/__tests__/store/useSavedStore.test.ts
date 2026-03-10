import { useSavedStore } from "@/lib/store/useSavedStore";
import type { Place } from "@/types";

const mockPlace: Place = {
  id: "place-1",
  name: "Eiffel Tower",
  category: "landmark",
  coordinates: { lat: 48.8584, lon: 2.2945 },
  source: "overpass",
};

beforeEach(() => {
  useSavedStore.setState({
    savedPlaces: [],
    savedLists: [],
    history: [],
    recentSearches: [],
  });
});

describe("savePlace / unsavePlace / isPlaceSaved", () => {
  it("saves a place", () => {
    useSavedStore.getState().savePlace(mockPlace);
    expect(useSavedStore.getState().savedPlaces).toHaveLength(1);
    expect(useSavedStore.getState().savedPlaces[0].placeId).toBe("place-1");
  });

  it("does not save the same place twice", () => {
    useSavedStore.getState().savePlace(mockPlace);
    useSavedStore.getState().savePlace(mockPlace);
    expect(useSavedStore.getState().savedPlaces).toHaveLength(1);
  });

  it("isPlaceSaved returns true for saved place", () => {
    useSavedStore.getState().savePlace(mockPlace);
    expect(useSavedStore.getState().isPlaceSaved("place-1")).toBe(true);
  });

  it("isPlaceSaved returns false for unsaved place", () => {
    expect(useSavedStore.getState().isPlaceSaved("place-1")).toBe(false);
  });

  it("unsaves a saved place", () => {
    useSavedStore.getState().savePlace(mockPlace);
    useSavedStore.getState().unsavePlace("place-1");
    expect(useSavedStore.getState().savedPlaces).toHaveLength(0);
    expect(useSavedStore.getState().isPlaceSaved("place-1")).toBe(false);
  });

  it("adds an entry to history on save", () => {
    useSavedStore.getState().savePlace(mockPlace);
    const { history } = useSavedStore.getState();
    expect(history).toHaveLength(1);
    expect(history[0].type).toBe("save");
    expect(history[0].placeId).toBe("place-1");
    expect(history[0].placeName).toBe("Eiffel Tower");
  });
});

describe("createList / updateList / deleteList", () => {
  it("creates a saved list", () => {
    useSavedStore.getState().createList("Food Spots", "🍽️");
    const { savedLists } = useSavedStore.getState();
    expect(savedLists).toHaveLength(1);
    expect(savedLists[0].name).toBe("Food Spots");
    expect(savedLists[0].emoji).toBe("🍽️");
    expect(savedLists[0].placeIds).toEqual([]);
  });

  it("creates a list without emoji", () => {
    useSavedStore.getState().createList("Hidden Gems");
    const { savedLists } = useSavedStore.getState();
    expect(savedLists[0].emoji).toBeUndefined();
  });

  it("updates a list", () => {
    const list = useSavedStore.getState().createList("Old Name");
    useSavedStore.getState().updateList(list.id, { name: "New Name" });
    expect(useSavedStore.getState().savedLists[0].name).toBe("New Name");
  });

  it("deletes a list and removes associated saved places", () => {
    const list = useSavedStore.getState().createList("My List");
    useSavedStore.getState().savePlace(mockPlace, list.id);
    expect(useSavedStore.getState().savedPlaces).toHaveLength(1);
    useSavedStore.getState().deleteList(list.id);
    expect(useSavedStore.getState().savedLists).toHaveLength(0);
    expect(useSavedStore.getState().savedPlaces).toHaveLength(0);
  });
});

describe("addToList / removeFromList", () => {
  it("adds a place id to a list", () => {
    const list = useSavedStore.getState().createList("Visit Later");
    useSavedStore.getState().addToList(list.id, "place-1");
    expect(useSavedStore.getState().savedLists[0].placeIds).toContain("place-1");
  });

  it("does not add duplicate place ids", () => {
    const list = useSavedStore.getState().createList("Visit Later");
    useSavedStore.getState().addToList(list.id, "place-1");
    useSavedStore.getState().addToList(list.id, "place-1");
    expect(useSavedStore.getState().savedLists[0].placeIds).toHaveLength(1);
  });

  it("removes a place id from a list", () => {
    const list = useSavedStore.getState().createList("Visit Later");
    useSavedStore.getState().addToList(list.id, "place-1");
    useSavedStore.getState().addToList(list.id, "place-2");
    useSavedStore.getState().removeFromList(list.id, "place-1");
    const updatedList = useSavedStore.getState().savedLists[0];
    expect(updatedList.placeIds).toHaveLength(1);
    expect(updatedList.placeIds).not.toContain("place-1");
  });
});

describe("addToHistory", () => {
  it("adds an entry to history", () => {
    useSavedStore.getState().addToHistory({
      type: "view",
      placeId: "p1",
      placeName: "Big Ben",
    });
    const { history } = useSavedStore.getState();
    expect(history).toHaveLength(1);
    expect(history[0].type).toBe("view");
    expect(history[0].placeId).toBe("p1");
    expect(history[0].id).toBeTruthy();
    expect(history[0].timestamp).toBeTruthy();
  });

  it("prepends new entries to history", () => {
    useSavedStore.getState().addToHistory({ type: "view", placeName: "A" });
    useSavedStore.getState().addToHistory({ type: "view", placeName: "B" });
    expect(useSavedStore.getState().history[0].placeName).toBe("B");
  });

  it("caps history at 200 entries", () => {
    for (let i = 0; i < 250; i++) {
      useSavedStore.getState().addToHistory({ type: "view", placeName: `Place ${i}` });
    }
    expect(useSavedStore.getState().history).toHaveLength(200);
  });
});

describe("addRecentSearch", () => {
  it("adds a search query", () => {
    useSavedStore.getState().addRecentSearch("Paris restaurants");
    expect(useSavedStore.getState().recentSearches).toContain("Paris restaurants");
  });

  it("does not add empty or whitespace queries", () => {
    useSavedStore.getState().addRecentSearch("");
    useSavedStore.getState().addRecentSearch("   ");
    expect(useSavedStore.getState().recentSearches).toHaveLength(0);
  });

  it("deduplicates queries and moves to front", () => {
    useSavedStore.getState().addRecentSearch("Paris");
    useSavedStore.getState().addRecentSearch("London");
    useSavedStore.getState().addRecentSearch("Paris");
    const { recentSearches } = useSavedStore.getState();
    expect(recentSearches[0]).toBe("Paris");
    expect(recentSearches).toHaveLength(2);
  });

  it("caps recent searches at 10", () => {
    for (let i = 0; i < 15; i++) {
      useSavedStore.getState().addRecentSearch(`Search ${i}`);
    }
    expect(useSavedStore.getState().recentSearches).toHaveLength(10);
  });
});

describe("clearHistory", () => {
  it("clears both history and recent searches", () => {
    useSavedStore.getState().addToHistory({ type: "view", placeName: "A" });
    useSavedStore.getState().addRecentSearch("test");
    useSavedStore.getState().clearHistory();
    const { history, recentSearches } = useSavedStore.getState();
    expect(history).toHaveLength(0);
    expect(recentSearches).toHaveLength(0);
  });
});
