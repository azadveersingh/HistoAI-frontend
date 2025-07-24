import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {/* Left Side (Form) */}
        {children}

        {/* Right Side (Carousel & Logo) */}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid">
          <div className="flex flex-col items-center justify-start w-full h-full p-6">
            {/* Logo on Top */}
            <Link to="/" className="block mb-6">
              <img
                width={200}
                height={40}
                src="/src/images/logo.png"
                alt="Graphiti Multimedia Logo"
                className="object-contain"
              />
            </Link>

            {/* Welcome Message */}
            <div className="text-center px-6 mt-4 animate-fadeIn">
              <h2 className="text-3xl font-bold text-white dark:text-white mb-3 tracking-wide drop-shadow">
                Welcome to Histo<span className="text-brand-300">AI</span>
              </h2>
              <p className="text-base text-gray-200 dark:text-gray-300 max-w-md leading-relaxed">
                AI-powered historical data analysis
              </p>

            </div>

            {/* Carousel */}
            <div className="w-full h-auto overflow-hidden mt-20">
              <Carousel
                autoPlay
                infiniteLoop
                showThumbs={false}
                showStatus={false}
                interval={3000}
                transitionTime={600}
                className="rounded-lg"
              >
                <div>
                  <img
                    src="/src/images/slide.jpg"
                    alt="Slide 1"
                    className="object-contain h-auto w-full"
                  />
                </div>
                <div>
                  <img
                    src="/src/images/slide1.jpg"
                    alt="Slide 2"
                    className="object-contain h-auto w-full"
                  />
                </div>
                <div>
                  <img
                    src="/src/images/slide2.jpg"
                    alt="Slide 3"
                    className="object-contain h-auto w-full"
                  />
                </div>
              </Carousel>
            </div>
          </div>
        </div>

        {/* Theme Toggler */}
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
