'use client';
import { Button } from "flowbite-react/components/Button";
import Image from "next/image";
import Link from "next/link";
import ErrorImg from "/public/images/backgrounds/wrongimg.svg";

;
interface MessageProps {
    message: string;
}

const RedirectHome = ({ message }: MessageProps) => {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center">
                <Image src={ErrorImg} width={400} alt="error" className="mb-4" />
                <h1 className="text-ld text-4xl mb-6">Opps!!!</h1>
                <h6 className="text-xl text-ld">
                    {message}
                </h6>
                <Button color={"primary"} href="/" as={Link} className="w-fit mt-6 mx-auto">
                    Go Back to Home
                </Button>
            </div>
        </div>
    )
}

export default RedirectHome
