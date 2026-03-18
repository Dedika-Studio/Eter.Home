import { useRoute } from "wouter";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import RaffleDetail from "./RaffleDetail";

export default function RaffleByNumber() {
  const [match, params] = useRoute("/rifa:num");
  const [raffleId, setRaffleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Extract raffle number from params (e.g., "1" from /rifa1)
  const raffleNumber = params?.num ? parseInt(params.num.replace(/\D/g, '')) : null;

  // Query to get raffle by number
  const { data: raffle, isLoading } = trpc.raffles.getByNumber.useQuery(
    { raffleNumber: raffleNumber || 0 },
    { enabled: raffleNumber !== null && raffleNumber > 0 }
  );

  useEffect(() => {
    if (raffle) {
      setRaffleId(raffle.id);
      setLoading(false);
    } else if (!isLoading) {
      setLoading(false);
    }
  }, [raffle, isLoading]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-500 flex items-center justify-center">
        <Card className="bg-white/95 backdrop-blur-xl border-border/50 p-8">
          <CardContent className="flex flex-col items-center gap-4">
            <Loader2 className="size-8 animate-spin text-purple-600" />
            <p className="text-muted-foreground">Cargando rifa...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!raffle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-500 flex items-center justify-center">
        <Card className="bg-white/95 backdrop-blur-xl border-border/50 p-8">
          <CardContent className="text-center">
            <p className="text-muted-foreground">Rifa no encontrada</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render RaffleDetail with the raffle ID
  return <RaffleDetail />;
}
