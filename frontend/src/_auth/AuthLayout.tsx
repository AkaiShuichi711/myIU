import { Outlet, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useTranslation } from "react-i18next";
import { useUserContext } from "@/context/AuthContext";
import Flag from "react-world-flags";
import { LANGUAGES, getSavedLang, changeLanguage } from "@/lib/googleTranslate";

const carouselImages = [
  // "/assets/images/side-img1.svg",
  // "/assets/images/side-img2.jpg",
  // "/assets/images/side-img3.jpg",
  // "/assets/images/side-img5.jpg",
  "/assets/images/loginbg.png",
] as const;

const footerLinks = [
  "iuHomepage",
  "officesAndCenters",
  "privacyPolicy",
  "contacts",
  "officeOfAcademicAffairs",
] as const;

const socialIcons = ["facebook", "instagram", "outlook", "linkedin"] as const;

// === COMPONENT DEFINITION ===
// Split layout like before (form panel + photo carousel), but the left
// panel now uses a soft, slowly drifting iCloud-style aurora gradient
// instead of the old flat gradient.
const AuthLayout = () => {
  // === STATE AND CONSTANTS ===
  const { t } = useTranslation();
  const { isAuthenticated } = useUserContext();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(getSavedLang);
  const { pauseTheme, resumeTheme } = useTheme();

  useEffect(() => {
    pauseTheme();
    return resumeTheme;
  }, [pauseTheme, resumeTheme]);

  const activeLanguage = LANGUAGES.find((o) => o.code === currentLanguage) ?? LANGUAGES[0];

  const handleLangChange = (code: string) => {
    setCurrentLanguage(code);
    setIsLangOpen(false);
    changeLanguage(code);
  };

  // === CONDITIONAL RENDERING ===
  return isAuthenticated ? (
    <Navigate to="/" />
  ) : (
    <div className="min-h-screen w-full bg-[#050B24] flex flex-col">
      {/*
        Left (form) and right (carousel) stay as two separate panels in the
        markup — for layout control — but visually share one continuous
        aurora background: the blobs live in a single full-width layer
        behind both panels (z-0), the left panel has no background of its
        own (the aurora shows straight through), and the right panel's
        photo is left-edge-masked + tinted so it fades into that same
        aurora instead of showing a hard seam at the 50% line.
      */}
      <main className="relative flex flex-1 w-full min-h-0 overflow-hidden">
        {/* === Shared aurora layer, spans the full width === */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -top-[20%] left-[-8%] h-[70%] w-[45%] rounded-full bg-[#0068FF] opacity-40 blur-[120px] animate-aurora" />
          <div className="absolute top-[5%] left-[28%] h-[65%] w-[42%] rounded-full bg-[#2F398E] opacity-45 blur-[130px] animate-aurora [animation-delay:-7s]" />
          <div className="absolute bottom-[-28%] left-[5%] h-[65%] w-[45%] rounded-full bg-[#0057A8] opacity-40 blur-[140px] animate-aurora [animation-delay:-14s]" />
          <div className="absolute top-[-12%] left-[55%] h-[55%] w-[38%] rounded-full bg-[#5EC8FF] opacity-15 blur-[120px] animate-aurora [animation-delay:-4s]" />
          <div className="absolute bottom-[-10%] left-[62%] h-[50%] w-[35%] rounded-full bg-[#0057A8] opacity-25 blur-[130px] animate-aurora [animation-delay:-10s]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,transparent_25%,rgba(2,6,23,0.35)_100%)]" />
        </div>

        {/* === LEFT PANEL: form (transparent — aurora shows through) === */}
        <div
          className="relative z-10 w-full lg:w-1/2 flex items-center justify-center px-6 overflow-y-auto [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="relative z-10 w-full max-w-md py-8">
            <Outlet />
          </div>
        </div>

        {/* === RIGHT PANEL: photo carousel, blended into the aurora === */}
        {carouselImages.length > 0 && (
          <div className="hidden lg:block lg:w-1/2 relative h-full z-10">
            <div
              className="absolute inset-0"
              style={{
                maskImage: 'linear-gradient(to right, transparent, black 24%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 24%)',
              }}
            >
              <Swiper
                modules={[Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                autoplay={{ delay: 3500, disableOnInteraction: false }}
                loop={carouselImages.length > 1}
                className="w-full h-full"
              >
                {carouselImages.map((src, index) => (
                  <SwiperSlide key={src}>
                    <img src={src} alt={`Auth visual slide ${index + 1}`} className="h-full w-full object-cover" />
                  </SwiperSlide>
                ))}
              </Swiper>
              {/* Tint the photo toward the same navy so its overall tone matches the aurora */}
              <div className="pointer-events-none absolute inset-0 bg-[#050B24]/25 mix-blend-multiply" />
            </div>
          </div>
        )}
      </main>

      {/* === FOOTER (original) === */}
      <footer className="w-full bg-[#000000] pb-6 mt-auto border-t border-[#1E293B] relative z-10">
        <div className="max-w-8xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between text-sm text-[#ffffff]">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-start">
            {footerLinks.map((item) => {
              const url = t(`footerUrls.${item}`);
              const hasUrl = url && url !== `footerUrls.${item}`;
              return (
                <li key={item}>
                  {hasUrl ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative group inline-block px-1 py-1 hover:text-[#0085b3] transition-colors duration-200"
                    >
                      <span className="relative z-10">{t(`footer.${item}`)}</span>
                      <span className="absolute left-1/2 -bottom-2 h-1 w-1 rounded-full bg-[#0057A8] opacity-0 group-hover:opacity-100 transform -translate-x-1/2 transition-opacity duration-200" />
                    </a>
                  ) : (
                    <a
                      href="#"
                      className="relative group inline-block px-1 py-1 hover:text-[#0085b3] transition-colors duration-200"
                    >
                      <span className="relative z-10">{t(`footer.${item}`)}</span>
                      <span className="absolute left-1/2 -bottom-2 h-1 w-1 rounded-full bg-[#0057A8] opacity-0 group-hover:opacity-100 transform -translate-x-1/2 transition-opacity duration-200" />
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-4 md:mt-0 text-[#94A3B8]">{t("footer.copyright", { year: new Date().getFullYear() })}</p>
        </div>

        <div className="max-w-8xl mx-auto px-6">
          <div className="w-full h-px bg-[#1E293B]" />

          <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
            {/* === SOCIAL ICONS & CONTACT INFO === */}
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
              <div className="flex gap-4">
                {socialIcons.map((social) => (
                  <a key={social} href="#" className="transition-all duration-200 group">
                    <img
                      src={`/assets/icons/${social}.svg`}
                      alt={social}
                      className="h-6 w-6 transition-all duration-200"
                    />
                  </a>
                ))}
              </div>

              <span className="text-[#94A3B8] text-xs text-center sm:text-left leading-relaxed">
                <strong className="text-[#0057A8] font-medium">{t("footer.request")}:</strong>{" "}
                http://cis.hcmiu.edu.vn/gui-yeu-cau
                <br />
                <strong className="text-[#0057A8] font-medium">{t("footer.tel")}:</strong>{" "}
                (08) 37244270 ext.3366
              </span>
            </div>

            <div className="relative inline-block text-left mt-4 md:mt-0">
              <button
                type="button"
                onClick={() => setIsLangOpen((value) => !value)}
                className="flex items-center gap-2 p-2 hover:bg-[#1E293B]/50 active:bg-[#1E293B] rounded-lg transition-all duration-200"
              >
                <Flag
                  code={activeLanguage.flagCode}
                  className="h-6 w-8 object-cover rounded-[6px] shadow-sm"
                />
                <svg
                  className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform duration-200 ${
                    isLangOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isLangOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsLangOpen(false)}
                  />

                  <div className="absolute right-0 bottom-full mb-2 w-52 rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 max-h-72 overflow-y-auto">
                    {LANGUAGES.map((option) => (
                      <button
                        key={option.code}
                        type="button"
                        onClick={() => handleLangChange(option.code)}
                        className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg text-left transition-colors ${
                          currentLanguage === option.code
                            ? "bg-[#0A1128]/5 text-[#0A1128] font-semibold"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Flag
                            code={option.flagCode}
                            className="h-4 w-6 object-cover rounded-[6px]"
                          />
                          <span>{option.label}</span>
                        </div>
                        {currentLanguage === option.code && (
                          <svg className="w-4 h-4 text-gray-900 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// === EXPORT ===
export default AuthLayout;
