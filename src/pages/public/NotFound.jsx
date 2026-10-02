
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[var(--soft-background)] px-4 py-10 sm:px-6">
      <Card className="w-full max-w-md p-6 text-center sm:p-8">

        <p className="text-6xl font-bold text-[var(--primary)] sm:text-7xl">
          404
        </p>

        <h1 className="mt-4 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
          Page not found
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <Button
          className="mt-6"
          size="lg"
          onClick={() => navigate("/")}
        >
          Back to Home
        </Button>

      </Card>
    </main>
  );
}

export default NotFound;

