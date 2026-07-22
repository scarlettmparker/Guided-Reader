import { Skeleton } from "@sun/components";

/**
 * Skeleton for the full admin page while data loads.
 */
const AdminPageSkeleton = () => (
  <div style={{ display: "flex", gap: "var(--lg)", padding: "var(--xl)" }}>
    <Skeleton style={{ width: "100%", height: "20rem" }} />
  </div>
);

export default AdminPageSkeleton;
