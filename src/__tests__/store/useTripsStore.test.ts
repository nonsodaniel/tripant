import { useTripsStore } from "@/lib/store/useTripsStore";
import type { Place } from "@/types";

// Reset store state before each test
beforeEach(() => {
  useTripsStore.setState({ trips: [], activeTrip: null });
});

const mockPlace: Place = {
  id: "osm-node-1",
  name: "The Louvre",
  category: "museum",
  coordinates: { lat: 48.8606, lon: 2.3376 },
  source: "overpass",
};

describe("createTrip", () => {
  it("creates a trip and adds it to the store", () => {
    useTripsStore.getState().createTrip({ name: "Paris Trip", destination: "Paris" });
    const { trips } = useTripsStore.getState();
    expect(trips).toHaveLength(1);
    expect(trips[0].name).toBe("Paris Trip");
    expect(trips[0].destination).toBe("Paris");
    expect(trips[0].days).toEqual([]);
    expect(trips[0].id).toBeTruthy();
  });

  it("prepends new trips to the list", () => {
    useTripsStore.getState().createTrip({ name: "Trip A", destination: "A" });
    useTripsStore.getState().createTrip({ name: "Trip B", destination: "B" });
    const { trips } = useTripsStore.getState();
    expect(trips[0].name).toBe("Trip B");
    expect(trips[1].name).toBe("Trip A");
  });

  it("returns the created trip", () => {
    const trip = useTripsStore.getState().createTrip({ name: "Rome Trip", destination: "Rome" });
    expect(trip.name).toBe("Rome Trip");
    expect(trip.id).toBeTruthy();
  });
});

describe("deleteTrip", () => {
  it("removes the trip from the store", () => {
    const trip = useTripsStore.getState().createTrip({ name: "Delete Me", destination: "X" });
    useTripsStore.getState().deleteTrip(trip.id);
    expect(useTripsStore.getState().trips).toHaveLength(0);
  });

  it("clears activeTrip when deleting active trip", () => {
    const trip = useTripsStore.getState().createTrip({ name: "Active", destination: "X" });
    useTripsStore.getState().setActiveTrip(trip);
    useTripsStore.getState().deleteTrip(trip.id);
    expect(useTripsStore.getState().activeTrip).toBeNull();
  });

  it("does not remove other trips", () => {
    const tripA = useTripsStore.getState().createTrip({ name: "A", destination: "A" });
    const tripB = useTripsStore.getState().createTrip({ name: "B", destination: "B" });
    useTripsStore.getState().deleteTrip(tripA.id);
    const { trips } = useTripsStore.getState();
    expect(trips).toHaveLength(1);
    expect(trips[0].id).toBe(tripB.id);
  });
});

describe("addDay / removeDay", () => {
  it("adds a day to a trip", () => {
    const trip = useTripsStore.getState().createTrip({ name: "T", destination: "D" });
    useTripsStore.getState().addDay(trip.id, "2025-06-01");
    const updated = useTripsStore.getState().getTrip(trip.id);
    expect(updated!.days).toHaveLength(1);
    expect(updated!.days[0].date).toBe("2025-06-01");
    expect(updated!.days[0].dayNumber).toBe(1);
  });

  it("assigns sequential day numbers", () => {
    const trip = useTripsStore.getState().createTrip({ name: "T", destination: "D" });
    useTripsStore.getState().addDay(trip.id, "2025-06-01");
    useTripsStore.getState().addDay(trip.id, "2025-06-02");
    useTripsStore.getState().addDay(trip.id, "2025-06-03");
    const updated = useTripsStore.getState().getTrip(trip.id);
    expect(updated!.days.map((d) => d.dayNumber)).toEqual([1, 2, 3]);
  });

  it("removes a day and renumbers remaining", () => {
    const trip = useTripsStore.getState().createTrip({ name: "T", destination: "D" });
    useTripsStore.getState().addDay(trip.id, "2025-06-01");
    useTripsStore.getState().addDay(trip.id, "2025-06-02");
    useTripsStore.getState().addDay(trip.id, "2025-06-03");
    const dayId = useTripsStore.getState().getTrip(trip.id)!.days[0].id;
    useTripsStore.getState().removeDay(trip.id, dayId);
    const updated = useTripsStore.getState().getTrip(trip.id);
    expect(updated!.days).toHaveLength(2);
    expect(updated!.days.map((d) => d.dayNumber)).toEqual([1, 2]);
  });
});

