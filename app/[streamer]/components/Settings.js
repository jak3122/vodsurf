import {
  Button,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
} from "@chakra-ui/react";
import useSettings from "@/store/useSettings";
import useStreamer from "@/hooks/useStreamer";

export default function Settings({ modal }) {
  const settings = useSettings((state) => state.settings);
  const streamer = useStreamer();

  return (
    <Modal isOpen={modal.isOpen} onClose={modal.onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
      </ModalContent>
      <ModalFooter>
        <Button onClick={modal.onClose}>Done</Button>
      </ModalFooter>
    </Modal>
  );
}
