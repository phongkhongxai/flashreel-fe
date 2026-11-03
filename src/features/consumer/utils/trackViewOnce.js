// Do not retry a failed POST: the server may have counted it before a timeout.
export async function trackViewOnce(videoId, viewed, api) {
  if (viewed.has(videoId)) return undefined;
  viewed.add(videoId);
  await api.recordView(videoId);
  const playback = await api.playback(videoId);
  return playback.views;
}
