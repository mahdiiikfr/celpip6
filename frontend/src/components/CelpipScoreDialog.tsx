import React from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Headphones, BookOpen, PenTool, Mic } from "lucide-react";

interface CelpipScoreDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (
    module: "listening" | "reading" | "writing" | "speaking",
  ) => void;
}

export default function CelpipScoreDialog({
  isOpen,
  onClose,
  onSelectModule,
}: CelpipScoreDialogProps) {
  const { t } = useTranslation();

  const modules = [
    {
      id: "listening",
      label: "Listening",
      icon: Headphones,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "reading",
      label: "Reading",
      icon: BookOpen,
      color: "bg-green-100 text-green-600",
    },
    {
      id: "writing",
      label: "Writing",
      icon: PenTool,
      color: "bg-amber-100 text-amber-600",
    },
    {
      id: "speaking",
      label: "Speaking",
      icon: Mic,
      color: "bg-rose-100 text-rose-600",
    },
  ] as const;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-3xl p-0 overflow-hidden border-0">
        <div className="bg-amber-500 p-4 text-center">
          <DialogTitle className="text-white font-bold text-lg">
            View Score
          </DialogTitle>
        </div>

        <div className="p-6 grid grid-cols-2 gap-4">
          {modules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => {
                onSelectModule(mod.id);
                onClose();
              }}
              className="flex flex-col items-center justify-center p-4 bg-gray-50 border-2 border-transparent hover:border-amber-200 hover:bg-amber-50 rounded-2xl transition-all active:scale-95 gap-3"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${mod.color}`}
              >
                <mod.icon className="w-6 h-6" />
              </div>
              <span className="font-bold text-gray-700 text-sm">
                {mod.label}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
