import ShowMore from "@/shared/components/ui/ShowMore";
import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import RichText from "@/shared/components/RichText";
import { cn } from "@/shared/lib/utils";

const AcceptanceCriteria = ({
  artifact,
  containerClassName,
  className,
  ...props
}) => {
  return (
    <SectionWrapper className={cn(containerClassName)}>
      <h5 className="font-medium mb-2">Acceptance Criteria</h5>
      <ShowMore className={cn(className)} {...props}>
        <RichText
          html={artifact?.acceptance_criteria}
          fallback={<span className="text-muted-foreground">NA</span>}
        />
      </ShowMore>
    </SectionWrapper>
  );
};

export default AcceptanceCriteria;
