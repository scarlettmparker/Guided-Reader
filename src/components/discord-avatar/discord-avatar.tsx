import { cn } from "@sun/components";
import styles from "./discord-avatar.module.css";

type DiscordAvatarProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "alt" | "title" | "role" | "aria-label" | "aria-labelledby"
> & {
  /**
   * Alternative text for the avatar. Defaults to decorative (empty).
   */
  alt?: string;
  /**
   * Discord user id used to build the CDN URL.
   */
  discordId: string;

  /**
   * Discord avatar hash.
   */
  avatar?: string | null;

  /**
   * Rendered diameter in pixels.
   */
  size?: number;
};

const SIZE_BUCKETS = [16, 32, 64, 128, 256, 512, 1024];

/**
 * Returns the nearest supported Discord image size for a requested diameter.
 *
 * @param size the requested pixel diameter
 * @returns the closest Discord-supported size bucket
 */
function bucket(size: number): number {
  for (const s of SIZE_BUCKETS) {
    if (size <= s) return s;
  }
  return SIZE_BUCKETS[SIZE_BUCKETS.length - 1];
}

/**
 * Builds the Discord CDN URL for a user avatar, or the default avatar.
 *
 * @param discordId the Discord user id
 * @param avatar the avatar hash, or null/undefined for the default avatar
 * @param size the requested pixel diameter
 * @returns the avatar CDN URL
 */
function avatarUrl(discordId: string, avatar: string | null | undefined, size: number): string {
  if (avatar) {
    const ext = avatar.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.${ext}?size=${bucket(size)}`;
  }
  let idx = 0;
  try {
    idx = Number((BigInt(discordId) >> 22n) % 6n);
  } catch {
    idx = 0;
  }
  return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
}

/**
 * Circular Discord profile picture rendered from a user id + avatar hash.
 */
const DiscordAvatar = ({
  discordId,
  avatar,
  size = 32,
  className,
  alt = "",
  ...rest
}: DiscordAvatarProps) => {
  return (
    <img
      {...rest}
      alt={alt}
      className={cn(styles.avatar, className)}
      src={avatarUrl(discordId, avatar, size)}
      width={size}
      height={size}
      loading="lazy"
    />
  );
};

export default DiscordAvatar;
