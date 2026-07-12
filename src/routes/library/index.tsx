import {
  Button,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
} from "@sun/components";

/**
 * Home page used to verify that the configured theme is applied.
 */
const Library = () => {
  return (
    <div
      style={{
        padding: "var(--xl, 12px)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--xl, 12px)",
      }}
    >
      <br />
      <div style={{ display: "flex", gap: "var(--md, 5px)", flexWrap: "wrap" }}>
        <Button variant="default">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
      </div>

      <Card style={{ width: "500px" }}>
        <CardHeader>
          <CardTitle>Theme card</CardTitle>
          <CardDescription>
            Buttons, cards and inputs pull from the themed CSS custom
            properties.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="default">Save</Button>
        </CardFooter>
      </Card>

      <Separator />
    </div>
  );
};

export default Library;
