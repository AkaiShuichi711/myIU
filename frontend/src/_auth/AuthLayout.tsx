// === IMPORTS ===
import { Outlet, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useTranslation } from "react-i18next";
import { useUserContext } from "@/context/AuthContext";
import Flag from "react-world-flags";
import { LANGUAGES, getSavedLang, changeLanguage } from "@/lib/googleTranslate";

const carouselImages = [
  "/assets/images/side-img1.svg",
  "/assets/images/side-img2.jpg",
  "/assets/images/side-img3.jpg",
  "/assets/images/side-img5.jpg",
] as const;

const footerLinks = [
  "iuHomepage",
  "officesAndCenters",
  "privacyPolicy",
  "contacts",
  "officeOfAcademicAffairs",
] as const;

const socialIcons = ["facebook", "instagram", "outlook", "linkedin"] as const;


const swiperStyle = {
  "--swiper-pagination-color": "linear-gradient(to right, #0068FF, #323393)",
  "--swiper-pagination-progressbar-bg-color": "rgba(255, 255, 255, 0.3)",
  "--swiper-pagination-bottom": "0px",
} as Record<string, string>;

// === COMPONENT DEFINITION ===
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
    // === MAIN LAYOUT CONTAINER ===
    <div className="h-screen w-full bg-white flex flex-col overflow-hidden">
      {/* === MAIN CONTENT SECTION === */}
      <main className="flex flex-1 w-full min-h-0">
        {/* === LEFT SIDE: AUTH FORM === */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 bg-gradient-to-r from-[#faf8fc] to-[#323393] overflow-auto">
          <div className="w-full max-w-md overflow-auto">
            <Outlet />
          </div>
        </div>

        {/* === RIGHT SIDE: CAROUSEL COMPONENT === */}
        {/* THÊM MỚI: Phần carousel chỉ hiện trên desktop (lg:) */}
        {carouselImages.length > 0 && (
          <div className="hidden lg:flex lg:w-1/2 relative overflow-visible bg-gradient-to-br from-[#0068FF]/10 to-[#323393]/20 h-full z-10">
            {/* THÊM h-full + z-10 để dots không bị che */}
            <Swiper
              modules={[Pagination, Autoplay]}
              spaceBetween={0}
              slidesPerView={1}
              pagination={{ type: "progressbar" }}
              autoplay={{ delay: 1000, disableOnInteraction: false }}
              loop={carouselImages.length > 1}
              className="w-full h-full [&_.swiper-pagination-progressbar]:bottom-0"
              style={swiperStyle}
            >
              {carouselImages.map((src, index) => (
                <SwiperSlide key={src}>
                  <img
                    src={src}
                    alt={`Auth visual slide ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </main>

      {/* === FOOTER SECTION === */}
      {/* === FOOTER SECTION === */}
<footer className="w-full bg-[#000000] pb-6 mt-auto border-t border-[#1E293B]">
  {/* === FOOTER TOP: LINKS AND COPYRIGHT === */}
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
                className="relative group inline-block px-1 py-1 hover:text-[#0068FF] transition-colors duration-200"
              >
                <span className="relative z-10">{t(`footer.${item}`)}</span>
                <span className="absolute left-1/2 -bottom-2 h-1 w-1 rounded-full bg-[#0068FF] opacity-0 group-hover:opacity-100 transform -translate-x-1/2 transition-opacity duration-200" />
              </a>
            ) : (
              <a
                href="#"
                className="relative group inline-block px-1 py-1 hover:text-[#0068FF] transition-colors duration-200"
              >
                <span className="relative z-10">{t(`footer.${item}`)}</span>
                <span className="absolute left-1/2 -bottom-2 h-1 w-1 rounded-full bg-[#0068FF] opacity-0 group-hover:opacity-100 transform -translate-x-1/2 transition-opacity duration-200" />
              </a>
            )}
          </li>
        );
      })}
    </ul>
    <p className="mt-4 md:mt-0 text-[#94A3B8]">{t("footer.copyright", { year: new Date().getFullYear() })}</p>
  </div>

  {/* === FOOTER BOTTOM: SOCIAL ICONS AND LANGUAGE BUTTONS === */}
  <div className="max-w-8xl mx-auto px-6">
    {/* Đường kẻ phân cách tinh tế theo style công nghệ */}
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
          <strong className="text-[#0068FF] font-medium">{t("footer.request")}:</strong>{" "}
          http://cis.hcmiu.edu.vn/gui-yeu-cau
          <br />
          <strong className="text-[#0068FF] font-medium">{t("footer.tel")}:</strong>{" "}
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
            className="h-6 w-8 object-cover rounded-[3px] shadow-sm"
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
                      className="h-4 w-6 object-cover rounded-[2px]"
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
