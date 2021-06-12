module.exports = {
  mode: 'jit',
  purge: [
    './public/**/*.html',
    './src/**/*.{js,jsx,ts,tsx,vue}',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      transitionProperty: {
        'width': 'width'
      },
      width:{
        "360":"360px",
        "88": "22rem",
        "92": "23rem",
        "96": "24rem",
        "100": "25rem",
        "104": "26rem",
        "108": "27rem",
        "112": "28rem",
        "116": "29rem",
        "120": "30rem",
        "124": "31rem",
      },
      minWidth:{
        '84': "22rem"
      },
      maxWidth:{
        "97":"25rem"
      },
      minHeight:{
        "8":"32px",
      },
      colors: {
        "sd-base03-brblack":"#002B36",
        "sd-base02-black":"#073642",
        "sd-base01-brgreen":"#586e75",
        "sd-base00-bryellow":"#657b83",
        "sd-base0-brblue":"#839496",
        "sd-base1-brcyan":"#93a1a1",
        "sd-base2-white":"#eee8d5",
        "sd-base3-brwhite":"#fdf6e3",
        "sd-yellow":"#b58900",
        "sd-orange":"#cb4b16",
        "sd-red":"#d30102",
        "sd-magenta":"#d33682",
        "sd-violet":"#6c71c4",
        "sd-blue":"#268bd2",
        "sd-cyan":"#2aa198",
        "sd-green":"#859900"
      },
    },
    zIndex: {
      "-10":"-10"
    },
  },
  variants: {
    extend: {},
  },
}
