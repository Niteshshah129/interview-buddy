const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg flex flex-col gap-6 transform hover:scale-105 transition-transform duration-300">
      <div className="bg-[#1EB79C]/10 p-5 rounded-xl self-start">
        {icon}
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="text-2xl font-bold text-[#113155] tracking-tight">{title}</h3>
        <p className="text-base font-normal text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;