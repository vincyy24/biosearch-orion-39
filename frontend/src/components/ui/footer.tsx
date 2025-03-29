export default function Footer () {
    return <footer className="py-[1.65rem] px-4 bg-background border-t">
        <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} BiomediResearch Platform. All rights reserved.
                    </p>
                </div>
                <div className="flex gap-8">
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                        Privacy Policy
                    </a>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                        Terms of Service
                    </a>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                        Contact
                    </a>
                </div>
            </div>
        </div>
    </footer>
}