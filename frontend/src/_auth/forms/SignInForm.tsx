import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Eye, EyeOff, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SigninValidation } from "@/lib/validation";
import Loader from "@/components/shared/Loader";
import { useToast } from "@/components/ui/use-toast";
import { useSignInAccount } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";

const SignInForm = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { mutateAsync: signInAccount } = useSignInAccount();
  const { checkAuthUser } = useUserContext();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      Password: "",
    },
  });

  const firstError =
    form.formState.errors.email?.message || form.formState.errors.Password?.message;

  async function onSubmit(values: z.infer<typeof SigninValidation>) {
    setIsLoading(true);

    try {
      const session = await signInAccount(values);

      if (!session) {
        toast({ title: "Sign in failed. Please try again" });
        return;
      }

      const isLoggedIn = await checkAuthUser();
      if (isLoggedIn) {
        form.reset();
        navigate("/");
      } else {
        toast({ title: "Sign in failed. Please try again" });
      }
    } catch (error) {
      toast({ title: "Sign in failed. Please try again" });
    } finally {
      setIsLoading(false);
    }
  }

  const handleOffice365SignIn = async () => {
    setIsLoading(true);
    const targetOrigin = window.location.origin.replace(/\/+$/, '');
    const returnTo = `${targetOrigin}/home`;
    window.location.href = `${targetOrigin}/auth/login?returnTo=${encodeURIComponent(returnTo)}`;
  };

  return (
    <Form {...form}>
      <div className="flex flex-col items-center">
        {/* CARD */}
        <div className="bg-white rounded-lg shadow-lg px-8 py-8 w-[409px]">
          <div className="flex justify-center mb-6">
            <img src="/assets/images/logo_test2.svg" alt="myIU" />
          </div>

          <p className="text-center text-[#000000] font-BOLD mb-2">
            {t("auth.signInTitle")}
          </p>


          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 mt-6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder={t("auth.email")}
                        className="h-10 bg-white border border-gray-500 hover:border-[#2F88FF] pr-10"
                        {...field}
                      />
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={t("auth.password")}
                        className="h-10 bg-white border border-gray-500 hover:border-[#2F88FF] pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            {firstError ? (
              <div className="min-h-[1.25rem] text-xs text-red-600 overflow-hidden text-ellipsis whitespace-nowrap">
                {firstError}
              </div>
            ) : (
              <div className="min-h-[0.25rem]" />
            )}

            <div className="flex items-center justify-between gap-3 text-sm text-[#475569]">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#009cd1] focus:ring-[#009cd1]"
                />
                <span>{t("auth.rememberMe")}</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-[#009cd1] hover:text-[#0077b6]"
              >
                {t("auth.forgetPassword")}
              </Link>
            </div>
            <Button
              type="submit"
              className="bg-[#0A1128] hover:bg-[#111827] text-white h-10 flex items-center justify-center gap-2.5 shadow-lg border border-white/10"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader /> {t("auth.signingIn")}
                </div>
              ) : (
                t("auth.signIn")
              )}
            </Button>

            {/* Phân cách nhẹ nhàng */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#333333]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#ffffff] px-4 text-gray-500">
                  {t("auth.or")}
                </span>
              </div>
            </div>

            {/* Nút Office 365 - dùng <img> từ public folder */}
            <Button
              type="button"
              onClick={handleOffice365SignIn}
              disabled={isLoading}
              className="bg-[#2F88FF] hover:bg-[#1A5FC8] text-white border border-white/10 h-10 flex items-center justify-center gap-2.5 shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader /> {t("auth.signingIn")}
                </div>
              ) : (
                <>
                  <img
                    src="/assets/icons/microsoft-icon.svg"
                    alt="Office 365"
                    className="h-5 w-5"
                  />
                  <span>{t("auth.signInWithMicrosoft")}</span>
                </>
              )}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4">
              {t("auth.forgetPassword")}
              <Link to="/forgot-password" className="text-[#009CD1] ml-1">
                {t("auth.clickHere")}
              </Link>
            </p>
          </form>
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>{t("auth.loginIssues")}</p>
            <a
              href="mailto:support@pas.vn"
              className="text-[#009cd1] hover:underline"
            >
              {t("auth.contactEmail")}
            </a>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default SignInForm;
