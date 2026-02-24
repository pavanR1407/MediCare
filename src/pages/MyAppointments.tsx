import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { CalendarCheck, Stethoscope, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

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

const MyAppointments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<AppointmentWithDoctor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select("id, appointment_date, appointment_time, status, notes, doctors(name, specialization)")
      .eq("user_id", user?.id ?? "")
      .order("appointment_date", { ascending: false });

    if (!error && data) {
      setAppointments(data as unknown as AppointmentWithDoctor[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user]);

  const cancelAppointment = async (id: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", id);

    if (!error) {
      toast({ title: "Appointment cancelled" });
      fetchAppointments();
    }
  };

  const filterByStatus = (status: string) =>
    status === "all" ? appointments : appointments.filter((a) => a.status === status);

  const AppointmentList = ({ items }: { items: AppointmentWithDoctor[] }) =>
    items.length === 0 ? (
      <div className="py-14 text-center text-muted-foreground">
        <CalendarCheck className="mx-auto mb-3 h-10 w-10 opacity-30" />
        <p className="font-medium">No appointments found</p>
      </div>
    ) : (
      <div className="space-y-3">
        {items.map((apt) => (
          <div
            key={apt.id}
            className="flex items-center justify-between rounded-xl border border-border p-4"
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
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={statusColors[apt.status] || ""}>
                {apt.status}
              </Badge>
              {apt.status === "upcoming" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => cancelAppointment(apt.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-extrabold text-foreground mb-6">My Appointments</h1>

      <Card className="shadow-card">
        <CardContent className="pt-6">
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : (
              <>
                <TabsContent value="all"><AppointmentList items={filterByStatus("all")} /></TabsContent>
                <TabsContent value="upcoming"><AppointmentList items={filterByStatus("upcoming")} /></TabsContent>
                <TabsContent value="completed"><AppointmentList items={filterByStatus("completed")} /></TabsContent>
                <TabsContent value="cancelled"><AppointmentList items={filterByStatus("cancelled")} /></TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyAppointments;
