export function Skeleton({ className, ...props }) {
    return (
        <div
            className={`animate-pulse rounded-md bg-gray-200/80 ${className}`}
            {...props}
        />
    );
}

export function ProductCardSkeleton() {
    return (
        <div className="card overflow-hidden flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-100">
            {/* Image Skeleton */}
            <div className="relative h-32 md:h-48 bg-gray-100 animate-pulse">
                <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="p-2 md:p-4 flex flex-col flex-grow space-y-3">
                {/* Title */}
                <Skeleton className="h-4 md:h-6 w-3/4" />

                {/* Rating */}
                <div className="flex gap-1">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                </div>

                {/* Description */}
                <div className="space-y-1 pt-1">
                    <Skeleton className="h-2 md:h-3 w-full" />
                    <Skeleton className="h-2 md:h-3 w-5/6" />
                </div>

                {/* Price and Button */}
                <div className="flex justify-between items-center pt-2 mt-auto">
                    <Skeleton className="h-5 md:h-7 w-20" />
                    <Skeleton className="h-8 md:h-10 w-24 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

export function CategoryCardSkeleton() {
    return (
        <div className="card p-6 h-full flex flex-col items-center justify-center space-y-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <Skeleton className="w-12 h-12 md:w-20 md:h-20 rounded-full" />
            <Skeleton className="h-4 md:h-6 w-1/2" />
            <Skeleton className="h-3 md:h-4 w-3/4" />
            <Skeleton className="h-5 md:h-6 w-16 rounded-full" />
            <Skeleton className="h-8 md:h-10 w-full mt-2 rounded-lg" />
        </div>
    );
}
