"use client";;
import Logo from "@/app/(DashboardLayout)/layout/shared/logo/Logo";
import AuthLogin from "../authforms/AuthLogin";
import { useEffect, useState } from "react";
import { isAuthenticated } from "@/utils/auth/auth";
import { useRouter } from "next/navigation";
import Loading from "@/app/(DashboardLayout)/layout/shared/loading/Loading";
import RedirectHome from "@/app/(DashboardLayout)/layout/shared/redirect/RedirectHome";

const BoxedLogin = () => {
  const router = useRouter();

  const [loading, setIsLoading] = useState(true);
  const [alreadyLogin, setAlaredyLogin] = useState(false);

  useEffect(() => {
    setAlaredyLogin(isAuthenticated());
    setIsLoading(false);
  }, [router],);
  if (loading) return <Loading />
  return alreadyLogin ?
    <RedirectHome message="Already Login" />
    : (
      <>
        <div className="relative overflow-hidden h-screen bg-muted dark:bg-dark">
          <div className="flex h-full justify-center items-center px-4">
            <div className="rounded-lg dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words md:w-[450px] w-full border-none ">
              <div className="flex h-full flex-col justify-center gap-2 p-0 w-full">
                <div className="mx-auto">
                  <Logo />
                </div>
                <p className="text-xl font-bold text-center text-blue my-3">
                  Next Era Entertainment
                </p>
                <AuthLogin />
              </div>
            </div>
          </div>
        </div>
      </>
    );
}

export default BoxedLogin;