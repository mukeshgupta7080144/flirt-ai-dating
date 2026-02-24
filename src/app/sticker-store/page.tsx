"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Download, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { InstagramIcon, WhatsAppIcon } from '@/components/custom-icons';

const stickerPack = {
  name: 'Cute & Quirky Pack',
  stickers: [
    { id: 1, alt: 'A cute panda holding a heart with text "Sirf Tum"', src: 'https://picsum.photos/seed/sticker1/200/200', hint: 'cute panda heart' },
    { id: 2, alt: 'A pink heart with a bandage on it with text "Maan Jao Na"', src: 'https://picsum.photos/seed/sticker2/200/200', hint: 'heart bandage' },
    { id: 3, alt: 'Two coffee cups with steam forming a heart with text "Date?"', src: 'https://picsum.photos/seed/sticker3/200/200', hint: 'coffee love' },
    { id: 4, alt: 'A glowing neon text that says "Pyaari"', src: 'https://picsum.photos/seed/sticker4/200/200', hint: 'neon text' },
    { id: 5, alt: 'A cartoon boy holding his ears to say sorry with text "Meri Galti"', src: 'https://picsum.photos/seed/sticker5/200/200', hint: 'cartoon sorry' },
    { id: 6, alt: 'A sticker with a thumbs up', src: 'https://picsum.photos/seed/sticker6/200/200', hint: 'thumbs up' },
  ],
};

export default function StickerStorePage() {
  const { toast } = useToast();

  const handleActionClick = (action: string) => {
    toast({
      title: `Feature coming soon!`,
      description: `"${action}" integration is under development.`,
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FB]">
      <header className="sticky top-0 z-40 bg-[#1A1A2E] p-4 text-white shadow-md rounded-b-[30px]">
          <div className="flex items-center justify-between">
              <Link href="/" className="p-2 -ml-2">
                  <ChevronLeft className="size-6" />
              </Link>
              <div className="text-center">
                  <h1 className="font-cursive text-3xl tracking-tight text-shadow">Sticker World</h1>
              </div>
              <div className="w-6"></div>
          </div>
      </header>

      <main className="flex-1 space-y-8 p-4 md:p-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-center text-foreground mb-6">{stickerPack.name}</h2>
          
          <div className="grid grid-cols-3 gap-4">
            {stickerPack.stickers.map((sticker) => (
              <div key={sticker.id} className="bg-gray-100 rounded-lg p-2 flex items-center justify-center aspect-square">
                <Image
                  src={sticker.src}
                  alt={sticker.alt}
                  width={150}
                  height={150}
                  data-ai-hint={sticker.hint}
                  className="object-contain drop-shadow-md transition-transform hover:scale-110"
                  style={{ filter: 'drop-shadow(0 0 3px white)' }}
                />
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => handleActionClick('Add to WhatsApp')} className="bg-[#25D366] hover:bg-[#1EBE57] text-white font-bold">
              <WhatsAppIcon className="size-5 mr-2"/>
              Add to WhatsApp
            </Button>
            <Button onClick={() => handleActionClick('Copy for Instagram')} className="text-white font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500">
               <InstagramIcon className="size-5 mr-2 fill-white"/>
               Copy for Instagram
            </Button>
          </div>
        </div>

        <Button onClick={() => handleActionClick('Download Pack')} size="lg" className="w-full text-lg font-bold bg-gradient-to-r from-[#F164AA] to-[#FD9F58] hover:opacity-90 text-white shadow-lg">
          <Download className="mr-2"/>
          Download Pack
        </Button>
      </main>
    </div>
  );
}