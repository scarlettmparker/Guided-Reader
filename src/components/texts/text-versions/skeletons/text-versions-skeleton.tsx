import { Card, CardBody, CardHeader, Skeleton } from "@sun/components";
import styles from "./text-versions-skeleton.module.css";

/**
 * Skeleton for text versions.
 */
const TextVersionsSkeleton = () => {
  return (
    <Card className={styles.card}>
      <CardHeader>
        <Skeleton style={{ width: "40%", height: "1.5rem" }} />
      </CardHeader>
      <CardBody>
        <Skeleton style={{ width: "100%", height: "6rem" }} />
      </CardBody>
    </Card>
  );
};

export default TextVersionsSkeleton;
