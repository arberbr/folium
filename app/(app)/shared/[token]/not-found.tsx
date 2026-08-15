export default function SharedCollectionNotFound() {
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-4xl">This shared collection is unavailable</h1>
      <p className="text-muted-foreground">The link may be wrong, or the owner made it private.</p>
    </div>
  );
}
