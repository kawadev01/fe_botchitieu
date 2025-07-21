"use client";

import { useEffect } from 'react';
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      router.replace("/admin");
    } else {
      router.replace("/login");
    }
  }, []);

  return null;
}