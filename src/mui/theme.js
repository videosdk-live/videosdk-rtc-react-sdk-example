import { createTheme, responsiveFontSizes } from "@material-ui/core/styles";

export default function generateMuiTheme(type, primary, secondary) {
  return responsiveFontSizes(
    createTheme({
      typography: {
        fontFamily: ["Inter", "Arial", "sans-serif"].join(","),
      },

      palette: {
        type: "dark",
        text: { primary: "#fff", secondary: "#9fa0a7" },
        success: { main: "#4aa96c" },
        error: { main: "#D32F2F" },
        divider: "#3B3A48",
        background: {
          default: "#212032",
          paper: "#333244",
        },
        primary: {
          main: "#1178F8",
        },
        secondary: {
          main: "#000",
          contrastText: "#fff",
        },
        common: { white: "#fff", black: "#000", sidePanel: "#3D3C4E" },
      },
      overrides: {
        MuiTypography: {
          root: { color: "#fff" },
        },
        MuiTooltip: {
          tooltip: {
            fontSize: "1rem",
            color: "#fff",
            backgroundColor: "#000",
          },
        },
      },
    })
  );
}

// Primary Background:#212032
// Secondary Background(Right Side Panel):#333244
// Right Side panel- card bg:#3D3C4E
// // Primary text color:#ffffff     =  used
// // Secondary text color:#9fa0a7    =  used
// // Success:#4aa96c    =  used
// // Error:#D32F2F    =  used
// Hint bg:#525D6A
// Hint Text:#ffffff
// // Divider:#3B3A48  ==  used
// Icon:#ffffff(not selected), #1C1F2E(selected)
