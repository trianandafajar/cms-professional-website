import Image from "next/image";

export default function AdminGraphicsLogo() {
    return (
        <div className="flex items-center gap-2" style={{ fontFamily: 'var(--font-inter)' }}>
            <Image className="h-10 w-10" src="/icon.png" width={40} height={40} alt="Logo" />
            <span className="text-2xl font-bold text-blue-600">eventbro</span>
        </div>
    );
}