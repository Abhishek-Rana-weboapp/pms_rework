// vercel.mjs (Place exactly at your project root)

const config = {
    rewrites: [
      {
        source: "/api/:path*",
        // Pulls the backend URL dynamically from your Vercel Dashboard at build time
        destination: `${process.env.VITE_API_URL || 'https://fallback-backend.com'}/api/:path*`
      },
      {
        source: "/(.*)",
        destination: "/index.html"
      }
    ]
  };
  
  export default config;
  