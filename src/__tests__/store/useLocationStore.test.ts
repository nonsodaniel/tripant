import { useLocationStore } from "@/lib/store/useLocationStore";

beforeEach(() => {
  useLocationStore.setState({
    coordinates: null,
    city: null,
    country: null,
    address: null,
    permissionStatus: "unknown",
    isLocating: false,
  });
});

describe("setCoordinates", () => {
  it("sets coordinates", () => {
    useLocationStore.getState().setCoordinates({ lat: 51.5074, lon: -0.1278 });
    expect(useLocationStore.getState().coordinates).toEqual({ lat: 51.5074, lon: -0.1278 });
  });

  it("overwrites previous coordinates", () => {
    useLocationStore.getState().setCoordinates({ lat: 1, lon: 2 });
    useLocationStore.getState().setCoordinates({ lat: 48.8566, lon: 2.3522 });
    expect(useLocationStore.getState().coordinates).toEqual({ lat: 48.8566, lon: 2.3522 });
  });
});

describe("setCityInfo", () => {
  it("sets city, country, and address", () => {
    useLocationStore.getState().setCityInfo({
      city: "London",
      country: "United Kingdom",
      address: "London, UK",
    });
    const state = useLocationStore.getState();
    expect(state.city).toBe("London");
    expect(state.country).toBe("United Kingdom");
    expect(state.address).toBe("London, UK");
  });

  it("sets undefined fields to null", () => {
    useLocationStore.getState().setCityInfo({ city: "Tokyo" });
    const state = useLocationStore.getState();
    expect(state.city).toBe("Tokyo");
    expect(state.country).toBeNull();
    expect(state.address).toBeNull();
  });

  it("partial update does not affect other fields", () => {
    useLocationStore.getState().setCityInfo({ city: "Madrid", country: "Spain", address: "Spain" });
    useLocationStore.getState().setCityInfo({ city: "Barcelona" });
    const state = useLocationStore.getState();
    expect(state.city).toBe("Barcelona");
    expect(state.country).toBeNull(); // reset because not provided
  });
});

describe("setPermissionStatus", () => {
  it("updates permission status", () => {
    useLocationStore.getState().setPermissionStatus("granted");
    expect(useLocationStore.getState().permissionStatus).toBe("granted");
  });

  it("handles all valid statuses", () => {
    const statuses: Array<"prompt" | "granted" | "denied" | "unknown"> = [
      "prompt",
      "granted",
      "denied",
      "unknown",
    ];
    for (const status of statuses) {
      useLocationStore.getState().setPermissionStatus(status);
      expect(useLocationStore.getState().permissionStatus).toBe(status);
    }
  });
});

describe("setIsLocating", () => {
  it("sets isLocating to true", () => {
    useLocationStore.getState().setIsLocating(true);
    expect(useLocationStore.getState().isLocating).toBe(true);
  });

  it("sets isLocating back to false", () => {
    useLocationStore.getState().setIsLocating(true);
    useLocationStore.getState().setIsLocating(false);
    expect(useLocationStore.getState().isLocating).toBe(false);
  });
});

describe("reset", () => {
  it("resets all state to initial values", () => {
    useLocationStore.getState().setCoordinates({ lat: 51.5, lon: -0.1 });
    useLocationStore.getState().setCityInfo({ city: "London", country: "UK" });
    useLocationStore.getState().setPermissionStatus("granted");
    useLocationStore.getState().setIsLocating(true);
    useLocationStore.getState().reset();
    const state = useLocationStore.getState();
    expect(state.coordinates).toBeNull();
    expect(state.city).toBeNull();
    expect(state.country).toBeNull();
    expect(state.address).toBeNull();
    expect(state.permissionStatus).toBe("unknown");
    expect(state.isLocating).toBe(false);
  });
});
