export function getStaticMapUrl(latitude: number, longitude: number, zoom: number = 15, height: number = 300, width: number = 600) {
  const { googleMapsApiKey } = useRuntimeConfig().public
  return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}&key=${googleMapsApiKey}`
}
