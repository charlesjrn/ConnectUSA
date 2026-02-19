import { useState } from 'react';
import { Video, Plus, Users, X } from 'lucide-react';
import { trpc } from '../lib/trpc';
import { useAuth } from '../_core/hooks/useAuth';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

export default function VideoChat() {
  const { user } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState<number | undefined>(undefined);

  const { data: activeRooms = [], refetch } = trpc.videoRoom.getActive.useQuery(undefined, {
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const createRoomMutation = trpc.videoRoom.create.useMutation({
    onSuccess: (data: { success: boolean; roomUrl: string }) => {
      toast.success('Video room created successfully!');
      setShowCreateDialog(false);
      setRoomName('');
      setDescription('');
      setMaxParticipants(undefined);
      refetch();
      // Open the room in a new window
      window.open(data.roomUrl, '_blank');
    },
    onError: () => {
      toast.error('Failed to create video room');
    },
  });

  const endRoomMutation = trpc.videoRoom.end.useMutation({
    onSuccess: () => {
      toast.success('Video room ended');
      refetch();
    },
    onError: () => {
      toast.error('Failed to end video room');
    },
  });

  const handleCreateRoom = () => {
    if (!roomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }
    createRoomMutation.mutate({
      roomName: roomName.trim(),
      description: description.trim() || undefined,
      maxParticipants: maxParticipants || undefined,
    });
  };

  const handleJoinRoom = (roomUrl: string) => {
    window.open(roomUrl, '_blank');
  };

  const handleEndRoom = (roomId: number) => {
    if (confirm('Are you sure you want to end this video room?')) {
      endRoomMutation.mutate({ id: roomId });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3E8]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#D4AF37] mb-2">Video Fellowship</h1>
            <p className="text-gray-600">Connect face-to-face with fellow believers</p>
          </div>
          {user && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Video Room</DialogTitle>
                  <DialogDescription>
                    Start a video fellowship session with your community
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="roomName">Room Name *</Label>
                    <Input
                      id="roomName"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="Sunday Fellowship"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the purpose of this video session..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxParticipants">Max Participants (Optional)</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={maxParticipants || ''}
                      onChange={(e) => setMaxParticipants(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Leave empty for unlimited"
                      min={2}
                      max={100}
                    />
                  </div>
                  <Button
                    onClick={handleCreateRoom}
                    disabled={createRoomMutation.isPending}
                    className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white"
                  >
                    {createRoomMutation.isPending ? 'Creating...' : 'Create & Join Room'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <p className="text-center text-gray-700">
              <a href="/login" className="text-[#D4AF37] hover:underline font-semibold">
                Sign in
              </a>{' '}
              to create video rooms and join fellowship sessions
            </p>
          </div>
        )}

        {activeRooms.length === 0 ? (
          <div className="text-center py-16">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Video Rooms</h3>
            <p className="text-gray-600 mb-6">
              {user
                ? 'Be the first to start a video fellowship session!'
                : 'Sign in to create and join video rooms'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeRooms.map((room: any) => (
              <div key={room.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-[#D4AF37]" />
                    <h3 className="font-semibold text-lg text-gray-800">{room.roomName}</h3>
                  </div>
                  {user && user.id === room.hostId && (
                    <button
                      onClick={() => handleEndRoom(room.id)}
                      className="text-red-500 hover:text-red-700"
                      title="End room"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {room.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{room.description}</p>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Users className="w-4 h-4" />
                  <span>Hosted by {room.hostName}</span>
                </div>

                {room.maxParticipants && (
                  <div className="text-sm text-gray-500 mb-4">
                    Max participants: {room.maxParticipants}
                  </div>
                )}

                <div className="text-xs text-gray-400 mb-4">
                  Started {new Date(room.createdAt).toLocaleString()}
                </div>

                <Button
                  onClick={() => handleJoinRoom(room.roomUrl)}
                  className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white"
                >
                  Join Room
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-3">About Video Fellowship</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Connect face-to-face with believers around the world</li>
            <li>• Share prayers, testimonies, and encouragement in real-time</li>
            <li>• Features include video, audio, screen sharing, and chat</li>
            <li>• No downloads required - works directly in your browser</li>
            <li>• Free and secure video conferencing powered by Jitsi Meet</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
