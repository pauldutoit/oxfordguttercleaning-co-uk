// Small library of stroke-based icons for reassurance cards. The card wrapper
// sets stroke color; each entry is a set of paths on a 24x24 viewBox. Fallback
// (the checkmark) renders when a card doesn't declare an icon or declares an
// unknown one, so this stays optional for future sites.
export const REASSURANCE_ICONS: Record<string, string> = {
  check: '<path d="M20 6L9 17l-5-5"/>',
  scales: '<path d="M12 3v18"/><path d="M4 7h16"/><path d="M4 7l-2 7a4 4 0 0 0 8 0z"/><path d="M20 7l2 7a4 4 0 0 1-8 0z"/>',
  shield: '<path d="M12 3 3 6v6c0 5 4 8 9 9 5-1 9-4 9-9V6z"/><path d="M8 12l3 3 5-5"/>',
  umbrella: '<path d="M12 3v3"/><path d="M3 12a9 9 0 0 1 18 0"/><path d="M3 12h18"/><path d="M12 12v7a2 2 0 0 1-4 0"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  handshake: '<path d="M3 12l4-4h4l3 3 3-3h4l3 4"/><path d="M7 15l4 4 3-3 4 3"/>',
  ribbon: '<circle cx="12" cy="10" r="6"/><path d="M8 15l-3 6 4-1 3 3 4-3 4 1-3-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
};
