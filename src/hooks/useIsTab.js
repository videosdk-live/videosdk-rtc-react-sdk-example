import { useMediaQuery } from "react-responsive";

const useIsTab = () => {
  const isTablet = useMediaQuery({
    minWidth: 768,
    maxWidth: 1223, // 991,
  });

  return isTablet;
};

export default useIsTab;
