const avatars = [
  { id: 1, bg: "bg-crypto-bitcoin" },
  { id: 2, bg: "bg-crypto-ethereum" },
  { id: 3, bg: "bg-crypto-shiba" },
  { id: 4, bg: "bg-crypto-solana" },
  { id: 5, bg: "bg-crypto-tether" },
  { id: 6, bg: "bg-primary" },
];

export const CommunitySection = () => {
  return (
    <div className="bg-gradient-crypto rounded-2xl p-6 text-primary-foreground relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
      
      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-3">Join Our Community</h3>
        <p className="text-primary-foreground/80 text-sm mb-6 leading-relaxed">
          We have best community, always we can
          <br />
          try to good service provide for you.
        </p>
        
        <div className="flex -space-x-2 mb-6">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              className={`w-8 h-8 ${avatar.bg} rounded-full border-2 border-primary-foreground/20`}
            ></div>
          ))}
        </div>
        
        <button className="w-full py-3 bg-background text-foreground rounded-xl font-medium hover:bg-background/90 transition-smooth">
          Join Now
        </button>
      </div>
    </div>
  );
};