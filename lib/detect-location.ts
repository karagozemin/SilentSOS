export type LocationDetectResult =
  | { ok: true; label: string }
  | { ok: false; error: string };

function readPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported in this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12_000,
      maximumAge: 60_000,
    });
  });
}

async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string> {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
  });

  const response = await fetch(`/api/reverse-geocode?${params}`);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Could not resolve address");
  }

  const { label } = (await response.json()) as { label: string };
  return label;
}

export async function detectLocationLabel(): Promise<LocationDetectResult> {
  try {
    const position = await readPosition();
    const label = await reverseGeocode(
      position.coords.latitude,
      position.coords.longitude,
    );
    return { ok: true, label };
  } catch (error) {
    const message =
      error instanceof GeolocationPositionError
        ? geolocationErrorMessage(error)
        : error instanceof Error
          ? error.message
          : "Location detection failed";
    return { ok: false, error: message };
  }
}

function geolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location permission denied";
    case error.POSITION_UNAVAILABLE:
      return "Location unavailable";
    case error.TIMEOUT:
      return "Location request timed out";
    default:
      return "Could not detect location";
  }
}
