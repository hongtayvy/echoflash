import { Link } from "react-router-dom";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";

export default function NotFoundPage() {
  return (
    <EmptyState
      title="Page not found"
      subtitle="That route doesn’t exist."
      action={
        <Link to="/decks">
          <Button variant="secondary">Go to decks</Button>
        </Link>
      }
    />
  );
}
