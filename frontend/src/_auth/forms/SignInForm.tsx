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
    <div className="flex w-full max-w-[400px] flex-col items-center">
      <div className="w-full rounded-[28px] bg-white/90 px-9 py-10 shadow-[0_30px_80px_-20px_rgba(2,6,23,0.55)] ring-1 ring-black/[0.04] backdrop-blur-2xl">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <img src="/assets/images/logo_beforesignin.svg" alt="myIU" className="h-auto w-[190px] max-w-full" />
        </div>

        {/* Title */}
        <p className="mb-1 text-center text-[19px] font-semibold tracking-tight text-[#0A1128]">
          {t("auth.signInTitle")}
        </p>
        <p className="mb-8 text-center text-[13px] text-slate-500">
          {t("auth.microsoftOnly", "Use your IU Microsoft 365 account")}
        </p>

        {/* Info message (e.g. session revoked from another device) */}
        {infoMsg && (
          <div className="mb-4 rounded-xl bg-amber-50 px-4 py-2.5 text-center text-[13px] text-amber-700">
            {infoMsg}
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-center text-[13px] text-red-600">
            {errorMsg}
          </div>
        )}

        {/* Microsoft Sign In Button */}
        <Button
          type="button"
          onClick={handleMicrosoftSignIn}
          disabled={isLoading}
          className="flex h-[46px] w-full items-center justify-center gap-2.5 rounded-[6px] bg-[#0A1128] text-[14.5px] font-medium text-white transition-colors duration-200 hover:bg-black disabled:opacity-60"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader />
              <span>{t("auth.signingIn")}</span>
            </div>
          ) : (
            <>
              <img src="/assets/icons/microsoft-icon.svg" alt="Microsoft" className="h-[18px] w-[18px]" />
              <span>{t("auth.signInWithMicrosoft", "Sign in with Microsoft 365")}</span>
            </>
          )}
        </Button>

        {/* Contact */}
        <div className="mt-7 text-center text-[12.5px] text-slate-400">
          <p>{t("auth.loginIssues")}</p>
          <a href="mailto:support@pas.vn" className="font-medium text-[#0057A8] hover:underline">
            {t("auth.contactEmail")}
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
