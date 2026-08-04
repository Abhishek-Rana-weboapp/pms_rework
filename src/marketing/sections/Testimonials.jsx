const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Manager at TechCorp",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      text: "ProjectMS transformed how our team collaborates. The intuitive interface and powerful automation features saved us hours every week.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "CTO at StartupXYZ",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      text: "The analytics and reporting features give us incredible insights into our project performance. It’s a game-changer for data-driven decisions.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Operations Director at GrowthCo",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      text: "We’ve tried many project management tools, but ProjectMS stands out with its perfect balance of simplicity and powerful features.",
      rating: 5,
    },
  ];

const Testimonials = () => {
  return (
    <section className="bg-white py-16 text-center px-10 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {/* What our customers say */}
              {"What our customers say".split("").map((char, i) => (
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
            <p className="text-gray-600 mb-12">
              Join thousands of happy teams using ProjectMS
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100"
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-12 h-12 rounded-full mr-3 object-cover"
                    />
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{t.name}</h3>
                      <p className="text-sm text-gray-500">{t.role}</p>
                    </div>
                  </div>

                  <div className="flex justify-start mb-3">
                    {[...Array(t.rating)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5 text-yellow-400"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.174c.969 0 1.371 1.24.588 1.81l-3.383 2.46a1 1 0 00-.364 1.118l1.286 3.967c.3.921-.755 1.688-1.54 1.118l-3.383-2.46a1 1 0 00-1.176 0l-3.383 2.46c-.785.57-1.84-.197-1.54-1.118l1.286-3.967a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.174a1 1 0 00.95-.69l1.286-3.967z" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-gray-700 italic text-left">“{t.text}”</p>
                </div>
              ))}
            </div>
          </div>
        </section>
  )
}

export default Testimonials