export const categoryData = {
    electronics: {
        title: 'Electronics',
        // description: 'Smart home appliances and climate comfort tech',
        icon: '🏠',
        // promotions: [
        //     {
        //         id: 'elec-1',
        //         title: 'Summer Sale',
        //         subtitle: 'Get 10% off on cooling appliances',
        //         image: 'https://placehold.co/600x400/1a1a1a/FFF?text=Electronics+Sale', // REPLACE WITH YOUR IMAGE URL
        //         buttonText: 'Shop Now',
        //         link: '#'
        //     },
        //     {
        //         id: 'elec-2',
        //         title: 'New Arrivals',
        //         subtitle: 'Latest gadgets in store',
        //         image: 'https://placehold.co/600x400/2563eb/FFF?text=New+Arrivals', // REPLACE WITH YOUR IMAGE URL
        //         buttonText: 'View',
        //         link: '#'
        //     }
        // ]
    },
    tyres: {
        title: 'Tyres',
        // description: 'Performance and all-season tyres for every vehicle type',
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
        promotions: [
            {
                id: 'tyre-1',
                title: 'Service Available',
                // subtitle: 'Premium Tyres for wet roads',
                image: 'https://ap.boschcarservice.com/in/media/images/16_9/guides/tyre/job_2709_final_image_640w_360h.webp',
                // buttonText: 'Explore',
                // link: '#'
            }
        ]
    },
    power: {
        title: 'Inverters & Batteries',
        // Description removed as per user preference
        icon: '🔋',
        promotions: [
            {
                id: 'pwr-1',
                title: 'Get a Trolley OFFER',
                // subtitle: 'Never lose power again',
                image: 'https://m.media-amazon.com/images/I/71TubQI3b5L.jpg', // REPLACE WITH YOUR IMAGE URL
                // buttonText: 'Learn More',
                link: '#'
            }
        ]
    },
};

export const getCategoryInfo = (slug) => {
    return categoryData[slug] || {
        title: slug.charAt(0).toUpperCase() + slug.slice(1),
        description: `Browse our ${slug} collection`,
        icon: '📦',
    };
};
