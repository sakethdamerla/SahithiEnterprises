import { Link } from 'react-router-dom';

export function OfferCard({ offer }) {
    const {
        title,
        description,
        imageUrl,
        titleColor = '#ffffff',
        descriptionColor = '#ffffff',
        position = 'left',
        link
    } = offer;

    const contentAlignment = {
        left: 'items-start text-left',
        center: 'items-center text-center',
        right: 'items-end text-right'
    };

    const CardContent = (
        <div className="relative w-full h-40 md:h-48 rounded-2xl overflow-hidden group shadow-md hover:shadow-xl transition-all duration-300">
            {/* Background Image */}
            <img
                src={imageUrl}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Dark Dimmer Overlay */}
            <div className={`absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors`} />

            {/* Content */}
            <div className={`relative z-10 h-full p-4 md:p-6 flex flex-col justify-center ${contentAlignment[position] || contentAlignment.left}`}>
                <h3
                    className="text-xl md:text-3xl font-bold mb-1 md:mb-2 drop-shadow-md"
                    style={{ color: titleColor }}
                >
                    {title}
                </h3>
                {description && (
                    <p
                        className="text-sm md:text-lg font-medium max-w-md drop-shadow-sm line-clamp-2 md:line-clamp-none"
                        style={{ color: descriptionColor }}
                    >
                        {description}
                    </p>
                )}
            </div>
        </div>
    );

    if (link) {
        return (
            <Link to={link} className="block w-full">
                {CardContent}
            </Link>
        );
    }

    return CardContent;
}
