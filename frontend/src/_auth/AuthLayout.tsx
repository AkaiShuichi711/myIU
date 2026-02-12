// === IMPORTS ===
import { Outlet, Navigate } from "react-router-dom";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useTranslation } from "node_modules/react-i18next";

// === COMPONENT DEFINITION ===
const AuthLayout = () => {
  // === STATE AND CONSTANTS ===
  const { t, i18n } = useTranslation();
  const isAuth = false;
  const [currentSlide, setCurrentSlide] = useState(0);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };
  const carouselImages = [
    "/assets/images/side-img1.svg",
    "/assets/images/side-img2.jpg",
    "/assets/images/side-img3.jpg",
    "/assets/images/side-img4.jpg",
    "/assets/images/side-img5.jpg",
  ];

  // === CONDITIONAL RENDERING ===
  return isAuth ? (
    <Navigate to="/" />
  ) : (
    // === MAIN LAYOUT CONTAINER ===
    <div className="min-h-screen w-full bg-white flex flex-col">
      {/* === MAIN CONTENT SECTION === */}
      <main className="flex flex-1 w-full">
        {/* === LEFT SIDE: AUTH FORM === */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 bg-gradient-to-r from-[#009cd1] to-[#323393]">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>

        {/* === RIGHT SIDE: CAROUSEL COMPONENT === */}
        {/* THÊM MỚI: Phần carousel chỉ hiện trên desktop (lg:) */}
        {carouselImages.length > 0 && (
          <div className="hidden lg:flex lg:w-1/2 relative overflow-visible bg-gradient-to-br from-[#009cd1]/10 to-[#323393]/20 h-full z-10">
            {" "}
            {/* THÊM h-full + z-10 để dots không bị che */}
            <Swiper
              modules={[Pagination, Autoplay]}
              spaceBetween={0}
              slidesPerView={1}
              pagination={{
                type: "progressbar",
              }}
              onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
              autoplay={{
                delay: 400, //1000ms = 1 giây: tốc độ chuyển slide
                disableOnInteraction: false,
              }}
              loop={carouselImages.length > 1}
              className="w-full h-full [&_.swiper-pagination-progressbar]:bottom-0"
              style={
                {
                  "--swiper-pagination-color":
                    "linear-gradient(to right, #009cd1, #323393)", // Gradient cho thanh progress
                  "--swiper-pagination-progressbar-bg-color":
                    "rgba(255, 255, 255, 0.3)", // Màu nền thanh progress
                  "--swiper-pagination-bottom": "0px",
                } as React.CSSProperties
              }
            >
              {carouselImages.map((src, index) => (
                <SwiperSlide key={index}>
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
      <footer className="w-full bg-black py-4 mt-auto">
        {/* <footer className="w-full bg-[#323393] py-4 mt-auto"> */}
        {/* === FOOTER TOP: LINKS AND COPYRIGHT === */}
        <div className="max-w-8xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between text-sm text-[#ffffff]">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 ">
            <li>
              <a href="#" className="hover:text-[#44af51] transition-colors">
                {t("footer.iuHomepage")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#44af51] transition-colors">
                {t("footer.officesAndCenters")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#44af51] transition-colors">
                {t("footer.privacyPolicy")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#44af51] transition-colors">
                {t("footer.officesAndCenters")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#44af51] transition-colors">
                {t("footer.contacts")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#44af51] transition-colors">
                {t("footer.officeOfAcademicAffairs")}
              </a>
            </li>
          </ul>
          <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
        </div>

        {/* === FOOTER BOTTOM: SOCIAL ICONS AND LANGUAGE BUTTONS === */}
        <div className="max-w-8xl mx-auto px-6">
          <div className="w-full h-px bg-[#009cd1]" />
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* === SOCIAL ICONS COMPONENT === */}
            <div className="flex gap-4 mt-4">
              <a href="#" className="transition-colors">
                <img
                  src="/assets/icons/facebook.svg"
                  alt="Office 365"
                  className="h-5 w-5"
                  style={{
                    width: "30px",
                    height: "30px",
                    backgroundColor: "#000000",
                    borderRadius: "20%",
                  }}
                />
              </a>
              <a href="#" className="transition-colors">
                <img
                  src="/assets/icons/instagram.svg"
                  alt="Office 365"
                  className="h-5 w-5"
                  style={{
                    width: "30px",
                    height: "30px",
                    backgroundColor: "#000000",
                    borderRadius: "20%",
                  }}
                />
              </a>

              <a href="#" className="transition-colors">
                <img
                  src="/assets/icons/outlook.svg"
                  alt="Office 365"
                  className="h-5 w-5"
                  style={{
                    width: "30px",
                    height: "30px",
                    backgroundColor: "#000000",
                    borderRadius: "20%",
                  }}
                />
              </a>
              <a href="#" className=" transition-colors">
                <img
                  src="/assets/icons/linkedin.svg"
                  alt="Office 365"
                  className="h-5 w-5"
                  style={{
                    width: "30px",
                    height: "30px",
                    backgroundColor: "#000000",
                    borderRadius: "20%",
                  }}
                />
              </a>
              <span className="text-white text-sm ml-4">
                <span style={{ color: "#009cd1" }}>{t("footer.request")}:</span>{" "}
                http://cis.hcmiu.edu.vn/gui-yeu-cau
                <br />
                <span style={{ color: "#009cd1" }}>
                  {t("footer.tel")}:
                </span>{" "}
                (08) 37244270 ext.3366
              </span>
            </div>
            {/* === LANGUAGE BUTTONS COMPONENT === */}
            <div className="flex gap-4 items-center flex flex-col md:flex-row items-center justify-center md:justify-end mt-4">
              <button
                onClick={() => changeLanguage("vi")}
                className="flex items-center gap-2 text-white hover:text-[#44af51] transition-colors"
              >
                <span className="text-3xl">🇻🇳</span>
                <span className="text-sm">{t("footer.vietnamese")}</span>
              </button>
              <button
                onClick={() => changeLanguage("en")}
                className="flex items-center gap-2 text-white hover:text-[#44af51] transition-colors"
              >
                <span className="text-3xl">🇬🇧</span>
                <span className="text-sm">{t("footer.english")}</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// === EXPORT ===
export default AuthLayout;
