import { useMediaQuery } from "react-responsive";

const useIsMobile = (maxWidth) => {
  const isMobile = useMediaQuery({ maxWidth: maxWidth || 767 });
  return isMobile;
};

export default useIsMobile;
