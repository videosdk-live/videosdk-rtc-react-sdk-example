import { useMediaQuery, useTheme } from "@material-ui/core";

/**
 *
 * @param {{
 * xs: number
 * sm: number
 * md: number
 * lg: number
 * xl: number
 * }} param0
 *
 */

const useResponsiveSize = ({ xs, sm, md, lg, xl }) => {
  const theme = useTheme();
  const gtThenXS = useMediaQuery(theme.breakpoints.up("xs"));
  const gtThenSM = useMediaQuery(theme.breakpoints.up("sm"));
  const gtThenMD = useMediaQuery(theme.breakpoints.up("md"));
  const gtThenLG = useMediaQuery(theme.breakpoints.up("lg"));
  const gtThenXL = useMediaQuery(theme.breakpoints.up("xl"));

  return gtThenXL
    ? xl
    : gtThenLG
    ? lg
    : gtThenMD
    ? md
    : gtThenSM
    ? sm
    : gtThenXS
    ? xs
    : lg;
};

export default useResponsiveSize;
