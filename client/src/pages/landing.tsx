import { useState, useEffect } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export default function Landing() {
  const [animateChart, setAnimateChart] = useState(false);
  const [animateCoin, setAnimateCoin] = useState(false);
  const [animateText, setAnimateText] = useState(false);

  useEffect(() => {
    // Trigger animations in sequence
    setTimeout(() => setAnimateText(true), 300);
    setTimeout(() => setAnimateChart(true), 800);
    setTimeout(() => setAnimateCoin(true), 1200);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 overflow-hidden">
      {/* Header with animated gradient */}
      <header className="p-4 md:p-6 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-2">
            <span className="text-primary-foreground font-bold text-xl">CW</span>
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
            Coin Whisperer
          </h1>
        </div>
        <nav>
          <Link href="/dashboard">
            <a className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Dashboard
            </a>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 md:py-24 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left column: Text content */}
          <div className={cn(
            "transition-all duration-1000 transform",
            animateText ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
          )}>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              <span className="block">Make smarter</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                trading decisions
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-md">
              Harness the power of social sentiment analysis to predict market movements and trade meme coins with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <a className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Get Started
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </Link>
              <a href="#features" className="inline-flex items-center justify-center px-6 py-3 bg-secondary/50 text-foreground rounded-lg font-medium hover:bg-secondary/70 transition-colors">
                Learn More
              </a>
            </div>
          </div>

          {/* Right column: Animation */}
          <div className="relative h-[400px] md:h-[500px]">
            {/* Background bubble effects */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute rounded-full mix-blend-screen filter blur-xl bg-primary/20 animate-pulse`}
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    width: `${150 + Math.random() * 100}px`,
                    height: `${150 + Math.random() * 100}px`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: `${5 + Math.random() * 7}s`,
                  }}
                />
              ))}
            </div>

            {/* Chart animation */}
            <div 
              className={cn(
                "absolute top-[10%] left-[10%] w-[80%] h-[60%] bg-card/90 border border-border rounded-xl shadow-lg p-4 transition-all duration-1000 transform",
                animateChart ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              )}
            >
              <div className="text-sm font-medium mb-4">Sentiment Analysis</div>
              <div className="h-[70%] flex items-end space-x-2">
                {[40, 25, 65, 30, 85, 50, 70, 55, 45, 90, 60, 75].map((height, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-gradient-to-t from-primary/50 to-primary rounded-t-sm transition-all duration-500"
                    style={{ 
                      height: animateChart ? `${height}%` : '0%',
                      transitionDelay: `${i * 0.1}s` 
                    }} 
                  />
                ))}
              </div>
              <div className="h-[15%] mt-2 flex justify-between">
                <div className="text-xs text-muted-foreground">1h</div>
                <div className="text-xs text-muted-foreground">24h</div>
              </div>
            </div>

            {/* Coin animation */}
            <div 
              className={cn(
                "absolute top-[50%] left-[30%] w-[40%] h-[40%] transition-all duration-1000 transform",
                animateCoin ? "opacity-100 translate-y-0" : "opacity-0 translate-y-24"
              )}
            >
              <div className="relative h-full w-full">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-yellow-500 h-28 w-28 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                    <span className="text-white text-2xl font-bold">Ð</span>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center animate-spin-slow">
                  <div className="h-40 w-40 rounded-full border-4 border-dashed border-primary opacity-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
          Powered by <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">Advanced AI</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Real-time Sentiment Analysis",
              description: "Our AI analyzes thousands of tweets to gauge public sentiment around your favorite meme coins.",
              icon: (
                <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            },
            {
              title: "Automated Trading",
              description: "Set your risk tolerance and let our platform make trades based on sentiment thresholds.",
              icon: (
                <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            },
            {
              title: "Comprehensive Dashboard",
              description: "Monitor all your coins, trades, and market sentiment in one beautiful, intuitive interface.",
              icon: (
                <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )
            }
          ].map((feature, i) => (
            <div 
              key={i}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="bg-gradient-to-r from-primary/10 to-purple-500/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to start trading smarter?
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of traders who are using AI-powered sentiment analysis to gain an edge in the volatile world of meme coins.
          </p>
          <Link href="/dashboard">
            <a className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-lg">
              Get Started Now
            </a>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-2">
                <span className="text-primary-foreground font-bold text-sm">CW</span>
              </div>
              <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} Coin Whisperer. All rights reserved.</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}