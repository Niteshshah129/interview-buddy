import { Link } from "react-router-dom";
import HomeNavbar from "../components/HomeNavbar";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import HomeFooter from "../components/HomeFooter";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-full overflow-x-hidden">
      <HomeNavbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />

      {/* CTA Section */}
      <div className="py-12 sm:py-16 lg:py-24 px-4 sm:px-8 lg:px-32 text-black flex flex-col items-center text-center gap-6 sm:gap-10">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight max-w-2xl">
          Ready to Ace Your Interview?
        </h2>
        <p className="text-sm sm:text-base lg:text-lg font-normal text-gray-600 max-w-xl">
          Join thousands of candidates who have successfully prepared for their dream jobs.
        </p>
        <Link
          to="/login"
          className="flex items-center gap-2 text-sm sm:text-base font-bold text-white bg-[#1EB79C] hover:bg-[#159a82] px-8 sm:px-12 py-3 sm:py-4 rounded-full shadow-lg transition duration-200"
        >
          Get Started For Free
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>

      <HomeFooter />
    </div>
  );
};

export default Home;
