"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "./layout/vertical/sidebar/Sidebar";
import Header from "./layout/vertical/header/Header";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/utils/auth/auth";
import Loading from "./layout/shared/loading/Loading";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/auth/login');
    } else {
      setLoading(false); // Only show the dashboard if authenticated
    }
  }, [router]);

  if (loading) {
    return <Loading />; // Or return a loading spinner if you prefer
  }

  return (
    <div className="flex w-full min-h-screen">
      <div className="page-wrapper flex w-full">
        {/* Header/sidebar */}
        <Sidebar />
        <div className="body-wrapper w-full bg-lightgray dark:bg-dark">
          <Header />
          {/* Body Content  */}
          <div
            className={`container mx-auto  py-30`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
