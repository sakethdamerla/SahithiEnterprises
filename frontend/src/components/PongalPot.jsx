
export const PongalPot = () => {
    return (
        <div className="w-20 h-30 pointer-events-none z-50 ">
            <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Defs for gradients */}
                <defs>
                    <linearGradient id="potGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8B4513" />
                        <stop offset="50%" stopColor="#cd853f" />
                        <stop offset="100%" stopColor="#8B4513" />
                    </linearGradient>
                    <linearGradient id="caneGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4a0e4a" /> {/* Deep Purple */}
                        <stop offset="50%" stopColor="#800080" />
                        <stop offset="100%" stopColor="#4a0e4a" />
                    </linearGradient>
                </defs>

                {/* Sugarcane Left */}
                <g transform="translate(20, 20) rotate(-10)">
                    <rect x="0" y="0" width="12" height="140" fill="url(#caneGradient)" rx="2" />
                    {/* Cane segments */}
                    <rect x="0" y="30" width="12" height="4" fill="#a052a0" />
                    <rect x="0" y="70" width="12" height="4" fill="#a052a0" />
                    <rect x="0" y="110" width="12" height="4" fill="#a052a0" />
                    {/* Top Leaves */}
                    <path d="M6,0 Q-20,-30 6,-60 Q30,-30 6,0" fill="#228B22" />
                    <path d="M6,0 Q-10,-40 -20,-50" stroke="#228B22" strokeWidth="3" fill="none" />
                </g>

                {/* Sugarcane Right */}
                <g transform="translate(160, 20) rotate(10)">
                    <rect x="0" y="0" width="12" height="140" fill="url(#caneGradient)" rx="2" />
                    <rect x="0" y="30" width="12" height="4" fill="#a052a0" />
                    <rect x="0" y="70" width="12" height="4" fill="#a052a0" />
                    <rect x="0" y="110" width="12" height="4" fill="#a052a0" />
                    <path d="M6,0 Q-20,-30 6,-60 Q30,-30 6,0" fill="#228B22" />
                    <path d="M6,0 Q20,-40 30,-50" stroke="#228B22" strokeWidth="3" fill="none" />
                </g>

                {/* Mud Pot */}
                <g transform="translate(50, 80)">
                    {/* Pot Body */}
                    <path
                        d="M10,40 Q-10,80 50,110 Q110,80 90,40 Q90,30 80,20 L20,20 Q10,30 10,40"
                        fill="url(#potGradient)"
                    />
                    {/* Pot Neck Decor */}
                    <path d="M20,25 L80,25" stroke="#FFD700" strokeWidth="4" strokeDasharray="4 2" />
                    <circle cx="50" cy="65" r="15" fill="none" stroke="#FFD700" strokeWidth="2" />
                    <circle cx="50" cy="65" r="5" fill="#FF0000" />

                    {/* Overflowing Rice/Milk */}
                    <path
                        d="M20,20 Q50,0 80,20 Q85,25 80,30 Q50,45 20,30 Q15,25 20,20"
                        fill="#FFFFFF"
                    />
                    {/* Drip */}
                    <path d="M75,25 Q85,40 82,50 Q78,40 75,25" fill="#FFFFFF" />
                </g>
            </svg>
        </div>
    );
};
