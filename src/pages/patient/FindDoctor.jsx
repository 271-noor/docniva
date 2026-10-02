import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Input from "../../components/common/Input";

const doctors = [
{
id: 1,
name: "Dr. Rozy",
specialization: "Cardiologist",
location: "Agra",
experience: "8 years experience",
availability: "Available",
fee: "₹800",
},
{
id: 2,
name: "Dr. Noor",
specialization: "Dermatologist",
location: "Agra",
experience: "6 years experience",
availability: "Available",
fee: "₹600",
},
{
id: 3,
name: "Dr. Priya Singh",
specialization: "General Physician",
location: "Agra",
experience: "10 years experience",
availability: "Busy",
fee: "₹500",
},
];

function FindDoctor() {
const navigate = useNavigate();

const [search, setSearch] = useState("");
const [specialization, setSpecialization] = useState("");
const [location, setLocation] = useState("");

const filteredDoctors = useMemo(() => {
const searchText = search.trim().toLowerCase();
const locationText = location.trim().toLowerCase();

 
return doctors.filter((doctor) => {
  const matchesSearch =
    !searchText ||
    doctor.name.toLowerCase().includes(searchText) ||
    doctor.specialization.toLowerCase().includes(searchText);

  const matchesSpecialization =
    !specialization ||
    doctor.specialization === specialization;

  const matchesLocation =
    !locationText ||
    doctor.location.toLowerCase().includes(locationText);

  return (
    matchesSearch &&
    matchesSpecialization &&
    matchesLocation
  );
});
 

}, [search, specialization, location]);

const handleReset = () => {
setSearch("");
setSpecialization("");
setLocation("");
};

const hasFilters =
search.trim() ||
specialization ||
location.trim();

return ( <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8"> <div className="mx-auto max-w-7xl">

 
    {/* Header */}
    <div className="text-center">
      <p className="font-semibold text-[var(--primary)]">
        DocNiva
      </p>

      <h1 className="mt-2 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
        Find a Doctor
      </h1>

      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
        Search for doctors by name, specialization or location and find
        the right doctor for your healthcare needs.
      </p>
    </div>

    {/* Search & Filters */}
    <Card className="mt-8 p-5 sm:p-6">
      <div className="grid gap-4 md:grid-cols-3">

        <Input
          label="Search Doctor"
          placeholder="Doctor or specialization"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div>
          <label
            htmlFor="specialization"
            className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]"
          >
            Specialization
          </label>

          <select
            id="specialization"
            value={specialization}
            onChange={(event) =>
              setSpecialization(event.target.value)
            }
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-sm text-[var(--input-text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
          >
            <option value="">All Specializations</option>
            <option value="Cardiologist">
              Cardiologist
            </option>
            <option value="Dermatologist">
              Dermatologist
            </option>
            <option value="General Physician">
              General Physician
            </option>
          </select>
        </div>

        <Input
          label="Location"
          placeholder="Enter city"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />

      </div>

      {/* Filter Actions */}
      {hasFilters && (
        <div className="mt-5 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </Card>

    {/* Results */}
    <div className="mt-8">

      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Doctors
          </h2>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {filteredDoctors.length} doctor
            {filteredDoctors.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="self-start text-sm font-medium text-[var(--primary)] hover:underline sm:self-auto"
          >
            Reset search
          </button>
        )}

      </div>

      {/* Doctor Cards */}
      {filteredDoctors.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {filteredDoctors.map((doctor) => (
            <Card
              key={doctor.id}
              className="flex flex-col p-6"
            >

              {/* Top */}
              <div className="flex items-start justify-between gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-2xl">
                  👨‍⚕️
                </div>

                <Badge
                  status={
                    doctor.availability === "Available"
                      ? "available"
                      : "pending"
                  }
                >
                  {doctor.availability}
                </Badge>

              </div>

              {/* Doctor Details */}
              <div className="mt-5">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {doctor.name}
                </h3>

                <p className="mt-1 font-medium text-[var(--primary)]">
                  {doctor.specialization}
                </p>
              </div>

              <div className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
                <p>
                  📍 {doctor.location}
                </p>

                <p>
                  🩺 {doctor.experience}
                </p>
              </div>

              {/* Fee */}
              <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4">
                <span className="text-sm text-[var(--text-secondary)]">
                  Consultation Fee
                </span>

                <span className="font-bold text-[var(--text-primary)]">
                  {doctor.fee}
                </span>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    navigate(`/patient/doctor/${doctor.id}`)
                  }
                >
                  View Profile
                </Button>

                <Button
                  className="w-full"
                  disabled={doctor.availability !== "Available"}
                  onClick={() =>
                    navigate(`/patient/book/${doctor.id}`)
                  }
                >
                  {doctor.availability === "Available"
                    ? "Book"
                    : "Unavailable"}
                </Button>

              </div>

            </Card>
          ))}

        </div>
      ) : (
        /* Empty State */
        <Card className="p-8 text-center sm:p-10">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary-light)] text-2xl">
            🔍
          </div>

          <h3 className="mt-5 text-lg font-semibold text-[var(--text-primary)]">
            No doctors found
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
            We couldn't find any doctors matching your current search
            or filters. Try changing your search criteria.
          </p>

          <Button
            variant="outline"
            className="mt-5"
            onClick={handleReset}
          >
            Clear Filters
          </Button>

        </Card>
      )}

    </div>

  </div>
</main>
 

);
}

export default FindDoctor;
