import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import DoctorCard from "@/components/DoctorCard";
import { Search, Stethoscope } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  consultation_fees: number;
  available_time: string;
}

const Dashboard = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      const { data, error } = await supabase.from("doctors").select("*");
      if (!error && data) setDoctors(data);
      setLoading(false);
    };
    fetchDoctors();
  }, []);

  const filtered = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero */}
      <div className="mb-8 rounded-2xl hospital-gradient p-8 sm:p-10">
        <div className="flex items-center gap-3 mb-3">
          <Stethoscope className="h-7 w-7 text-primary-foreground" />
          <h1 className="text-2xl font-extrabold text-primary-foreground sm:text-3xl">
            Find Your Doctor
          </h1>
        </div>
        <p className="mb-6 max-w-lg text-primary-foreground/80">
          Browse our expert medical professionals and book your appointment today.
        </p>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 bg-card pl-10 shadow-lg"
          />
        </div>
      </div>

      {/* Doctor Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <Stethoscope className="mx-auto mb-4 h-12 w-12 opacity-30" />
          <p className="text-lg font-medium">No doctors found</p>
          <p className="text-sm">Try adjusting your search</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => (
            <DoctorCard
              key={doc.id}
              doctorId={doc.id}
              name={doc.name}
              specialization={doc.specialization}
              experience={doc.experience}
              consultationFees={Number(doc.consultation_fees)}
              availableTime={doc.available_time}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
