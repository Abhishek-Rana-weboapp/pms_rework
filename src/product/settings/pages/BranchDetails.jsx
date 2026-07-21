import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Globe,
  Handshake,
  Info,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";

import Wrapper from "@/shared/components/wrappers/Wrapper";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Spinner } from "@/shared/components/ui/spinner";
import { WORKING_DAYS } from "../config.js/organizationData";
import { useBranch } from "../api/settingsQueries";
import BranchForm from "../components/BranchForm";
import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";

const DAY_SHORT = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

const formatTime = (time) => {
  if (!time) return "--";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
};

const calcTotalHours = (start, end) => {
  if (!start || !end) return null;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const totalMins = eh * 60 + em - (sh * 60 + sm);
  if (totalMins <= 0) return null;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return m ? `${h} hrs ${m} min` : `${h} hrs`;
};

const InfoField = ({ label, value }) => (
  <div className="min-w-0">
    <p className="mb-0.5 text-xs text-muted-foreground">{label}</p>
    <p className="truncate text-sm font-medium text-foreground">
      {value || "—"}
    </p>
  </div>
);

const ContactItem = ({ icon: Icon, label, children }) => (
  <div className="min-w-0">
    <p className="mb-1 text-xs text-muted-foreground">{label}</p>
    <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate">{children}</span>
    </p>
  </div>
);

const BranchDetails = () => {
  const { orgUuid, branchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [showEdit, setShowEdit] = useState(false);

  // Restore the tab the user came from (defaults to the Branch tab) when
  // navigating back to Company Settings.
  const goBack = () =>
    navigate(`/${orgUuid}/profile-settings/company-settings`, {
      state: { tab: location.state?.tab ?? "branch" },
    });

  const { data: branch, isLoading } = useBranch(branchId);

  if (isLoading) {
    return (
      <Wrapper className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
        <Spinner /> Loading branch details...
      </Wrapper>
    );
  }

  if (!branch) {
    return (
      <Wrapper className="py-20 text-center text-sm text-muted-foreground">
        Branch not found.
      </Wrapper>
    );
  }

  const workingDays = Array.isArray(branch.working_days)
    ? branch.working_days
    : [];
  const totalHours = calcTotalHours(branch.start_time, branch.end_time);
  const activeDaysCount = workingDays.length;

  return (
    <Wrapper className="space-y-5">
      {/* Header */}
      <SectionWrapper className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={goBack}
              aria-label="Back to company settings"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <h2 className="text-xl font-semibold">Branch Settings</h2>
          </div>
          <p className="ml-10 text-sm text-muted-foreground">
            Update your company details and contact information.
          </p>
        </div>
        <Button onClick={() => setShowEdit(true)}>Edit</Button>
      </SectionWrapper>

      {/* Branch summary card */}
      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent/40">
            {branch.logo ? (
              <img
                src={branch.logo}
                alt="Branch logo"
                className="size-full object-contain"
              />
            ) : (
              <Building2 className="size-7 text-primary" />
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-lg font-semibold text-foreground">
              {branch.branch_name}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {branch.branch_code && (
                <span className="text-xs text-muted-foreground">
                  # {branch.branch_code}
                </span>
              )}
              {branch.user_count?.employee_count != null && (
                <Badge variant="cloud">
                  <User /> {branch.user_count.employee_count} Employee
                </Badge>
              )}
              {branch.user_count?.client_count != null && (
                <Badge variant="secondary">
                  <Handshake /> {branch.user_count.client_count} Client
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Contact row */}
        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-4">
          <ContactItem icon={Phone} label="Phone">
            {branch.contact_number || "—"}
          </ContactItem>
          <ContactItem icon={Mail} label="Email">
            {branch.email || "—"}
          </ContactItem>
          <div className="min-w-0">
            <p className="mb-1 text-xs text-muted-foreground">Website</p>
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <Globe className="size-3.5 shrink-0 text-muted-foreground" />
              {branch.website_link ? (
                <a
                  href={branch.website_link}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-primary hover:underline"
                >
                  {branch.website_link.replace(/^https?:\/\//, "")}
                </a>
              ) : (
                "—"
              )}
            </p>
          </div>
          <InfoField label="Timezone" value={branch.timezone} />
        </div>

        {branch.description && (
          <p className="border-t border-gray-100 pt-3 text-sm leading-relaxed text-muted-foreground">
            {branch.description}
          </p>
        )}
      </div>

      {/* Working hours + days */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Daily working hours */}
        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
          <h4 className="flex items-center gap-2 font-semibold">
            <span className="grid size-6 place-items-center rounded-full bg-primary/10">
              <Clock className="size-3.5 text-primary" />
            </span>
            Daily Working Hours
          </h4>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Operating Hours</p>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
                {formatTime(branch.start_time)}
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
                {formatTime(branch.end_time)}
              </span>
            </div>
          </div>
          {totalHours && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <p className="text-sm text-muted-foreground">
                Total Working Hours Per Day
              </p>
              <p className="text-base font-bold text-foreground">
                {totalHours}
              </p>
            </div>
          )}
        </div>

        {/* Working days */}
        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
          <h4 className="flex items-center gap-2 font-semibold">
            <span className="grid size-6 place-items-center rounded-full bg-primary/10">
              <Calendar className="size-3.5 text-primary" />
            </span>
            Working Days
          </h4>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Weekly Schedule</p>
            <div className="flex flex-wrap gap-2">
              {WORKING_DAYS.map((day) => {
                const isActive = workingDays.includes(day);
                return (
                  <span
                    key={day}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-muted-foreground"
                    }`}
                  >
                    {DAY_SHORT[day]}
                  </span>
                );
              })}
            </div>
          </div>
          {activeDaysCount > 0 && (
            <p className="flex items-center gap-1.5 border-t border-gray-100 pt-3 text-xs text-muted-foreground">
              <Info className="size-3.5 text-primary" />
              {activeDaysCount} working day{activeDaysCount !== 1 ? "s" : ""} per
              week
            </p>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
        <h4 className="flex items-center gap-2 font-semibold">
          <MapPin className="size-4 text-destructive" />
          Address Information
        </h4>
        {branch.street_address && (
          <div>
            <p className="mb-0.5 text-xs text-muted-foreground">Full Address</p>
            <p className="text-sm font-medium text-foreground">
              {branch.street_address}
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <InfoField label="City" value={branch.city} />
          <InfoField label="State" value={branch.state} />
          <InfoField label="Country" value={branch.country} />
          <InfoField label="Pin Code" value={branch.pincode} />
        </div>
      </div>

      <BranchForm
        open={showEdit}
        onOpenChange={setShowEdit}
        selectedBranch={branch}
        companySettingsId={branch.company_settings}
      />
    </Wrapper>
  );
};

export default BranchDetails;
