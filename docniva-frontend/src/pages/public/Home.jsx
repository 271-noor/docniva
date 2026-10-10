
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

function Home() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      
      {/* Hero Section */}
      <section className="mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        
        <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">

          {/* Left Content */}
          <div className="text-center lg:text-left">

            <span className="inline-block font-semibold text-[var(--primary)]">
              Healthcare, connected.
            </span>

            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Find the right doctor.
              <span className="mt-1 block text-[var(--primary)]">
                Book with confidence.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg lg:mx-0">
              Discover trusted doctors, check availability and manage your
              appointments from one simple platform.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Button
                size="lg"
                onClick={() => navigate("/role")}
              >
                Get Started
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/role")}
              >
                Find a Doctor
              </Button>
            </div>

          </div>

          {/* Right Card */}
          <Card className="w-full p-4 sm:p-6 lg:p-8">

            <div className="rounded-2xl bg-[var(--primary-light)] p-5 sm:p-6">

              <span className="text-sm font-semibold text-[var(--primary)]">
                DocNiva
              </span>

              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                Search. Book. Consult.
              </h2>

              <div className="mt-6 space-y-3 sm:space-y-4">

                {/* Step 01 */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <strong className="text-[var(--text-primary)]">
                    01 — Find a doctor
                  </strong>

                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    Search by specialty, location or doctor.
                  </p>
                </div>

                {/* Step 02 */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <strong className="text-[var(--text-primary)]">
                    02 — Choose a slot
                  </strong>

                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    Select a convenient date and time.
                  </p>
                </div>

                {/* Step 03 */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <strong className="text-[var(--text-primary)]">
                    03 — Consult
                  </strong>

                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    Visit the clinic or consult online.
                  </p>
                </div>

              </div>
            </div>

          </Card>

        </div>
      </section>
    </main>
  );
}

export default Home;

