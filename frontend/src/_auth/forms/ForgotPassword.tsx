import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white rounded-lg shadow-lg px-8 py-8 w-[409px]">
        <div className="flex justify-center mb-6">
          <img src="/assets/images/logo_beforesignin.svg" alt="myIU" />
        </div>

        <h1 className="text-center text-2xl font-semibold text-[#009CD1] mb-4">
          {t("auth.forgotPasswordTitle")}
        </h1>

        <div className="space-y-4 text-sm text-gray-700">
          <p>{t("auth.forgotPasswordPageText1")}</p>
          <p>{t("auth.forgotPasswordPageText2")}</p>
          <p>{t("auth.forgotPasswordPageText3")}</p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link to="/sign-in">
            <Button className="w-full text-[#09090B]" variant="outline">
              {t("auth.backToSignIn")}
            </Button>
          </Link>
          <p className="text-xs text-[#09090B] text-center">
            {t("auth.forgotPasswordHint")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
