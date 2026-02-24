import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Save, Lock } from "lucide-react";

const Profile = () => {
  const { user, updatePassword } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", user?.id ?? "")
        .single();

      if (data) {
        setFullName(data.full_name);
        setEmail(data.email);
      }
      setLoading(false);
    };
    if (user) fetchProfile();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);

    // Handle profile update
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("user_id", user?.id ?? "");

    let passwordError = null;

    // Handle password change if fields are filled
    if (currentPassword && newPassword && confirmPassword) {
      if (newPassword !== confirmPassword) {
        toast({ title: "Passwords don't match", variant: "destructive" });
        setSaving(false);
        return;
      }

      if (newPassword.length < 6) {
        toast({ title: "Password must be at least 6 characters", variant: "destructive" });
        setSaving(false);
        return;
      }

      const { error } = await updatePassword(newPassword);
      passwordError = error;
    }

    if (!profileError && !passwordError) {
      toast({ title: "Profile updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      if (profileError) {
        toast({ title: "Error updating profile", variant: "destructive" });
      }
      if (passwordError) {
        toast({ title: "Error updating password", description: passwordError, variant: "destructive" });
      }
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }

    if (newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setChangingPassword(true);
    const { error } = await updatePassword(newPassword);

    if (!error) {
      toast({ title: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast({ title: "Error updating password", description: error, variant: "destructive" });
    }
    setChangingPassword(false);
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <div className="h-8 w-40 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-extrabold text-foreground mb-6">My Profile</h1>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-xl hospital-gradient p-3">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle>Personal Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="h-3.5 w-3.5" /> Full Name
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" /> Email
            </Label>
            <Input id="email" value={email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>

          <div className="border-t pt-5 mt-5">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lock className="h-4 w-4" /> Password Settings
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5" /> Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5" /> New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5" /> Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="hospital-gradient text-primary-foreground w-full mt-6">
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
