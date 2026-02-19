import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { trpc } from "@/lib/trpc";
import { MapPin, Loader2, Users } from "lucide-react";
import { useLocation } from "wouter";

export function NearbyMembers() {
  const [, setLocation] = useLocation();
  const { data: nearbyMembers, isLoading } = trpc.members.getNearby.useQuery({
    maxDistance: 50,
    limit: 5,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Members Near You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!nearbyMembers || nearbyMembers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Members Near You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No members found within 50 miles
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Set your location in your profile to find nearby believers
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Members Near You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {nearbyMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => setLocation(`/user/${member.id}`)}
            >
              {member.profilePicture ? (
                <img
                  src={member.profilePicture}
                  alt={member.name || "Member"}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {member.name?.[0] || "?"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">
                  {member.name || "Anonymous"}
                </h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {member.distance} miles away
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
