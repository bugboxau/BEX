import React from "react";
import { Award } from "lucide-react"; // icon library
import { Card, CardContent } from "@/components/ui/card";

export default function DigitalBadge({ name, course, issuedBy, date }) {
  return (
    <Card className="w-80 rounded-2xl shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-4">
      <CardContent className="flex flex-col items-center text-center space-y-3">
        {/* Badge Icon */}
        <div className="bg-white text-purple-600 rounded-full p-3 shadow-md">
          <Award size={48} />
        </div>

        {/* Badge Details */}
        <h2 className="text-xl font-bold">{name}</h2>
        <p className="text-sm">Awarded for completing</p>
        <p className="text-lg font-semibold">{course}</p>

        <div className="text-xs opacity-80">
          <p>Issued by: {issuedBy}</p>
          <p>Date: {date}</p>
        </div>
      </CardContent>
    </Card>
  );
}
