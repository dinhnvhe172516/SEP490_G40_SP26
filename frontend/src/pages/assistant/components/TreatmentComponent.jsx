import React from 'react'; 
import {
  Clock,
} from "lucide-react";
import Badge from '../../../components/ui/Badge';

const TreatmentComponent = ({ treatment, index }) => {
  console.log("Đang render treatment:", treatment.tooth_position);
  return (
    <div
      className={`relative p-4 rounded-2xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        treatment.status === "DONE"
          ? "bg-green-50/40 border-green-200"
          : "bg-blue-50/30 border-blue-100"
      }`}
    >
      {/* Step Number */}
      <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-white border border-gray-200 text-[10px] flex items-center justify-center font-bold shadow-sm">
        {index + 1}
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-1">
        <p className="text-sm font-bold text-gray-800">
          {treatment.tooth_position}
        </p>
        <Badge
          variant={treatment.status === "DONE" ? "success" : "primary"}
          className="text-[9px] px-2 py-0"
        >
          {treatment.status === "DONE" ? "Hoàn thành" : "Kế hoạch"}
        </Badge>
      </div>

      {/* Note */}
      <p className="text-xs text-gray-500 mb-2 font-medium line-clamp-2">
        {treatment.note || "Không có ghi chú"}
      </p>

      {/* Date */}
      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase">
        <Clock size={12} />
        {new Date(treatment.planned_date).toLocaleDateString("vi-VN")}
      </div>
    </div>
  );
};

export default TreatmentComponent;
