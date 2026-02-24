import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { CalendarCheck, Clock, Stethoscope, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface AppointmentWithDoctor {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string | null;
  doctors: {
    name: string;
    specialization: string;
  };
}

const statusColors: Record<string, string> = {
  upcoming: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const Home = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentWithDoctor[]>([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, appointment_date, appointment_time, status, notes, doctors(name, specialization)")
        .eq("user_id", user?.id ?? "")
        .order("appointment_date", { ascending: false })
        .limit(5);

      if (!error && data) {
        setAppointments(data as unknown as AppointmentWithDoctor[]);
        const all = data as unknown as AppointmentWithDoctor[];
        setStats({
          total: all.length,
          upcoming: all.filter((a) => a.status === "upcoming").length,
          completed: all.filter((a) => a.status === "completed").length,
        });
      }
      setLoading(false);
    };
    if (user) fetchData();
  }, [user]);

  const fullName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <div className="rounded-2xl hospital-gradient p-8">
        <h1 className="text-2xl font-extrabold text-primary-foreground sm:text-3xl">
          Welcome back, {fullName}!
        </h1>
        <p className="mt-2 text-primary-foreground/80">
          Here's a quick overview of your health appointments.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Appointments", value: stats.total, icon: CalendarCheck },
          { label: "Upcoming", value: stats.upcoming, icon: Clock },
          { label: "Completed", value: stats.completed, icon: Stethoscope },
        ].map((s) => (
          <Card key={s.label} className="shadow-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-xl hospital-gradient p-2.5">
                <s.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Appointments */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Appointments</CardTitle>
          <Link to="/appointments">
            <Button variant="ghost" size="sm" className="text-primary">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <CalendarCheck className="mx-auto mb-3 h-10 w-10 opacity-30" />
              <p className="font-medium">No appointments yet</p>
              <p className="text-sm mt-1">Book your first appointment from the Dashboard.</p>
              <Link to="/dashboard" className="mt-4 inline-block">
                <Button size="sm" className="hospital-gradient text-primary-foreground">
                  Browse Doctors
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg hospital-gradient p-2">
                      <Stethoscope className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{apt.doctors.name}</p>
                      <p className="text-xs text-muted-foreground">{apt.doctors.specialization}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{apt.appointment_date}</p>
                    <p className="text-xs text-muted-foreground">{apt.appointment_time}</p>
                  </div>
                  <Badge variant="outline" className={statusColors[apt.status] || ""}>
                    {apt.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
