
const Footer = () => {
    return (
        <footer className="w-full py-8 mt-auto text-center text-sm text-muted-foreground/60 border-t border-border/5">
            <p className="flex items-center justify-center gap-2">
                <span>© 가재쌤</span>
                <span className="text-muted-foreground/40">|</span>
                <a
                    href="https://blog.naver.com/gajae_ssam"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-muted-foreground/20 underline-offset-4 hover:text-primary transition-colors"
                >
                    수업 자료 공유
                </a>
            </p>
        </footer>
    );
};

export default Footer;
