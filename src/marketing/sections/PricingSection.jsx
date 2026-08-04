import { Check } from "lucide-react";

const pricingPlans = [
    {
      name: "Starter",
      tagline: "Perfect for small teams",
      price: 9,
      buttonText: "Start Free Trial",
      highlighted: false,
      position: "left",
      features: [
        "Up to 10 users",
        "Basic project management",
        "5GB storage",
        "Email support",
      ],
    },
    {
      name: "Professional",
      tagline: "For growing teams",
      price: 19,
      buttonText: "Start Free Trial",
      highlighted: true, // This is the highlighted (Most Popular) card
      badge: "Most Popular",
      position: "",
      features: [
        "Up to 50 users",
        "Advanced features",
        "100GB storage",
        "Priority support",
        "Analytics & reports",
      ],
    },
    {
      name: "Enterprise",
      tagline: "For large organizations",
      price: 39,
      buttonText: "Contact Sales",
      highlighted: false,
      position: "right",
      features: [
        "Unlimited users",
        "All features included",
        "Unlimited storage",
        "24/7 phone support",
        "Custom integrations",
      ],
    },
  ];
  
const PricingSection = () => {
  return (
<section id="Pricing" className="bg-[#f7fbff] py-20 px-6 lg:px-24">
          <h3 className="text-3xl font-bold text-center text-gray-800">
            {/* Simple, transparent pricing */}
            {"Simple, transparent pricing".split("").map((char, i) => (
              <span
                key={i}
                data-aos-delay={i * 50}
                data-aos-duration="1000"
                className="inline-block"
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h3>
          <p className="text-center text-gray-500 mt-2 mb-12">
            Choose the plan that fits your team size and needs
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl p-8 text-center transition shadow-sm hover:shadow-md border 
              ${
                plan.highlighted
                  ? "border-2 border-[#2563EB] shadow-lg"
                  : "border-gray-200"
              }
            `}
              >
                {plan.highlighted && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#2563EB] text-white text-xs font-medium px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                )}

                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-gray-500 mb-6">{plan.tagline}</p>

                <div className="text-4xl font-bold text-gray-800 mb-2">
                  ${plan.price}
                </div>
                <p className="text-gray-500 mb-6">/user/month</p>

                <button
                  className={`w-full py-3 rounded-lg font-medium transition cursor-pointer 
                ${
                  plan.highlighted
                    ? "bg-[#2563EB] text-white hover:bg-[#2563EB]"
                    : "bg-gray-100 text-gray-700"
                }
              `}
                >
                  {plan.buttonText}
                </button>

                <ul className="mt-6 space-y-3 text-gray-600 text-sm flex flex-col text-start justify-start">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-start gap-3"
                    >
                      <Check color="#21c45d" /> {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>    
  )
}

export default PricingSection