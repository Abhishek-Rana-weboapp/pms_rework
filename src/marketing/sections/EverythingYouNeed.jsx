import { ChartLine, ListCheck, Users } from "lucide-react";

const features = [
    {
      icon: <ListCheck className="text-3xl text-blue-500" />,
      title: "Task Management",
      desc: "Create, assign, and track tasks with ease. Set deadlines, priorities, and dependencies to keep your projects on track.",
      bg: "bg-blue-100",
    },
    {
      icon: <Users className="text-3xl text-purple-500" />,
      title: "Team Collaboration",
      desc: "Foster seamless communication with real-time chat, file sharing, and collaborative workspaces for your team.",
      bg: "bg-purple-100",
    },
    {
      icon: <ChartLine className="text-3xl text-green-500" />,
      title: "Progress Tracking",
      desc: "Monitor project progress with visual dashboards, Gantt charts, and detailed reporting to stay informed.",
      bg: "bg-green-100",
    },
  ];

const EverythingYouNeed = () => {
  return (
    <section
          id="Features"
          className="bg-white py-20 text-gray-800 px-6 lg:px-20"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {"Everything you need to manage projects"
                  .split("")
                  .map((char, i) => (
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
              <p
                className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base"
                data-aos-duration="2000"
              >
                From planning to execution, our platform provides all the tools
                your team needs to succeed.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-20 place-items-center">
              {features.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center max-w-xs"
                >
                  <div
                    className={`w-16 h-16 ${item?.bg} rounded-full flex items-center justify-center mb-5`}
                  >
                    {item?.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item?.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {item?.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

  )
}

export default EverythingYouNeed