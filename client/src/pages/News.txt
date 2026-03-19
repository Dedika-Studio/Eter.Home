import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Simulación de datos de noticias (puedes conectarlo a tu API de tRPC después)
const initialNews = [
    {
        id: 1,
        title: "BTS anuncia nuevo proyecto especial para 2026",
        content: "Los miembros de BTS han sorprendido a ARMY con el anuncio de un nuevo proyecto colaborativo que se lanzará en los próximos meses. Los detalles completos se revelarán en una conferencia de prensa especial.",
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop",
        sourceUrl: "https://www.bighitmusic.com",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
        id: 2,
        title: "Jin regresa de su servicio militar",
        content: "Jin, el miembro más antiguo de BTS, ha completado exitosamente su servicio militar obligatorio. ARMY de todo el mundo celebra su regreso con un trending topic en redes sociales.",
        imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=300&fit=crop",
        sourceUrl: "https://www.dispatch.co.kr",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
        id: 3,
        title: "Jungkook lanza nueva canción en solitario",
        content: "Jungkook sorprende a los fans con el lanzamiento de una nueva canción en solitario que combina elementos de pop y R&B. La canción ya ha alcanzado el número 1 en múltiples plataformas de streaming.",
        imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=300&fit=crop",
        sourceUrl: "https://www.spotify.com",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    }
];

export function NewsPage() {
    const [news] = useState(initialNews);
    const [timeLeft, setTimeLeft] = useState<Record<number, string>>({});

    // Filtrar noticias vigentes
    const activeNews = news.filter(item => new Date() < new Date(item.expiresAt));

    // Calcular tiempo restante para cada noticia
    useEffect(() => {
        const updateTimers = () => {
            const newTimeLeft: Record<number, string> = {};
            activeNews.forEach(item => {
                const now = new Date();
                const expiry = new Date(item.expiresAt);
                const diff = expiry.getTime() - now.getTime();
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                newTimeLeft[item.id] = `${days}d ${hours}h`;
            });
            setTimeLeft(newTimeLeft);
        };

        updateTimers();
        const interval = setInterval(updateTimers, 60000); // Actualizar cada minuto
        return () => clearInterval(interval);
    }, [activeNews]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 p-4">
            {/* Header */}
            <div className="max-w-2xl mx-auto mb-8">
                <div className="text-center mb-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">
                        Últimas Noticias BTS
                    </h1>
                    <p className="text-purple-300 text-sm">Noticias frescas cada 5 días</p>
                </div>
                <div className="flex justify-center gap-2 mb-4">
                    <Badge className="bg-purple-600 hover:bg-purple-700 text-white border-none">
                        {activeNews.length} noticias activas
                    </Badge>
                </div>
            </div>

            {/* News Feed */}
            <div className="max-w-2xl mx-auto space-y-6">
                {activeNews.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">No hay noticias disponibles en este momento.</p>
                        <p className="text-gray-500 text-sm mt-2">¡Vuelve pronto para más actualizaciones de BTS!</p>
                    </div>
                ) : (
                    activeNews.map((item, index) => (
                        <Card 
                            key={item.id} 
                            className={`relative overflow-hidden transition-all duration-300 border-none ${
                                index === 0 
                                    ? "ring-2 ring-purple-500 shadow-2xl shadow-purple-500/30" 
                                    : "opacity-90 hover:opacity-100"
                            } bg-gray-800/80 backdrop-blur-sm`}
                        >
                            {/* Badge de NUEVO */}
                            {index === 0 && (
                                <Badge className="absolute top-0 left-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-none rounded-br-lg text-xs font-bold z-10 border-none">
                                    ¡NUEVO!
                                </Badge>
                            )}

                            {/* Imagen */}
                            {item.imageUrl && (
                                <div className="relative h-48 overflow-hidden bg-gray-700">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                    {/* Overlay con tiempo restante */}
                                    <div className="absolute bottom-0 right-0 bg-black/70 px-3 py-1 text-[10px] text-purple-300 font-semibold uppercase tracking-wider">
                                        Expira en: {timeLeft[item.id] || "Calculando..."}
                                    </div>
                                </div>
                            )}

                            {/* Contenido */}
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xl md:text-2xl font-bold text-white leading-tight">
                                    {item.title}
                                </CardTitle>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                                    📅 {new Date(item.createdAt).toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                                    {item.content}
                                </p>
                                {item.sourceUrl && (
                                    <a
                                        href={item.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors text-xs font-semibold"
                                    >
                                        Leer más en la fuente oficial →
                                    </a>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="max-w-2xl mx-auto mt-12 text-center">
                <p className="text-gray-500 text-[10px] uppercase tracking-widest">
                    Sistema de noticias efímeras • ÉTER K-Pop
                </p>
            </div>
        </div>
    );
}
