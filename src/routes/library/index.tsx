import {
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
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
      <h1>Theme preview</h1>

      <div style={{ display: "flex", gap: "var(--md, 5px)", flexWrap: "wrap" }}>
        <Button variant="default">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme card</CardTitle>
          <CardDescription>
            Buttons, cards and inputs pull from the themed CSS custom properties.
          </CardDescription>
        </CardHeader>
        <CardBody>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--md, 5px)" }}>
            <Label htmlFor="preview-input">Sample input</Label>
            <Input id="preview-input" placeholder="Type here" />
            <Checkbox id="preview-check" />
            <Label htmlFor="preview-check">Checked example</Label>
          </div>
        </CardBody>
        <CardFooter>
          <Button variant="default">Save</Button>
        </CardFooter>
      </Card>

      <Separator />
    </div>
  );
};

export default Library;