import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  return (
    <div className="flex w-full max-w-[400px] flex-col items-center">
      <div className="w-full rounded-[28px] bg-white/90 px-9 py-10 shadow-[0_30px_80px_-20px_rgba(2,6,23,0.55)] ring-1 ring-black/[0.04] backdrop-blur-2xl">
        <div className="mb-6 flex justify-center">
          <img src="/assets/images/logo_beforesignin.svg" alt="myIU" className="h-auto w-[190px] max-w-full" />
        </div>

        <h1 className="mb-4 text-center text-[19px] font-semibold tracking-tight text-[#0A1128]">
          Quên mật khẩu
        </h1>

        <div className="space-y-3 text-center text-[13px] text-slate-500">
          <p>
            Mật khẩu IU Microsoft 365 của bạn được quản lý bởi{" "}
            <span className="font-medium text-slate-600">VNU-HCM IT</span>.
          </p>
          <p>
            Nhấn nút bên dưới để đặt lại mật khẩu trực tiếp trên trang
            Microsoft.
          </p>
        </div>

        <div className="mt-7 flex flex-col gap-2.5">
          <a
            href="https://passwordreset.microsoftonline.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="h-[46px] w-full rounded-[6px] bg-[#0A1128] text-[14.5px] font-medium text-white transition-colors duration-200 hover:bg-black">
              Đặt lại mật khẩu Microsoft
            </Button>
          </a>
          <Link to="/sign-in">
            <Button
              variant="outline"
              className="h-[46px] w-full rounded-[6px] border-slate-200 text-[14.5px] font-medium text-[#0A1128] hover:bg-slate-50"
            >
              Quay lại đăng nhập
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
