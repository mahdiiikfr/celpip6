import React from "react";
import { Share2, Users, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { useTranslation } from "react-i18next";

interface InviteFriendDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteFriendDialog({
  isOpen,
  onClose,
}: InviteFriendDialogProps) {
  const { t } = useTranslation();

  const handleInvite = async () => {
    const shareData = {
      title: "Zaban Fly",
      text: "Join me on Zaban Fly to master languages!",
      url: "https://zabanfly.ir", // Placeholder URL
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error(err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareData.url);
      // Toast handled by parent or just auto-close
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-3xl p-0 overflow-hidden border-0 bg-transparent shadow-none">
        <DialogTitle className="sr-only">
          {t("dialogs.invite.title", { defaultValue: "Invite Friends" })}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {t("dialogs.invite.desc", {
            defaultValue: "Invite friends to earn points.",
          })}
        </DialogDescription>

        <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="bg-blue-500 p-4 relative flex items-center justify-center">
            <button
              onClick={onClose}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <span className="text-lg font-bold text-white">
              {t("dialogs.invite.header", { defaultValue: "Invite Friend" })}
            </span>
          </div>

          <div className="p-6 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <Users className="w-8 h-8 text-blue-600" />
            </div>

            <p className="text-center text-gray-700 dark:text-gray-300 font-medium leading-relaxed px-2">
              {t("dialogs.invite.message", {
                defaultValue:
                  "You need more points to unlock this test. Invite your friends to Zaban Fly and earn free points!",
              })}
            </p>

            <button
              onClick={handleInvite}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold shadow-md shadow-amber-200 transition-colors flex items-center justify-center gap-2 mt-2"
            >
              <Share2 className="w-5 h-5" />
              {t("dialogs.invite.button", { defaultValue: "Invite Now" })}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
