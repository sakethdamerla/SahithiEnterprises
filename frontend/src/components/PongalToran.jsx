
export const PongalToran = () => {
    return (
        <div className="w-full absolute top-0 left-0 overflow-hidden pointer-events-none z-50 h-24">
            <svg
                viewBox="0 0 800 120"
                preserveAspectRatio="none"
                className="w-full h-full drop-shadow-md"
            >
                {/* String */}
                <path
                    d="M0,10 Q200,40 400,10 T800,10"
                    fill="none"
                    stroke="#C2B280"
                    strokeWidth="3"
                />

                {/* Leaves and Flowers Pattern */}
                {/* We'll repeat this group across the string */}
                {[50, 150, 250, 350, 450, 550, 650, 750].map((x, i) => (
                    <g key={i} transform={`translate(${x}, 20)`}>
                        {/* Mango Leaf */}
                        <path
                            d="M0,0 Q-15,40 0,80 Q15,40 0,0"
                            fill="#228B22" // Forest Green
                            stroke="#1a6b1a"
                            strokeWidth="1"
                        />
                        {/* Veins */}
                        <path d="M0,0 L0,80" stroke="#1a6b1a" strokeWidth="0.5" opacity="0.6" />

                        {/* Marigold Flower (Top of leaf) */}
                        <g transform="translate(0, 5)">
                            <circle r="12" fill="#FF8C00" /> {/* Dark Orange */}
                            <circle r="8" fill="#FFD700" />  {/* Gold */}
                            <circle r="4" fill="#FFA500" />  {/* Orange */}
                        </g>
                    </g>
                ))}
            </svg>
        </div>
    );
};
