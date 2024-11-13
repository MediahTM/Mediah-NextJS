import Navbar from '@/components/ui/navbar'

function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Navbar />
            <div>
                {children}
            </div>
        </div>
    )
}

export default MarketingLayout