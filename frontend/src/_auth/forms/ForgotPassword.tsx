import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white rounded-lg shadow-lg px-8 py-8 w-[409px]">
        <div className="flex justify-center mb-6">
          <img src="/assets/images/logo_beforesignin.svg" alt="myIU" />
        </div>

        <h1 className="text-center text-2xl font-semibold text-[#009CD1] mb-4">
          Quên mật khẩu
        </h1>

        <div className="space-y-3 text-sm text-gray-700">
          <p>
            Mật khẩu IU Microsoft 365 của bạn được quản lý bởi{" "}
            <span className="font-medium">VNU-HCM IT</span>.
          </p>
          <p>
            Nhấn nút bên dưới để đặt lại mật khẩu trực tiếp trên trang
            Microsoft.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <a
            href="https://passwordreset.microsoftonline.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="w-full bg-[#009CD1] hover:bg-[#007BAA] text-white">
              Đặt lại mật khẩu Microsoft
            </Button>
          </a>
          <Link to="/sign-in">
            <Button className="w-full text-[#09090B]" variant="outline">
              Quay lại đăng nhập
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
