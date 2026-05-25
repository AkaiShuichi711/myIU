import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SigninValidation } from "@/lib/validation";
import Loader from "@/components/shared/Loader";
import { useToast } from "@/components/ui/use-toast";
import { useSignInAccount } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { loginRequest, graphConfig } from "@/lib/msal/config";
import { signInWithMicrosoft } from "@/lib/appwrite/api";

const SignInForm = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { instance } = useMsal();
  const { mutateAsync: signInAccount } = useSignInAccount();
  const { checkAuthUser, isLoading: isUserLoading, setUser, setIsAuthenticated } = useUserContext();
  const [showPassword, setShowPassword] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);

  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      Password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof SigninValidation>) {
    const session = await signInAccount(values);

    if (!session) {
      return toast({ title: "Sign in failed. Please try again" });
    }
    const isLoggedIn = await checkAuthUser();

    if (isLoggedIn) {
      form.reset();
      navigate("/");
    } else {
      toast({ title: "Sign in failed. Please try again" });
    }
  }

  const handleOffice365SignIn = async () => {
    setIsMicrosoftLoading(true);
    try {
      // Login with redirect
      const response = await instance.loginPopup(loginRequest);
      
      if (!response.accessToken) {
        throw new Error("No access token received");
      }

      // Get user profile from Microsoft Graph
      const graphResponse = await fetch(graphConfig.graphMeEndpoint, {
        headers: {
          Authorization: `Bearer ${response.accessToken}`,
        },
      });

      if (!graphResponse.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const msalUser = await graphResponse.json();

      // Create/sync user in Appwrite
      const appwriteUser = await signInWithMicrosoft(response.accessToken, msalUser, [], []);

      if (!appwriteUser) {
        throw new Error("Failed to create user in database");
      }

      // Since Appwrite session may not exist (we used MSAL), set auth context directly
      try {
        setUser({
          id: appwriteUser.$id || appwriteUser.accountId || msalUser.id,
          name: appwriteUser.name || msalUser.displayName,
          username: appwriteUser.username || msalUser.mailNickname || msalUser.userPrincipalName?.split('@')[0],
          email: appwriteUser.email || msalUser.mail || msalUser.userPrincipalName,
          imageUrl: appwriteUser.imageUrl || '',
          bio: appwriteUser.bio || '',
        });
        setIsAuthenticated(true);
      } catch (err) {
        console.warn('Failed to set auth context directly', err);
      }

      toast({
        title: "Success",
        description: `Welcome back, ${msalUser.displayName}!`,
      });
      navigate("/");
    } catch (error: any) {
      console.error("Office 365 sign in error:", error);
      
      if (error.errorCode === "user_cancelled") {
        toast({
          title: "Sign in cancelled",
          description: "You cancelled the Office 365 sign in process.",
        });
      } else {
        toast({
          title: "Office 365 sign in failed",
          description: error.message || "Please try again or use email login.",
        });
      }
    } finally {
      setIsMicrosoftLoading(false);
    }
  };

  return (
    <Form {...form}>
      <div className="flex flex-col items-center">
        {/* CARD */}
        <div className="bg-white rounded-lg shadow-lg px-8 py-8 w-[409px]">
          <div className="flex justify-center mb-6">
            <img src="/assets/images/logo_test2.svg" alt="myIU" />
          </div>

          <p className="text-center text-[#323393] font-medium mb-2">
            {t("auth.signInTitle")}
          </p>


          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
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
                        className="h-10 bg-white border border-gray-500 focus:border-[#009cd1] focus:ring-0 pr-10"
                        {...field}
                      />
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    </div>
                  </FormControl>
                  <FormMessage />
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
                        className="h-10 bg-white border border-gray-500 focus:border-[#009cd1] focus:ring-0 pr-10"
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="bg-gradient-to-b from-[#009cd1] to-[#323393] text-white h-10 flex items-center justify-center gap-2.5 shadow-sm"
              disabled={isUserLoading}
            >
              {isUserLoading ? (
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
              disabled={isMicrosoftLoading}
              className="bg-[#f6f8fa] hover:bg-[#f4f4f4] text-[#323393] hover:text-[#323398] border border-[#323393] h-10 flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-50"
            >
              {isMicrosoftLoading ? (
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
                  Sign in with Microsoft
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
