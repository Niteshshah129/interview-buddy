const statsData = [
  { value: "500+", label: "Interview Questions" },
  { value: "50+", label: "Top Companies" },
  { value: "10K+", label: "Mock Interviews" },
  { value: "95%", label: "Success Rate" },
];

const Stats = () => {
  return (
    <div className="w-full py-10 sm:py-16 lg:py-24 px-4 sm:px-8 lg:px-32 bg-gray-50 border-y border-gray-100 shadow-inner">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4">
        {statsData.map((stat, index) => (
          <div key={index} className="flex flex-col items-center text-center gap-1.5">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#113155] tracking-tight">
              {stat.value}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-[#113155]/60 uppercase tracking-widest pt-1">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stats;