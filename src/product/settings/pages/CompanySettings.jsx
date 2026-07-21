import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import Wrapper from "@/shared/components/wrappers/Wrapper";
import { Spinner } from "@/shared/components/ui/spinner";
import OrganizationSection from "../components/OrganizationSection";
import ScheduleSection from "../components/ScheduleSection";
import { useOrganizationSettings } from "../api/settingsQueries";
import BranchSection from "../components/BranchSection";

const CompanySettings = () => {
  // The whole app is nested under /:orgUuid, so this is always available.
  const { orgUuid } = useParams();
  const { data: org, isLoading, isError } = useOrganizationSettings(orgUuid);

  // Returning from the branch details route carries the tab to restore via
  // router state; otherwise fall back to the Organization tab.
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.tab ?? "org");

  const renderBody = (Section) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Spinner /> Loading organization details...
        </div>
      );
    }
    if (isError || !org) {
      return (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Couldn't load organization settings. Please try again.
        </p>
      );
    }
    return <Section org={org} orgId={orgUuid} />;
  };

  return (
    <Wrapper className="space-y-5">
      <div className="rounded-md bg-white p-4 shadow">
        <h1 className="text-lg font-semibold">Company Settings</h1>
        <p className="text-sm text-gray-500">
          Manage your company information and business preferences.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-5">
        <TabsList className="bg-gray-200">
          <TabsTrigger value="org">Organization Details</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="branch">Company Branch</TabsTrigger>
        </TabsList>

        <TabsContent value="org">
          <SectionWrapper>{renderBody(OrganizationSection)}</SectionWrapper>
        </TabsContent>

        <TabsContent value="schedule">
          <SectionWrapper>{renderBody(ScheduleSection)}</SectionWrapper>
        </TabsContent>

        <TabsContent value="branch">
          <SectionWrapper>
            {renderBody(BranchSection)}
          </SectionWrapper>
        </TabsContent>
      </Tabs>
    </Wrapper>
  );
};

export default CompanySettings;
