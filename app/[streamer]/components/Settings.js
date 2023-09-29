import useSettings from "@/store/useSettings";
import {
  Button,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
} from "@chakra-ui/react";

export default function Settings({ modal }) {
  const settings = useSettings((state) => state.settings);
  const setSettings = useSettings((state) => state.setSettings);
  const saveSettings = useSettings((state) => state.saveSettings);

  const onSave = () => {
    saveSettings();
    modal.onClose();
  };

  return (
    <Modal isOpen={modal.isOpen} onClose={modal.onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
      </ModalContent>
      <ModalFooter>
        <Button onClick={onSave}>Save</Button>
      </ModalFooter>
    </Modal>
  );
}
