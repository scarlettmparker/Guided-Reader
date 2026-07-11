import { Card, CardBody, Skeleton } from "@sun/components";

/**
 * Skeleton for the text detail panel.
 */
const TextDetailsPageSkeleton = () => (
  <Card>
    <CardBody>
      <Skeleton style={{ width: "60%", height: "1.5rem" }} />
      <Skeleton style={{ width: "100%", height: "16rem", marginTop: "var(--lg)" }} />
    </CardBody>
  </Card>
);

export default TextDetailsPageSkeleton;
