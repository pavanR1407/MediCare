import { useState } from "react";
import { Stethoscope, Clock, BadgeDollarSign, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface DoctorCardProps {
  doctorId: string;
  name: string;
  specialization: string;
  experience: number;
  consultationFees: number;
  availableTime: string;
}

interface SpecializationColors {
  [key: string]: string;
}

interface BookingState {
  date: string;
  time: string;
  booking: boolean;
  open: boolean;
}

interface AppointmentData {
  user_id: string | undefined;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: "upcoming";
}

const specializationColors: Record<string, string> = {
  Cardiologist: "bg-red-50 text-red-700 border-red-200",
  Neurologist: "bg-purple-50 text-purple-700 border-purple-200",
  Dentist: "bg-blue-50 text-blue-700 border-blue-200",
  "Orthopedic Surgeon": "bg-amber-50 text-amber-700 border-amber-200",
  Dermatologist: "bg-pink-50 text-pink-700 border-pink-200",
  Pediatrician: "bg-green-50 text-green-700 border-green-200",
  Ophthalmologist: "bg-cyan-50 text-cyan-700 border-cyan-200",
  "ENT Specialist": "bg-orange-50 text-orange-700 border-orange-200",
};

const DoctorCard = ({ doctorId, name, specialization, experience, consultationFees, availableTime }: DoctorCardProps) => {
  const initials = name.replace("Dr. ", "").split(" ").map(n => n[0]).join("");
  const tagColor = specializationColors[specialization] || "bg-secondary text-secondary-foreground border-border";
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [booking, setBooking] = useState(false);

  const handleBook = async () => {
    if (!date || !time) {
      toast({ title: "Please select date and time", variant: "destructive" });
      return;
    }
    setBooking(true);
    const { error } = await supabase.from("appointments").insert({
      user_id: user?.id,
      doctor_id: doctorId,
      appointment_date: date,
      appointment_time: time,
      status: "upcoming",
    });

    if (!error) {
      toast({ title: "Appointment booked!", description: `With ${name} on ${date}` });
      setOpen(false);
      setDate("");
      setTime("");
    } else {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    }
    setBooking(false);
  };

  return (
    <div className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl hospital-gradient text-lg font-bold text-primary-foreground">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-card-foreground truncate">{name}</h3>
          <span className={`mt-1 inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${tagColor}`}>
            {specialization}
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Award className="h-4 w-4 text-primary" />
          <span>{experience} yrs exp</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BadgeDollarSign className="h-4 w-4 text-primary" />
          <span>${consultationFees}</span>
        </div>
        <div className="col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 text-primary" />
          <span>{availableTime}</span>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="mt-5 w-full rounded-xl border-2 border-primary py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
            Book Appointment
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book with {name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Preferred Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <Button
              onClick={handleBook}
              disabled={booking}
              className="w-full hospital-gradient text-primary-foreground"
            >
              {booking ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorCard;
