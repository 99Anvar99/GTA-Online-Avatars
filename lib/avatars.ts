export interface AvatarSlots {
  primary: string | null;
  secondary: string | null;
}

export interface Avatars {
  legacy: AvatarSlots;
  enhanced: AvatarSlots;
  rid: string | null;
  username: string | null;
}

export const isRockstarId = (value: string) => /^\d+$/.test(value);
