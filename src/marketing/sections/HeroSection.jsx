import { useNavigate } from "react-router-dom";
// import Pill from "../../../Components/shared/Pill";
// import { BsLightning } from "react-icons/bs";
import { PlayCircle, Zap } from "lucide-react";
import dashboardImg from "../../assets/images/Dashboard-image.png";
import dashboardWebp from "../../assets/images/Dashboard-image.webp";
import { Button } from "@/shared/components/ui/button";
import { usePmsEntry } from "../hooks/usePmsEntry";

const HeroSection = () => {
  const navigate = useNavigate();
  const { canEnterPms, orgUuid } = usePmsEntry();
  return (
    <section className="sm:p-4 p-2 relative min-h-screen">
      <div className="md:p-10 md:py-20 p-4 py-10">
        <div
          className={
            "w-max mx-auto gap-2 bg-sky-100 text-blue-600 flex items-center rounded-full font-medium mb-4 py-1 px-3 text-sm md:text-base"
          }
        >
          <Zap />
          <span>Built for Teams, Designed for Results</span>
        </div>
        <h1 className="text-center sm:text-5xl text-2xl font-semibold mb-3">
          Build & Manage Projects Efficiently
        </h1>
        <p className="text-center sm:text-xl text-sm text-slate-600 line-clamp-2 max-w-[50ch] mx-auto mb-10">
          Plan Projects, track progress, manage teams and deliver work on time -
          all in one place.
        </p>

        <div className="grid grid-cols-2 w-max mx-auto gap-5">
          <Button variant="outline">
            <PlayCircle strokeWidth={1} /> Watch Demo
          </Button>
          <Button
            onClick={() => navigate(canEnterPms ? `/${orgUuid}` : "/login")}
          >
            {canEnterPms ? "Go to PMS" : "Get Started"}
          </Button>
        </div>

        <div className="flex justify-center mt-20">
          <picture>
            <source srcSet={dashboardWebp} type="image/webp" />
            <img
              src={dashboardImg}
              alt="Dashboard preview" // Add a descriptive alt tag
              className="object-cover w-full max-w-[80vw] shadow-xl rounded-xl"
              loading="eager" // Use this instead of rel="preload" on the img tag
            />
          </picture>
        </div>
      </div>
      <div className="landing-hero-background"></div>
    </section>
  );
};

export default HeroSection;