describe("addPlaceToDay / removePlaceFromDay", () => {
  it("adds a place to a day", () => {
    const trip = useTripsStore.getState().createTrip({ name: "T", destination: "D" });
    useTripsStore.getState().addDay(trip.id, "2025-06-01");
    const dayId = useTripsStore.getState().getTrip(trip.id)!.days[0].id;
    useTripsStore.getState().addPlaceToDay(trip.id, dayId, mockPlace);
    const day = useTripsStore.getState().getTrip(trip.id)!.days[0];
    expect(day.places).toHaveLength(1);
    expect(day.places[0].place.id).toBe("osm-node-1");
  });

  it("removes a place from a day", () => {
    const trip = useTripsStore.getState().createTrip({ name: "T", destination: "D" });
    useTripsStore.getState().addDay(trip.id, "2025-06-01");
    const dayId = useTripsStore.getState().getTrip(trip.id)!.days[0].id;
    useTripsStore.getState().addPlaceToDay(trip.id, dayId, mockPlace);
    const tripPlaceId = useTripsStore.getState().getTrip(trip.id)!.days[0].places[0].id;
    useTripsStore.getState().removePlaceFromDay(trip.id, dayId, tripPlaceId);
    expect(useTripsStore.getState().getTrip(trip.id)!.days[0].places).toHaveLength(0);
  });

  it("assigns order correctly when adding multiple places", () => {
    const trip = useTripsStore.getState().createTrip({ name: "T", destination: "D" });
    useTripsStore.getState().addDay(trip.id, "2025-06-01");
    const dayId = useTripsStore.getState().getTrip(trip.id)!.days[0].id;
    const placeA = { ...mockPlace, id: "a" };
    const placeB = { ...mockPlace, id: "b" };
    useTripsStore.getState().addPlaceToDay(trip.id, dayId, placeA);
    useTripsStore.getState().addPlaceToDay(trip.id, dayId, placeB);
    const places = useTripsStore.getState().getTrip(trip.id)!.days[0].places;
    expect(places[0].order).toBe(0);
    expect(places[1].order).toBe(1);
  });
});

describe("reorderPlaces", () => {
  it("reorders places within a day", () => {
    const placeA = { ...mockPlace, id: "place-a", name: "A" };
    const placeB = { ...mockPlace, id: "place-b", name: "B" };
    const placeC = { ...mockPlace, id: "place-c", name: "C" };
    const trip = useTripsStore.getState().createTrip({ name: "T", destination: "D" });
    useTripsStore.getState().addDay(trip.id, "2025-06-01");
    const dayId = useTripsStore.getState().getTrip(trip.id)!.days[0].id;
    useTripsStore.getState().addPlaceToDay(trip.id, dayId, placeA);
    useTripsStore.getState().addPlaceToDay(trip.id, dayId, placeB);
    useTripsStore.getState().addPlaceToDay(trip.id, dayId, placeC);
    // Move first item (A) to index 2
    useTripsStore.getState().reorderPlaces(trip.id, dayId, 0, 2);
    const places = useTripsStore.getState().getTrip(trip.id)!.days[0].places;
    expect(places[0].place.id).toBe("place-b");
    expect(places[1].place.id).toBe("place-c");
    expect(places[2].place.id).toBe("place-a");
    expect(places.map((p) => p.order)).toEqual([0, 1, 2]);
  });
});

describe("getTrip", () => {
  it("returns trip by id", () => {
    const trip = useTripsStore.getState().createTrip({ name: "Find Me", destination: "X" });
    const found = useTripsStore.getState().getTrip(trip.id);
    expect(found).toBeDefined();
    expect(found!.name).toBe("Find Me");
  });

  it("returns undefined for non-existent id", () => {
    expect(useTripsStore.getState().getTrip("nonexistent")).toBeUndefined();
  });
});

describe("updateTrip", () => {
  it("updates trip fields", () => {
    const trip = useTripsStore.getState().createTrip({ name: "Old Name", destination: "Old Dest" });
    useTripsStore.getState().updateTrip(trip.id, { name: "New Name", destination: "New Dest" });
    const updated = useTripsStore.getState().getTrip(trip.id);
    expect(updated!.name).toBe("New Name");
    expect(updated!.destination).toBe("New Dest");
  });
});
