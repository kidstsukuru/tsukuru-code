export const getDiceBearUrl = (style: string, seed: string): string => {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=fef3c7,fed7aa,fecaca,d9f99d,a5f3fc,c4b5fd`;
};

export const AVATAR_STYLES = [
  { id: 'adventurer', emoji: '🗓️' },
  { id: 'avataaars', emoji: '😎' },
  { id: 'bottts', emoji: '🤖' },
  { id: 'lorelei', emoji: '👩' },
  { id: 'personas', emoji: '👤' },
  { id: 'pixel-art', emoji: '🎮' },
  { id: 'big-ears', emoji: '🐰' },
  { id: 'fun-emoji', emoji: '😊' },
  { id: 'initials', emoji: '🔤' },
] as const;

export type AvatarStyle = typeof AVATAR_STYLES[number]['id'];
