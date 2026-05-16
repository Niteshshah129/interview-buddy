const stepsData = [
  {
    number: 1,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1EB79C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: "Create Account",
    description: "Sign up for free and set up your profile.",
  },
  {
    number: 2,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1EB79C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: "Choose Company",
    description: "Select your target company.",
  },
  {
    number: 3,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1EB79C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.825-3.048 12.083 12.083 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    ),
    title: "Start Practicing",
    description: "Practice with real interview questions.",
  },
];

const HowItWorks = () => {
  return (
    <div className="w-full py-12 sm:py-16 lg:py-24 px-4 sm:px-8 lg:px-32 flex flex-col gap-10 sm:gap-16 lg:gap-20 items-center">
      <div className="flex flex-col gap-3 items-center text-center max-w-2xl px-4">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#113155] tracking-tight">
          How It Works
        </h2>
        <p className="text-sm sm:text-base lg:text-lg font-normal text-gray-500 leading-relaxed pt-1">
          Get started in just 3 simple steps
        </p>
      </div>

      {/* 1 col mobile, 3 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-12 w-full max-w-4xl">
        {stepsData.map((step, index) => (
          <div key={index} className="flex flex-col items-center gap-4 sm:gap-6 text-center">
            <div className="relative">
              <div className="bg-[#1EB79C]/10 p-5 rounded-full z-10 relative shadow-inner">
                {step.icon}
              </div>
              <div className="absolute top-[80%] -right-[1.8rem] z-20">
                <span className="flex items-center justify-center bg-[#113155] text-white font-extrabold text-base rounded-full h-8 w-8 border-4 border-gray-50">
                  {step.number}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-4">
              <h3 className="text-xl sm:text-2xl font-bold text-[#113155] tracking-tight pt-1">
                {step.title}
              </h3>
              <p className="text-sm sm:text-base font-normal text-gray-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;