import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Users, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminEvents() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    duration: '',
    price: '',
    capacity: '',
    eventType: 'online' as 'online' | 'in-person' | 'prayer',
    imageUrl: '',
    meetingLink: '',
  });

  const { data: events, isLoading, refetch } = trpc.paidEvents.getActive.useQuery();
  
  const createEvent = trpc.paidEvents.create.useMutation({
    onSuccess: () => {
      toast.success('Event created successfully!');
      setDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateEvent = trpc.paidEvents.update.useMutation({
    onSuccess: () => {
      toast.success('Event updated successfully!');
      setDialogOpen(false);
      setEditingEvent(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      eventDate: '',
      duration: '',
      price: '',
      capacity: '',
      eventType: 'online' as 'online' | 'in-person' | 'prayer',
      imageUrl: '',
      meetingLink: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData = {
      title: formData.title,
      description: formData.description,
      eventDate: new Date(formData.eventDate),
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      price: parseFloat(formData.price),
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      eventType: formData.eventType,
      imageUrl: formData.imageUrl || undefined,
      meetingLink: formData.meetingLink || undefined,
    };

    if (editingEvent) {
      updateEvent.mutate({
        eventId: editingEvent.id,
        ...eventData,
      });
    } else {
      createEvent.mutate(eventData);
    }
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      eventDate: format(new Date(event.eventDate), 'yyyy-MM-dd\'T\'HH:mm'),
      duration: event.duration?.toString() || '',
      price: event.price,
      capacity: event.capacity?.toString() || '',
      eventType: event.eventType,
      imageUrl: event.imageUrl || '',
      meetingLink: event.meetingLink || '',
    });
    setDialogOpen(true);
  };

  const handleToggleActive = (eventId: number, isActive: boolean) => {
    updateEvent.mutate({
      eventId,
      isActive: !isActive,
    });
  };

  if (isLoading) {
    return (
      <div className="container max-w-6xl py-12">
        <div className="text-center">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Events</h1>
          <p className="text-muted-foreground">Create and manage paid spiritual events</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingEvent(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
              <DialogDescription>
                {editingEvent ? 'Update event details' : 'Fill in the details for your new paid event'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventType">Event Type *</Label>
                  <Select
                    value={formData.eventType}
                    onValueChange={(value: any) => setFormData({ ...formData, eventType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="in-person">In-Person</SelectItem>
                      <SelectItem value="prayer">Prayer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="eventDate">Event Date & Time *</Label>
                  <Input
                    id="eventDate"
                    type="datetime-local"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="0"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="0"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="meetingLink">Meeting Link (Zoom, etc.)</Label>
                <Input
                  id="meetingLink"
                  type="url"
                  placeholder="https://zoom.us/j/..."
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createEvent.isPending || updateEvent.isPending}>
                  {createEvent.isPending || updateEvent.isPending ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!events || events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Events Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first paid event to start generating revenue
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {events.map((event: { id: number; title: string; description: string | null; eventType: string; eventDate: Date; price: string; capacity: number | null; imageUrl: string | null; meetingLink: string | null; isActive: boolean }) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle>{event.title}</CardTitle>
                      <Badge variant={event.isActive ? 'default' : 'secondary'}>
                        {event.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{event.eventType}</Badge>
                    </div>
                    <CardDescription>{event.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Switch
                      checked={event.isActive}
                      onCheckedChange={() => handleToggleActive(event.id, event.isActive)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(event.eventDate), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>${parseFloat(event.price).toFixed(2)}</span>
                  </div>
                  {event.capacity && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Capacity: {event.capacity}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
