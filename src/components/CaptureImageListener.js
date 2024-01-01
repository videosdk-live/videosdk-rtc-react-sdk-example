import { useFile, usePubSub, useParticipant } from "@videosdk.live/react-sdk";

const CaptureImageListner = ({ localParticipantId }) => {
  const { captureImage } = useParticipant(localParticipantId);
  const { uploadBase64File } = useFile();

  // subscribe to receive request
  usePubSub("IMAGE_CAPTURE", {
    onMessageReceived: (message) => {
      _handleOnImageCaptureMessageReceived(message);
    },
  });

  const { publish: imageTransferPublish } = usePubSub("IMAGE_TRANSFER");

  const _handleOnImageCaptureMessageReceived = (message) => {
    try {
      if (message.senderId !== localParticipantId) {
        // capture and store image when message received
        captureAndStoreImage({ senderId: message.senderId });
      }
    } catch (err) {
      console.log("error on image capture", err);
    }
  };

  async function captureAndStoreImage({ senderId }) {
    // capture image
    const base64Data = await captureImage();

    const token = process.env.REACT_APP_VIDEOSDK_TOKEN;
    const fileName = "myCapture.jpeg"; // specify a name for image file with extension
    // upload image to videosdk storage system
    const fileUrl = await uploadBase64File({ base64Data, token, fileName });
    imageTransferPublish(fileUrl, { persist: false, sendOnly: [senderId] });
    console.log("fileUrl", fileUrl);
  }

  return <></>;
};

export default CaptureImageListner;
