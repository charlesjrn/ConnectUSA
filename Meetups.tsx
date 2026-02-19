import { useAuth } from "@/_core/hooks/useAuth";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Calendar, MapPin, Plus, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Meetups() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventType, setEventType] = useState<"online" | "in-person" | "prayer">("online");
  const [location, setLocationField] = useState("");

  const { data: events = [], refetch } = trpc.events.list.useQuery(undefined, {
    refetchInterval: 5000,
  });
  
  const createEvent = trpc.events.create.useMutation({
    onSuccess: () => {
      toast.success("Event created successfully!");
      setDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to create event: " + error.message);
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEventDate("");
    setEventTime("");
    setEventType("online");
    setLocationField("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !eventDate || !eventTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    const dateTime = new Date(`${eventDate}T${eventTime}`);
    
    createEvent.mutate({
      title,
      description: description || undefined,
      eventDate: dateTime,
      eventType,
      location: location || undefined,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3E8]">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "online":
        return "bg-blue-100 text-blue-800";
      case "in-person":
        return "bg-green-100 text-green-800";
      case "prayer":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "online":
        return "Online Meeting";
      case "in-person":
        return "In-Person";
      case "prayer":
        return "Prayer";
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3E8]">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif text-gray-900 mb-2">Meetups</h1>
            <p className="text-gray-600">
              Organize and join online meetings, in-person gatherings, and prayer sessions.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-600 hover:bg-yellow-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Sunday Prayer Meeting"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Share details about the event..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventDate">Date *</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventTime">Time *</Label>
                    <Input
                      id="eventTime"
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="eventType">Event Type *</Label>
                  <Select value={eventType} onValueChange={(value: any) => setEventType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online Meeting</SelectItem>
                      <SelectItem value="in-person">In-Person</SelectItem>
                      <SelectItem value="prayer">Prayer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location / Link</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocationField(e.target.value)}
                    placeholder="Zoom link or physical address"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                  disabled={createEvent.isPending}
                >
                  {createEvent.isPending ? "Creating..." : "Create Event"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No upcoming events</p>
              <p className="text-sm text-gray-500">Create the first event to get started!</p>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getEventTypeColor(
                          event.eventType
                        )}`}
                      >
                        {getEventTypeLabel(event.eventType)}
                      </span>
                    </div>
                    <h3 className="text-xl font-serif text-yellow-700 mb-2">{event.title}</h3>
                    {event.description && (
                      <p className="text-gray-700 mb-3">{event.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(event.eventDate), "MMMM d, yyyy 'at' h:mm a")}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1">
                      {event.eventType === "online" ? (
                        <Video className="w-4 h-4" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                      <span className="truncate max-w-xs">{event.location}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Organized by {event.userName || "Anonymous"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
