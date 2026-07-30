// vercel.mjs (Place exactly at your project root)

const config = {
    rewrites: [
      {
        source: "/api/:path*",
        // Pulls the backend URL dynamically from your Vercel Dashboard at build time
        destination: `http://110.225.254.51:4040/api/:path*`
      },
      {
        source: "/(.*)",
        destination: "/index.html"
      }
    ]
  };
  
  export default config;
