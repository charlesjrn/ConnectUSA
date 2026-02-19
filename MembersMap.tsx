import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapView } from "@/components/Map";
import { trpc } from "@/lib/trpc";
import { Loader2, MapPin, List } from "lucide-react";
import { useLocation } from "wouter";

export function MembersMap() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { data: members, isLoading } = (trpc.members as any).getWithLocations.useQuery();

  const handleMapReady = (map: google.maps.Map) => {
    if (!members || members.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    const infoWindow = new google.maps.InfoWindow();

    members.forEach((member: any) => {
      if (!member.latitude || !member.longitude) return;

      const lat = parseFloat(member.latitude);
      const lng = parseFloat(member.longitude);
      const position = { lat, lng };

      // Create marker
      const marker = new google.maps.Marker({
        position,
        map,
        title: member.name || "Member",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#D4AF37",
          fillOpacity: 0.9,
          strokeColor: "#B8860B",
          strokeWeight: 2,
        },
      });

      // Add click listener for info window
      marker.addListener("click", () => {
        const content = `
          <div style="padding: 10px; max-width: 250px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              ${
                member.profilePicture
                  ? `<img src="${member.profilePicture}" alt="${member.name}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" />`
                  : `<div style="width: 40px; height: 40px; border-radius: 50%; background: #D4AF37; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${
                      member.name?.[0] || "?"
                    }</div>`
              }
              <div>
                <div style="font-weight: 600; font-size: 14px;">${member.name || "Anonymous"}</div>
                <div style="font-size: 12px; color: #666;">${member.location || "Unknown location"}</div>
              </div>
            </div>
            ${member.bio ? `<div style="font-size: 13px; color: #444; margin-top: 8px;">${member.bio}</div>` : ""}
          </div>
        `;
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
      });

      bounds.extend(position);
    });

    // Fit map to show all markers
    if (members.length > 0) {
      map.fitBounds(bounds);
      // Prevent too much zoom on single marker
      const listener = google.maps.event.addListener(map, "idle", () => {
        if (map.getZoom()! > 12) map.setZoom(12);
        google.maps.event.removeListener(listener);
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <main className="container py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">Member Map</h1>
            <p className="text-muted-foreground">
              Discover believers in your area and around the world
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setLocation("/members")}
            className="flex items-center gap-2"
          >
            <List className="w-4 h-4" />
            List View
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !members || members.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                No members have set their location yet
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Set your location in your profile to appear on the map
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {members.length} {members.length === 1 ? "Member" : "Members"} with Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] rounded-lg overflow-hidden border">
                <MapView
                  onMapReady={handleMapReady}
                  className="w-full h-full"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Click on markers to view member information
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
