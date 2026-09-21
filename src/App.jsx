import  { useTheme } from "./hooks/useTheme"
import Button from "./components/common/Button.jsx"
import Card from "./components/common/Card.jsx"
import Badge from "./components/common/Badge.jsx"
import Input from "./components/common/Input.jsx"



function App() {

  const {theme, toggleTheme} = useTheme()

  return (
    <main className=" max-h-screen bg-var-background px-6 py-12 text-var--text-primary ">

      <div className="mx-auto max-w-4xl">


        <div className="mb-10 flex items-center justify-between">

          <div>
            <p className="text-sm font-medium text-var--primary">
              DOCNIVA
            </p>

            <h1 className="mt-2">
              Healthcare, connected.
            </h1>
          </div>

          <Button
            variant="outline"
            onClick={toggleTheme}
          >
            { theme === "light" ? "🌙 Dark" : "☀️ Light" }
          </Button>
        </div>

        <div className=" grid gap-6 md:grid-cols-2 ">

          <Card>
                <h2 className="text-xl font-semibold">
                  Design System
                </h2>

                <p className="mt-2 text-sm text-var--text-secondary">
                  Docniva reusable component foundation.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button>
                    Book Appointment
                  </Button>

                  <Button varient= "outline">
                    View Profile
                  </Button>
                </div>
          </Card>


          <Card>
            <div className="space-y-5">

              <div className="flex gap-4">

              <Badge status="available">
                Available
              </Badge>

              <Badge status="confirmed">
                Confirmed
              </Badge>

              <Badge status="pending">
                Pending
              </Badge>
                </div>


              <Input
                label="Search Doctor"
                placeholder="Doctor, specialization..."
              />

            </div>
          </Card>

        </div>

      </div>

    </main>
  )
}

export default App