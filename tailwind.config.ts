const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        bg2: "var(--bg2)",
        bg3: "var(--bg3)",
        bg4: "var(--bg4)",
        bg5: "var(--bg5)",
        accent: "var(--accent)",
        orange: "var(--orange)",
        green: "var(--green)",
        red: "var(--red)",
        gold: "var(--gold)",
        txt: "var(--txt)",
        txt2: "var(--txt2)",
        txt3: "var(--txt3)"
      },
      borderRadius: {
        sm: "6px",
        md: "10px"
      },
      fontFamily: {
        barlow: ["Barlow", "sans-serif"],
        "barlow-condensed": ["Barlow Condensed", "sans-serif"]
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)"
      }
    }
  }
};

export default config;
