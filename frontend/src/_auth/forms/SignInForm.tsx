import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";

const ERROR_MESSAGES: Record<string, string> = {
  not_provisioned: "Your account has not been registered in the system. Please contact your administrator.",
  account_inactive: "Your account has been deactivated. Please contact your administrator.",
  oauth2: "Authentication failed. Please try again.",
  no_email: "Could not retrieve your email from Microsoft. Please try again.",
};

const REASON_MESSAGES: Record<string, string> = {
  session_expired: "Phiên đăng nhập của bạn đã bị đăng xuất từ thiết bị khác.",
};

const SignInForm = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) setErrorMsg(ERROR_MESSAGES[err] ?? "An error occurred. Please try again.");
    const reason = searchParams.get("reason");
    if (reason) setInfoMsg(REASON_MESSAGES[reason] ?? null);
  }, [searchParams]);

  const handleMicrosoftSignIn = () => {
    setIsLoading(true);
    setErrorMsg(null);
    window.location.href = `${import.meta.env.VITE_API_URL}/oauth2/authorization/microsoft`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative bg-white px-8 py-8 w-[400px] max-w-full rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 32px rgba(15,13,61,0.18), 0 2px 8px rgba(0,0,0,0.08)' }}>
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/assets/images/logo_beforesignin.svg" alt="myIU" />
        </div>

        {/* Title */}
        <p className="text-center text-[#000000] font-bold text-lg mb-1">
          {t("auth.signInTitle")}
        </p>
        <p className="text-center text-gray-500 text-sm mb-8">
          {t("auth.microsoftOnly", "Use your IU Microsoft 365 account")}
        </p>

        {/* Info message (e.g. session revoked from another device) */}
        {infoMsg && (
          <div className="mb-4 px-4 py-3 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-sm">
            {infoMsg}
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 px-4 py-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Microsoft Sign In Button */}
        <Button
          type="button"
          onClick={handleMicrosoftSignIn}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#009CD1] to-[#0085b3] hover:from-[#0085b3] hover:to-[#006fa3] text-white h-12 flex items-center justify-center gap-3 text-[14px] font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5" style={{ boxShadow: '0 4px 16px rgba(0,156,209,0.35)' }}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader />
              <span>{t("auth.signingIn")}</span>
            </div>
          ) : (
            <>
              <img
                src="/assets/icons/microsoft-icon.svg"
                alt="Microsoft"
                className="h-5 w-5"
              />
              <span>{t("auth.signInWithMicrosoft", "Sign in with Microsoft 365")}</span>
            </>
          )}
        </Button>

        {/* Contact */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>{t("auth.loginIssues")}</p>
          <a href="mailto:support@pas.vn" className="text-[#009CD1] hover:underline">
            {t("auth.contactEmail")}
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
