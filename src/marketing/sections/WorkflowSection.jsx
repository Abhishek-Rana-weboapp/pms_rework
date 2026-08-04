import { CalendarRange, Grid2x2, List } from "lucide-react";

const workflows = [
    { icon: <Grid2x2 className="text-blue-600" />, label: "Kanban Boards" },
    {
      icon: <CalendarRange className="text-purple-600" />,
      label: "Timeline View",
    },
    { icon: <List className="text-green-600" />, label: "List View" },
  ];


const WorkflowSection = () => {
  return (
    <section className="bg-[#f8fbff] py-20 text-gray-800 px-6 lg:px-24">
    <div className="flex flex-col md:flex-row justify-between max-w-7xl mx-auto items-center gap-12">
      <div className="max-w-lg text-center md:text-left">
        <h3 className="text-2xl sm:text-3xl font-bold mb-4">
          Visualize your workflow
        </h3>
        <p className="text-gray-500 mb-6 text-sm sm:text-base">
          Get a bird’s-eye view of all your projects with our intuitive
          dashboard. Track progress, identify bottlenecks, and make
          data-driven decisions.
        </p>

        <ul className="space-y-3">
          {workflows.map((wf, i) => (
            <li
              key={i}
              className="flex items-center justify-center md:justify-start gap-3 text-gray-700"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                {wf?.icon}
              </div>
              <span className="font-medium text-sm sm:text-base">
                {wf?.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div
        className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-2xl"
        data-aos-easing="ease-out-cubic"
        data-aos-duration="2000"
      >
        <div className="flex justify-between">
          <h3 className="font-semibold text-lg mb-6 text-center md:text-left">
            Project Dashboard
          </h3>

          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#f77272]"></div>
            <div className="w-3 h-3 rounded-full bg-[#facc14]"></div>
            <div className="w-3 h-3 rounded-full bg-[#49de80]"></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-xl text-center">
            <h4 className="text-2xl font-bold text-blue-600">24</h4>
            <p className="text-xs sm:text-sm text-gray-500">
              Active Tasks
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl text-center">
            <h4 className="text-2xl font-bold text-purple-600">8</h4>
            <p className="text-xs sm:text-sm text-gray-500">
              Team Members
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl text-center">
            <h4 className="text-2xl font-bold text-green-600">92%</h4>
            <p className="text-xs sm:text-sm text-gray-500">Completion</p>
          </div>
        </div>

        <div className="space-y-5">
          {[
            {
              name: "Website Redesign",
              color: "bg-blue-600",
              width: "w-[80%]",
            },
            {
              name: "Mobile App Development",
              color: "bg-purple-600",
              width: "w-[60%]",
            },
            {
              name: "Marketing Campaign",
              color: "bg-green-600",
              width: "w-[90%]",
            },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-2 text-gray-700">
                <span>{item?.name}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`${item?.color} ${item?.width} h-2 rounded-full`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>

  )
}

export default WorkflowSection