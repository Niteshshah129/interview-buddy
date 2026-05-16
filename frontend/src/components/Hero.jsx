import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative z-10 w-full bg-gradient-to-br from-[#162447] via-[#2d5878] to-[#2fa6a2] shadow-lg text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-32 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1EB79C] bg-accent/20 mb-6 sm:mb-8">
          <span className="rounded-full border border-[#1EB79C]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#1EB79C]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </span>
          <span className="text-xs sm:text-sm font-medium">AI-Powered Interview Prep</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6">
          Ace Your Next
          <span className="block text-[#1EB79C]">Technical Interview</span>
        </h1>

        {/* Subheading */}
        <p className="text-sm sm:text-lg md:text-xl text-white/80 mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
          Practice with real-world interview questions from top tech companies. Track your
          progress, get instant feedback, and land your dream job!
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
          <Link
            to="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm sm:text-base font-bold text-white bg-[#1EB79C] hover:bg-[#159a82] px-8 sm:px-12 py-3 sm:py-4 rounded-full shadow-lg transition duration-200"
          >
            Start Practicing Free
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto flex items-center justify-center text-sm sm:text-base font-semibold text-white hover:bg-white/10 border border-[#A9A9A9] px-8 sm:px-12 py-3 sm:py-4 rounded-full shadow-lg transition duration-200"
          >
            I have an account
          </Link>
        </div>

        {/* Bottom badges */}
        <div className="mt-10 sm:mt-16 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-white/60 text-xs sm:text-base">
          {["No credit card required", "Practice anytime, anywhere", "Updated question bank"].map((text, i) => (
            <div key={i} className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6 text-[#1EB79C]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;