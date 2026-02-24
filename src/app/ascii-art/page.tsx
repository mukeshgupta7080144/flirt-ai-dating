"use client";

import { useState, useMemo } from 'react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Copy } from 'lucide-react';
import asciiArtData from '@/lib/ascii-art.json';
import { cn } from '@/lib/utils';

// Dynamically get unique categories from the JSON data
const allCategories = [...new Set(asciiArtData.map(a => a.category))];

export default function AsciiArtGeneratorPage() {
    const { toast } = useToast();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(allCategories[0] || null);

    // Filter arts based on the selected category
    const selectedArts = useMemo(() => {
        if (!selectedCategory) {
            return [];
        }
        return asciiArtData.filter(a => a.category === selectedCategory);
    }, [selectedCategory]);
    
    const handleCopy = (artToCopy: string) => {
        navigator.clipboard.writeText(artToCopy);
        toast({ title: 'Copied to clipboard!' });
    };

    return (
        <div className="flex flex-1 flex-col bg-gradient-to-b from-gray-50 to-gray-100">
            <PageHeader title="ASCII Art" />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                <Card className="w-full max-w-5xl mx-auto shadow-lg rounded-2xl bg-white/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Select a Vibe</h2>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                            {allCategories.map((cat) => (
                                <Button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    variant={selectedCategory === cat ? "default" : "outline"}
                                    size="sm"
                                    className={cn(
                                        "transition-all",
                                        selectedCategory === cat && "bg-primary text-primary-foreground"
                                    )}
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>
                        
                        {selectedArts.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {selectedArts.map((item, index) => (
                                    <div key={index} className="relative group bg-gray-900 text-white rounded-lg font-mono text-sm overflow-hidden flex items-center justify-center aspect-square p-2">
                                        <pre className="text-center whitespace-pre-wrap text-[10px] leading-tight tracking-tighter">{item.art}</pre>
                                        <Button 
                                            onClick={() => handleCopy(item.art)} 
                                            variant="ghost" 
                                            size="icon" 
                                            className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 hover:bg-black/60"
                                            aria-label="Copy art"
                                        >
                                            <Copy className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="relative w-full p-4 bg-gray-900 text-white rounded-lg font-mono text-sm min-h-[250px] flex items-center justify-center">
                                <p className="font-sans text-center">
                                  {selectedCategory ? `No art found for "${selectedCategory}".` : 'Select a category to see the art.'}
                                </p>
                            </div>
                        )}

                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
