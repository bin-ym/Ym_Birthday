"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Label from "@/components/ui/label";
import { Calendar as CalendarIcon, Gift } from "lucide-react";

interface BirthdayFormProps {
  onSubmit: (name: string, dateOfBirth: Date) => void;
}

export default function BirthdayForm({ onSubmit }: BirthdayFormProps) {
  const [name, setName] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    date?: string;
    day?: string;
    month?: string;
    year?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      name?: string;
      date?: string;
      day?: string;
      month?: string;
      year?: string;
    } = {};
    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (!day || !month || !year) {
      newErrors.date = "Please enter a full date";
    } else {
      if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
        newErrors.day = "Invalid day";
      }
      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        newErrors.month = "Invalid month";
      }
      if (
        isNaN(yearNum) ||
        yearNum < 1900 ||
        yearNum > new Date().getFullYear()
      ) {
        newErrors.year = "Invalid year";
      }

      if (!newErrors.day && !newErrors.month && !newErrors.year) {
        const date = new Date(yearNum, monthNum - 1, dayNum);
        if (date > new Date()) {
          newErrors.date = "Birth date cannot be in the future";
        }
        if (
          date.getFullYear() !== yearNum ||
          date.getMonth() !== monthNum - 1 ||
          date.getDate() !== dayNum
        ) {
          newErrors.date = "The date is invalid (e.g., Feb 30)";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const dateOfBirth = new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10)
      );
      console.log("Submitting form:", { name: name.trim(), dateOfBirth }); // Debug log
      onSubmit(name.trim(), dateOfBirth);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-lg rounded-2xl">
        <CardHeader className="text-center p-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-4 pulse-animation">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-extrabold text-gray-800">
            Let&apos;s Celebrate You!
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Tell us about yourself to start the party
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-semibold text-gray-700"
              >
                Your Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`transition-all duration-300 rounded-lg px-4 py-3 bg-gray-50 border-2 ${
                  errors.name
                    ? "border-red-500 focus:border-red-500 ring-red-500"
                    : "border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                }`}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p
                  id="name-error"
                  className="text-sm text-red-600"
                  role="alert"
                >
                  {errors.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Date of Birth
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  type="number"
                  placeholder="DD"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className={`transition-all duration-300 rounded-lg px-4 py-3 bg-gray-50 border-2 ${
                    errors.day || errors.date
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                />
                <Input
                  type="number"
                  placeholder="MM"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className={`transition-all duration-300 rounded-lg px-4 py-3 bg-gray-50 border-2 ${
                    errors.month || errors.date
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                />
                <Input
                  type="number"
                  placeholder="YYYY"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className={`transition-all duration-300 rounded-lg px-4 py-3 bg-gray-50 border-2 ${
                    errors.year || errors.date
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                />
              </div>
              {errors.date && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.date}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              aria-label="Start celebration"
            >
              🎉 Start My Celebration! 🎂
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
