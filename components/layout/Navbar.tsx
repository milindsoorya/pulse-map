"use client";

import Link from "next/link";
// import { useSession, signIn, signOut } from "next-auth/react";
import { Heart, Globe, User } from "lucide-react";

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 pointer-events-none">
            <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
                    <Globe className="w-5 h-5 text-primary" />
                    <span className="font-bold text-lg tracking-tight">CinePulse</span>
                </div>

                <div className="flex items-center gap-4 glass px-6 py-2 rounded-full">
                    <Link href="/" className="hover:text-primary transition-colors">
                        Map
                    </Link>
                    <Link href="/trending" className="hover:text-primary transition-colors">
                        Trending
                    </Link>

                    <div className="w-px h-4 bg-white/20 mx-2" />

                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">Guest Mode</span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
