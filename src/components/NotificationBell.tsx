import { useEffect, useState } from "react";
import { account, databases, DATABASE_ID, COLLECTIONS, Query } from "@/integrations/appwrite/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Check,
  CheckCheck,
  GraduationCap,
  Shield,
  Megaphone,
  Clock,
  ChevronRight
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Announcement {
  $id: string;
  title: string;
  content: string;
  is_global: boolean;
  $createdAt: string;
  is_read?: boolean;
}

export function NotificationBell() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const init = async () => {
      try {
        const user = await account.get();
        if (user) {
          setUserId(user.$id);
          fetchAnnouncements();
        }
      } catch (error) {
        // Not logged in
      }
    };
    init();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.announcements,
        [
          Query.equal('is_global', true),
          Query.orderDesc('$createdAt'),
          Query.limit(50)
        ]
      );

      const withReadStatus = (response.documents || []).map((a: any) => ({
        ...a,
        is_read: readIds.has(a.$id)
      }));
      setAnnouncements(withReadStatus);
      setUnreadCount(withReadStatus.filter((a: any) => !a.is_read).length);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  const markAsRead = async (announcementId: string) => {
    setReadIds(prev => new Set([...prev, announcementId]));
    setAnnouncements(prev => prev.map(a => a.$id === announcementId ? { ...a, is_read: true } : a));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    const allIds = new Set(announcements.map(a => a.$id));
    setReadIds(allIds);
    setAnnouncements(prev => prev.map(a => ({ ...a, is_read: true })));
    setUnreadCount(0);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getCategoryIcon = () => Megaphone;
  const getCategoryColor = () => ({ bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Bell className="h-5 w-5 text-gray-600" strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 flex items-center justify-center px-1 text-[10px] font-bold bg-red-500 text-white rounded-full shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0 shadow-xl rounded-2xl border-0" align="end" sideOffset={8}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <Badge className="bg-red-100 text-red-600 hover:bg-red-100 px-2 py-0.5 text-xs font-medium">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs h-8 text-[#0A400C] hover:text-[#0A400C] hover:bg-[#0A400C]/10 font-medium"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[340px]">
          {announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-gray-300" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">No notifications</p>
              <p className="text-xs text-gray-500 text-center">You're all caught up!</p>
            </div>
          ) : (
            <div className="py-2">
              {announcements.map((announcement) => {
                const Icon = getCategoryIcon();
                const colors = getCategoryColor();

                return (
                  <div
                    key={announcement.$id}
                    className={`group px-4 py-3 mx-2 my-1 rounded-xl cursor-pointer transition-all hover:bg-gray-50 ${!announcement.is_read ? "bg-[#0A400C]/5" : ""
                      }`}
                    onClick={() => !announcement.is_read && markAsRead(announcement.$id)}
                  >
                    <div className="flex gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${colors.text}`} strokeWidth={1.5} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              {!announcement.is_read && (
                                <span className="w-2 h-2 rounded-full bg-[#0A400C] animate-pulse" />
                              )}
                            </div>
                            <p className={`text-sm font-medium line-clamp-1 ${!announcement.is_read ? "text-gray-900" : "text-gray-700"
                              }`}>
                              {announcement.title}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                              {announcement.content}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-400 flex-shrink-0 mt-1 transition-colors" />
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-[11px] text-gray-400">{formatDate(announcement.$createdAt)}</span>
                          {announcement.is_read && (
                            <>
                              <span className="text-gray-300">•</span>
                              <div className="flex items-center gap-1 text-[11px] text-gray-400">
                                <Check className="h-3 w-3" />
                                Read
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
