'use client';;
import { Button } from "flowbite-react/components/Button";
import Image from "next/image";
import ErrorImg from "/public/images/backgrounds/wrongimg.svg";

interface MessageProps {
    message: string;
    onPressedText: string;
    onPressed: () => Promise<void>;
}

const SomethingWasWrong = ({ message, onPressedText, onPressed }: MessageProps) => {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center">
                <Image src={ErrorImg} width={300} alt="error" className="mb-4" />
                <h1 className="text-ld text-4xl mb-6">Opps!!!</h1>
                <h6 className="text-xl text-ld">
                    {message}
                </h6>
                <Button color={"primary"} onClick={onPressed} className="w-fit mt-6 mx-auto">
                    {onPressedText}
                </Button>
            </div>
        </div>
    )
}

export default SomethingWasWrong
