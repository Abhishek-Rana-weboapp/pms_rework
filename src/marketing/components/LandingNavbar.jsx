import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { usePmsEntry } from "../hooks/usePmsEntry";
import logo from "../../assets/images/WAD_LOGO-BG.png";

const LandingNavbar = () => {
  const navigate = useNavigate();
  const { canEnterPms, orgUuid } = usePmsEntry();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
          aria-label="Home"
        >
          <img src={logo} alt="Logo" className="h-9 w-auto select-none" />
        </button>

        <div className="flex items-center gap-3">
          {canEnterPms ? (
            <Button onClick={() => navigate(`/${orgUuid}`)}>Go to PMS</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Log In
              </Button>
              <Button onClick={() => navigate("/signup")}>Sign Up</Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default LandingNavbar;
