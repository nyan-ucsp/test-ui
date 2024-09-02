'use client'
import React from 'react';
import Image from "next/image";
import LogoIcon from '/public/images/logos/logo-icon.svg'

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <Image src={LogoIcon} width={150} height={150} alt="loading" />
    </div>
  )
}

export default Loading
