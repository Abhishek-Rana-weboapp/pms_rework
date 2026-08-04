import { Building } from "lucide-react";

const steps = [
    {
      id: 1,
      title: "Create Organization",
      desc: "Configure basic organization details, select features, and set up initial admin users with just a few clicks.",
      icon: <Building className="text-blue-500" size={20} />,
      content: (
        <div className="rounded shadow p-4 mt-4 w-full">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Organization Name</span>
            <Building className="text-gray-400" />
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full mb-2">
            <div className="h-2 bg-blue-600 rounded-full w-[90%]"></div>
          </div>
          <p className="text-xs text-gray-500">Setup complete in ~30 seconds</p>
        </div>
      ),
      color: "bg-blue-100 text-blue-700",
    },
    {
      id: 2,
      title: "Configure Settings",
      desc: "Customize branding, workflows, user roles, and feature permissions to match organization requirements.",
    //   icon: <FaCogs className="text-purple-500" size={20} />,
      content: (
        <div className="rounded shadow p-4 mt-4 space-y-2 w-full">
          {[
            { label: "Custom Branding", color: "bg-green-400" },
            { label: "User Permissions", color: "bg-yellow-400" },
            { label: "Workflows", color: "bg-green-500" },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{item.label}</span>
              <span className={`w-8 h-3 rounded-full ${item.color}`}></span>
            </div>
          ))}
        </div>
      ),
      color: "bg-purple-100 text-purple-700",
    },
    {
      id: 3,
      title: "Launch & Monitor Project",
      desc: "Deploy the organization instantly and monitor performance, usage, and user activity from the admin dashboard.",
    //   icon: <FaRocket className="text-green-500" size={20} />,
      content: (
        <div className="shadow rounded p-4 mt-4 space-y-3 w-full">
          <div>
            <p className="text-sm text-gray-500 mb-1">Project Status</p>
            <div className="flex justify-between items-center text-gray-700">
              <div>
                <h4 className="text-lg font-bold text-blue-600">24</h4>
                <p className="text-xs text-gray-500">Active Users</p>
              </div>
              <div className="text-right">
                <h4 className="text-lg font-bold text-green-600">98%</h4>
                <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Live
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      color: "bg-green-100 text-green-700",
    },
  ];

const StepsSection = () => {
  return (
    <section className="bg-white py-20 text-gray-800 p-4">

          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-16">
              {"Simple 3-Step Organization Setup".split("").map((char, i) => (
                <span
                  key={i}
                  data-aos-delay={i * 50}
                  data-aos-duration="2000"
                  className="inline-block"
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </h3>
            <div className="relative grid grid-cols-3 justify-between mx-auto w-full items-stretch">
              <div
                className="hidden md:block absolute top-5 left-0 w-full h-0.5 bg-gray-200"
                style={{
                  background:
                    "linear-gradient(to right, #dbebff 0%, #dbebff 15%, #f3e8ff 15%, #f3e8ff 85%, #dcfce7 85%, #dcfce7 100%)",
                }}
              ></div>
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="relative flex flex-col items-center h-full text-center px-4 mb-10 md:mb-0"
                >
                  <div
                    className={`z-10 w-10 h-10 flex items-center justify-center font-semibold rounded-full mb-4 ${step.color}`}
                  >
                    {step.id}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm mb-3 max-w-xs">
                    {step.desc}
                  </p>
                  <div className="w-full flex justify-center">{step.content}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
  )
}

export default StepsSection