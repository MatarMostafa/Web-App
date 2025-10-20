"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";

export default function ConfirmEmail() {
  const params = useSearchParams();
  const token = params.get("token");
  const email = params.get("email");

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="flex items-center space-x-2 justify-center mb-4">
        <Link href="/" className="flex items-center gap-2 mr-8">
          <Image
            src="/img/fe441c05-5318-4144-ba3b-7e5227ec2afa.png"
            alt="MetMe Logo"
            className="h-8 w-8"
            width={32}
            height={32}
          />
          <span className="font-display text-2xl font-semibold">MetMe</span>
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">Verifying...</h1>
      <p>Please wait while we verify your email.</p>
    </div>
  );
}
