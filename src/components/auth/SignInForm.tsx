"use client";

import Cookies from "js-cookie";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import authServices from '@/services/authServices';
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const router = useRouter();
  const [form, setForm] = useState({ username: 'admin', password: 'qweasdzxc' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;

    setForm((prev) => ({
      ...prev,
      [target.name]: target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authServices.login(form);
      Cookies.set("mb66botchitieu_token", res.data.access_token, { expires: 1, path: '/' });
      refreshUser();
      if (res.success == true && res.data) {
        setTimeout(() => {
          router.push("/admin");
        }, 500);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full m-auto">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5 p-3 mt-30">
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto ">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-center text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Đăng Nhập
            </h1>
          </div>
          <div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="Username"
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange} />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={form.password}
                      name="password"
                      onChange={handleChange}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>

                
                <div>
                  <Button className="w-full" size="sm" type="submit">
                    {loading ? 'Loading...' : 'Sign in'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}