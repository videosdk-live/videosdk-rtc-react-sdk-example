import OutlineIconTextButton from "../components/buttons/OutlineIconTextButton";

export function TopBar() {
  const KickStartBTN = () => {
    const _handleClick = () => {
      window.open("https://app.videosdk.live/login", "_blank", "noreferrer");
    };

    return (
      <OutlineIconTextButton
        bgColor={"bg-purple-350"}
        buttonText={"Kickstart my project"}
        textColor={"text-white"}
        onClick={_handleClick}
        tooltipTitle={"Kickstart my project"}
      />
    );
  };
  return (
    <div className="md:flex md:items-center md:justify-end pt-2 lg:px-2 xl:px-6 pb-0 px-2 hidden">
      <KickStartBTN />
    </div>
  );
}
