import React from 'react'

const ReadyToTransform = () => {
  return (
    <section className="bg-blue-600 text-white text-center py-20 px-6">
          <h3 className="text-xl md:text-5xl font-bold mb-4">
            {/* Ready to transform your project management? */}
            {"Ready to transform your project management?"
              .split("")
              .map((char, i) => (
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
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of administrators who trust our platform to manage
            their projects efficiently and securely.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <button className="flex items-center gap-2 bg-white text-blue-600 font-semibold px-6 py-3 rounded-md shadow hover:bg-blue-50 transition cursor-pointer">
              Start Free 14-Day Trial
            </button>
            <button className="flex items-center gap-2 border-2 border-white text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-500 transition cursor-pointer">
              Schedule Demo
            </button>
          </div>

          <p className="text-sm text-blue-200 mt-4">
            No credit card required • Full feature access • Cancel anytime
          </p>
        </section>
  )
}

export default ReadyToTransform