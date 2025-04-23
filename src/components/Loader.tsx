import { cn } from "../lib/utils";

export interface ISVGProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
    className?: string;
}

export const LoadingSpinner = ({
    size = 100,
    className,
    ...props
}: ISVGProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            {...props}
            viewBox="0 0 50 50"
            className={cn("animate-spin", className)}
        >
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#C6DBFF" stopOpacity="1" />
                    <stop offset="50%" stopColor="#4A8FFF" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#226CFF" />
                </linearGradient>
            </defs>
            <circle
                cx="25"
                cy="25"
                r="20"
                stroke="url(#gradient)"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="90 10"
                strokeDashoffset="0"
            />
        </svg>
    );
};
