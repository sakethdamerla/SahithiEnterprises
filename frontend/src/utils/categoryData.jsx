export const categoryData = {
    electronics: {
        title: 'Electronics',
        description: 'Smart home appliances and climate comfort tech',
        icon: '🏠',
    },
    tyres: {
        title: 'Tyres',
        description: 'Performance and all-season tyres for every vehicle type',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4" />
                <path d="M12 18v4" />
                <path d="M2 12h4" />
                <path d="M18 12h4" />
                <path d="m4.9 4.9 2.9 2.9" />
                <path d="m16.2 16.2 2.9 2.9" />
                <path d="m4.9 19.1 2.9-2.9" />
                <path d="m16.2 7.8 2.9-2.9" />
            </svg>
        ),
    },
    power: {
        title: 'Inverters & Batteries',
        // Description removed as per user preference
        icon: '🔋',
    },
};

export const getCategoryInfo = (slug) => {
    return categoryData[slug] || {
        title: slug.charAt(0).toUpperCase() + slug.slice(1),
        description: `Browse our ${slug} collection`,
        icon: '📦',
    };
};
