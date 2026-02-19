import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { MapView } from "./Map";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function LocationAutocomplete({
  value,
  onChange,
  disabled = false,
  placeholder = "Enter your location",
  className = "",
}: LocationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapReady || !inputRef.current || disabled) {
      return;
    }

    // Initialize autocomplete
    const ac = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["(cities)"],
      fields: ["formatted_address", "geometry"],
    });

    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (place.formatted_address) {
        onChange(place.formatted_address);
      }
    });

    setAutocomplete(ac);

    return () => {
      if (ac) {
        google.maps.event.clearInstanceListeners(ac);
      }
    };
  }, [mapReady, disabled, onChange]);

  return (
    <>
      {/* Hidden map to initialize Google Maps API */}
      <div style={{ display: "none" }}>
        <MapView
          onMapReady={() => setMapReady(true)}
        />
      </div>
      
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={className}
      />
    </>
  );
}
