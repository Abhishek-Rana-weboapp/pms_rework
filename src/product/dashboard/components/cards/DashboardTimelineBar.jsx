import { formatDateLocal } from "@/shared/lib/helpers";

const DashboardTimelineBar = ({ item }) => {
  const progress = Math.max(item.progress || 0);

  const isDelayed = item.health?.toLowerCase() === "delayed";

  const statusStyles = isDelayed
    ? {
        badge: "bg-red-100 text-red-700 border-red-200",
        progress: "bg-red-500",
      }
    : {
        badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
        progress: "bg-emerald-500",
      };

  return (
    <div className="py-3 border-b border-slate-100 last:border-0">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* LEFT SECTION */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div
                className={` w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm
                    ${statusStyles.progress}
                  `}
              >
                {item.project_name?.slice(0, 2)?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-800 truncate">
                  {item.project_name}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                  <span>Due {formatDateLocal(item.due_date)}</span>
                  <span>👥 {item.team_size || 0} Members</span>
                  <span>🚀 Sprints {item.sprints || "0/0"}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center mt-2 gap-3">
              <p className="text-xs font-medium text-slate-500">
                {item.progress?.toFixed(2)}% Complete
              </p>

              <span
                className={` px-3 py-1 rounded-full border text-[11px] font-semibold
                ${statusStyles.badge}
              `}
              >
                {item.health || "Unknown"}
              </span>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`
                h-full
                rounded-full
                transition-all
                duration-500
                ${statusStyles.progress}
              `}
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          {/* FOOTER */}
          {/* <div className="flex items-center justify-between mt-2">
            <p className="text-xs font-medium text-slate-500">
              {item.progress?.toFixed(2)}% Complete
            </p>

            <span
              className={`
                px-3
                py-1
                rounded-full
                border
                text-[11px]
                font-semibold
                ${statusStyles.badge}
              `}
            >
              {item.health || "Unknown"}
            </span>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default DashboardTimelineBar;
